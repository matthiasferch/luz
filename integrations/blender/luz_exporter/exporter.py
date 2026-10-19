import hashlib
import json
import math
import os
import struct
import tempfile
import time
from contextlib import contextmanager

import bmesh
import bpy
import mathutils
from bpy.props import BoolProperty, EnumProperty, FloatProperty, StringProperty
from bpy.types import Operator

FLOAT32_MAX = 3.4028234663852886e38
HALF_FLOAT_MAX = 65504.0
ENVIRONMENT_COMPILER_VERSION = 1
MODEL_SCHEMA_PATH = '../../schemas/model.schema.json'
SCENE_SCHEMA_PATH = '../../schemas/scene.schema.json'
FILE_RETRY_DELAYS = (0.01, 0.02, 0.04, 0.08, 0.16)
DEFAULT_ANIMATION_TOLERANCES = {
    'translation': 1e-5,
    'rotation': 5e-5,
    'scale': 1e-5,
}


# ---------------------------------------------------------------------------
# Export logic
# ---------------------------------------------------------------------------

# Coordinate conversion: Blender (X right, Y forward, Z up) -> Engine (X right, Y up, Z forward -Z)
# Maps: X -> X, Y -> -Z, Z -> Y
transformation_matrix = [[1, 0, 0], [0, 0, 1], [0, -1, 0]]


def transform_vector(matrix, vector):
    return (
        matrix[0][0] * vector[0] + matrix[0][1] * vector[1] + matrix[0][2] * vector[2],
        matrix[1][0] * vector[0] + matrix[1][1] * vector[1] + matrix[1][2] * vector[2],
        matrix[2][0] * vector[0] + matrix[2][1] * vector[1] + matrix[2][2] * vector[2],
    )


def ensure_extension(path, extension):
    return path if path.lower().endswith(extension) else bpy.path.ensure_ext(path, extension)


def export_status_path(scene_filepath):
    scene_filepath = ensure_extension(scene_filepath, '.scene.json')
    return scene_filepath[: -len('.scene.json')] + '.export.json'


def retry_file_operation(operation, *arguments):
    for attempt in range(len(FILE_RETRY_DELAYS) + 1):
        try:
            return operation(*arguments)
        except PermissionError as error:
            if getattr(error, 'winerror', None) not in (5, 32, 33) or attempt == len(FILE_RETRY_DELAYS):
                raise
            time.sleep(FILE_RETRY_DELAYS[attempt])


def remove_auxiliary_file(filepath):
    try:
        retry_file_operation(os.remove, filepath)
    except FileNotFoundError:
        pass
    except OSError as error:
        print(f'[luz Export] Could not remove temporary export file {filepath}: {error}')


def write_text_atomic(filepath, content):
    temporary_path = None
    try:
        with tempfile.NamedTemporaryFile(
            mode='w',
            encoding='utf-8',
            dir=os.path.dirname(os.path.abspath(filepath)),
            prefix=os.path.basename(filepath) + '.',
            suffix='.tmp',
            delete=False,
        ) as output_file:
            temporary_path = output_file.name
            output_file.write(content)
        retry_file_operation(os.replace, temporary_path, filepath)
    finally:
        if temporary_path is not None:
            remove_auxiliary_file(temporary_path)


def write_export_status(scene_filepath, stage, completed=None, total=None):
    status = {
        'status': 'exporting',
        'scene': os.path.basename(scene_filepath),
        'stage': stage,
    }
    if completed is not None and total is not None:
        status['completed'] = completed
        status['total'] = total
    try:
        status_directory = os.path.dirname(scene_filepath)
        if status_directory:
            os.makedirs(status_directory, exist_ok=True)
        write_text_atomic(export_status_path(scene_filepath), json.dumps(status, indent=2) + '\n')
    except OSError as error:
        print(f'[luz Export] Could not update export progress for {scene_filepath}: {error}')


def get_base_path(filepath):
    blend_path = bpy.data.filepath
    if blend_path:
        return os.path.dirname(blend_path)
    return os.path.dirname(filepath)


def round5(value):
    return round(float(value), 5)


def transform_quaternion(quaternion):
    axis_matrix = mathutils.Matrix(transformation_matrix)
    axis_matrix_inv = axis_matrix.transposed()

    rotated = axis_matrix @ quaternion.to_matrix() @ axis_matrix_inv
    rotated.normalize()
    rotated_quat = rotated.to_quaternion()
    return (
        rotated_quat.x,
        rotated_quat.y,
        rotated_quat.z,
        rotated_quat.w,
    )


def convert_transform(matrix_world, label='object'):
    # Convert the complete local matrix, including the scale axes.
    basis = mathutils.Matrix(transformation_matrix).to_4x4()
    matrix = basis @ matrix_world @ basis.inverted()
    location, rotation, scale = matrix.decompose()
    if any(not math.isfinite(value) for row in matrix for value in row) or min(abs(v) for v in scale) < 1e-8:
        raise RuntimeError(f"'{label}' has a singular/non-finite transform; apply or repair its scale before export")
    reconstructed = mathutils.Matrix.LocRotScale(location, rotation, scale)
    error = max(abs(matrix[row][col] - reconstructed[row][col]) for row in range(3) for col in range(3))
    magnitude = max(1.0, max(abs(matrix[row][col]) for row in range(3) for col in range(3)))
    if error > 1e-5 * magnitude:
        raise RuntimeError(
            f"'{label}' has local shear that cannot be represented by TRS (error {error:.6g}); apply the shear to the mesh or change its parenting"
        )
    return {
        'translation': list(location),
        'rotation': [rotation.x, rotation.y, rotation.z, rotation.w],
        'scale': list(scale),
    }


def make_animation_in_place(samples, matrix_to_world):
    axes = matrix_to_world.to_3x3() @ mathutils.Matrix(transformation_matrix).inverted()
    inverse_axes = axes.inverted()
    origin = mathutils.Vector(samples[0]['translation'])
    result = []
    for sample in samples:
        displacement = axes @ (mathutils.Vector(sample['translation']) - origin)
        displacement.x = 0
        displacement.y = 0
        result.append(dict(sample, translation=list(origin + inverse_axes @ displacement)))
    return result


def animation_interpolate(channel, first, second, factor):
    if channel == 'rotation':
        first_rotation = mathutils.Quaternion((first[3], *first[:3]))
        second_rotation = mathutils.Quaternion((second[3], *second[:3]))
        result = first_rotation.slerp(second_rotation, factor)
        return [result.x, result.y, result.z, result.w]
    return [value + (second[index] - value) * factor for index, value in enumerate(first)]


def animation_deviation(channel, actual, expected):
    if channel == 'rotation':
        magnitude = math.sqrt(sum(value * value for value in actual) * sum(value * value for value in expected))
        dot = abs(sum(value * expected[index] for index, value in enumerate(actual))) / magnitude
        return 2 * math.acos(min(1.0, max(0.0, dot)))
    if channel == 'translation':
        return math.sqrt(sum((value - expected[index]) ** 2 for index, value in enumerate(actual)))
    return max(abs(value - expected[index]) for index, value in enumerate(actual))


def reduce_animation_track(times, values, channel, tolerance):
    kept = {0, len(values) - 1}
    pending = [(0, len(values) - 1)]
    while pending:
        first, last = pending.pop()
        span = times[last] - times[first]
        worst_index, worst_deviation = None, tolerance
        for index in range(first + 1, last):
            factor = (times[index] - times[first]) / span
            expected = animation_interpolate(channel, values[first], values[last], factor)
            deviation = animation_deviation(channel, values[index], expected)
            if deviation > worst_deviation:
                worst_index, worst_deviation = index, deviation
        if worst_index is not None:
            kept.add(worst_index)
            pending.extend(((first, worst_index), (worst_index, last)))
    return [{'time': times[index], 'value': values[index]} for index in sorted(kept)]


def build_animation_tracks(samples, sample_rate, tolerances=None):
    duration = (len(samples) - 1) / sample_rate
    times = [index / sample_rate for index in range(len(samples))]
    identities = {'translation': [0, 0, 0], 'rotation': [0, 0, 0, 1], 'scale': [1, 1, 1]}
    tolerances = dict(DEFAULT_ANIMATION_TOLERANCES, **(tolerances or {}))
    if any(not math.isfinite(tolerance) or tolerance < 0 for tolerance in tolerances.values()):
        raise RuntimeError('Animation reduction tolerances must be finite and nonnegative')
    tracks = {}
    for channel in ('translation', 'rotation', 'scale'):
        values = [sample[channel] for sample in samples]
        if all(animation_deviation(channel, value, identities[channel]) <= tolerances[channel] for value in values):
            continue
        tracks[channel] = reduce_animation_track(times, values, channel, tolerances[channel])
    return {'duration': duration, 'tracks': tracks}


def transcode_data_texture(image, source_path):
    if str(getattr(image, 'source', '')) != 'FILE' or getattr(image, 'packed_file', None):
        return None
    if image_color_space(image, 'sRGB') != 'linear':
        print(f'[luz Export] Cannot automatically transcode color-managed texture: {source_path}')
        return None

    output_path = os.path.splitext(source_path)[0] + '.luz.png'
    if os.path.isfile(output_path) and os.path.getmtime(output_path) >= os.path.getmtime(source_path):
        return output_path

    scene = bpy.context.scene
    settings = scene.render.image_settings
    previous = (settings.file_format, settings.color_mode, settings.color_depth)
    try:
        settings.file_format = 'PNG'
        settings.color_mode = 'RGBA' if int(getattr(image, 'channels', 4)) >= 4 else 'RGB'
        settings.color_depth = '8'
        image.save_render(output_path, scene=scene)
    except (OSError, RuntimeError) as error:
        print(f'[luz Export] Could not transcode browser texture {source_path}: {error}')
        return None
    finally:
        settings.file_format, settings.color_mode, settings.color_depth = previous

    if not os.path.isfile(output_path):
        return None
    print(f'[luz Export] Transcoded browser-compatible data texture {output_path} from {source_path}')
    return output_path


def normalize_texture_path(path, base_path, image=None):
    tex_path = os.path.abspath(bpy.path.abspath(path))
    base_path = os.path.abspath(base_path)

    try:
        is_project_texture = os.path.normcase(os.path.commonpath((base_path, tex_path))) == os.path.normcase(base_path)
    except ValueError:
        is_project_texture = False

    if not is_project_texture:
        print(f'[luz Export] Skipping texture outside the asset directory: {tex_path}')
        return None

    supported_extensions = {'.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'}
    stem, extension = os.path.splitext(tex_path)
    if not os.path.isfile(tex_path) or extension.lower() not in supported_extensions:
        candidate_stems = [stem.replace('16_', '_'), stem]
        replacement = next(
            (
                candidate_stem + candidate_extension
                for candidate_stem in candidate_stems
                for candidate_extension in ('.png', '.jpg', '.jpeg', '.webp')
                if os.path.isfile(candidate_stem + candidate_extension)
            ),
            None,
        )

        if replacement:
            print(f'[luz Export] Using browser-compatible texture {replacement} instead of {tex_path}')
            tex_path = replacement
        elif os.path.isfile(tex_path) and image is not None:
            replacement = transcode_data_texture(image, tex_path)
            if replacement:
                tex_path = replacement
            else:
                print(f'[luz Export] Skipping unsupported browser texture: {tex_path}')
                return None
        else:
            print(f'[luz Export] Skipping missing or unsupported browser texture: {tex_path}')
            return None

    tex_path = os.path.relpath(tex_path, start=base_path)
    return tex_path.replace('\\', '/')


def image_color_space(image, fallback):
    settings = getattr(image, 'colorspace_settings', None)
    if not settings:
        return fallback

    if bool(getattr(settings, 'is_data', False)):
        return 'linear'

    name = str(getattr(settings, 'name', '')).lower()
    if 'srgb' in name:
        return 'sRGB'
    if any(label in name for label in ('non-color', 'linear', 'raw', 'data')):
        return 'linear'

    return fallback


def find_principled_shader(node_tree):
    outputs = [node for node in node_tree.nodes if node.type == 'OUTPUT_MATERIAL']
    active_outputs = [node for node in outputs if getattr(node, 'is_active_output', False)]

    for output in active_outputs + outputs:
        surface = output.inputs.get('Surface')
        if not surface or not surface.is_linked:
            continue

        pending = [(link.from_node, link.from_socket) for link in surface.links]
        visited = set()
        while pending:
            node, output_socket = pending.pop(0)
            if node in visited:
                continue
            visited.add(node)
            if node.type == 'BSDF_PRINCIPLED':
                return node

            if node.type == 'GROUP' and node.node_tree:
                output_name = getattr(output_socket, 'name', '')
                for group_output in node.node_tree.nodes:
                    if group_output.type != 'GROUP_OUTPUT':
                        continue
                    internal_socket = group_output.inputs.get(output_name)
                    if internal_socket:
                        pending.extend((link.from_node, link.from_socket) for link in internal_socket.links)

            for socket in node.inputs:
                pending.extend((link.from_node, link.from_socket) for link in socket.links)

    return next((node for node in iter_nodes_recursive(node_tree) if node.type == 'BSDF_PRINCIPLED'), None)


def iter_nodes_recursive(node_tree, visited_trees=None):
    visited_trees = visited_trees or set()
    if node_tree in visited_trees:
        return
    visited_trees.add(node_tree)

    for node in node_tree.nodes:
        yield node
        if node.type == 'GROUP' and node.node_tree:
            yield from iter_nodes_recursive(node.node_tree, visited_trees)


def find_upstream_nodes(socket, node_type):
    if not socket or not socket.is_linked:
        return []

    nodes = []
    pending = [(link.from_node, link.from_socket, 0) for link in socket.links]
    visited = set()

    while pending:
        node, output_socket, distance = pending.pop(0)
        if node in visited:
            continue
        visited.add(node)

        if node.type == node_type:
            nodes.append((node, distance))

        if node.type == 'GROUP' and node.node_tree:
            output_name = getattr(output_socket, 'name', '')
            for group_output in node.node_tree.nodes:
                if group_output.type != 'GROUP_OUTPUT':
                    continue
                internal_socket = group_output.inputs.get(output_name)
                if internal_socket:
                    pending.extend((link.from_node, link.from_socket, distance + 1) for link in internal_socket.links)

        for input_socket in node.inputs:
            pending.extend((link.from_node, link.from_socket, distance + 1) for link in input_socket.links)

    return nodes


def find_upstream_images(socket):
    return [(node, distance) for node, distance in find_upstream_nodes(socket, 'TEX_IMAGE') if node.image]


def image_search_text(node):
    image = getattr(node, 'image', None)
    return ' '.join(
        (
            getattr(node, 'name', ''),
            getattr(node, 'label', ''),
            getattr(image, 'name', ''),
            getattr(image, 'filepath', ''),
        )
    ).lower()


def find_image_for_map(node_tree, principled, socket_names, keywords):
    candidates = []
    for socket_name in socket_names:
        socket = principled.inputs.get(socket_name) if principled else None
        candidates.extend(find_upstream_images(socket))

    if candidates:
        candidates.sort(
            key=lambda candidate: (
                not any(keyword in image_search_text(candidate[0]) for keyword in keywords),
                candidate[1],
                candidate[0].name,
            )
        )
        return candidates[0][0].image

    # Some maps, notably ambient occlusion, have no Principled input. In that
    # case use semantic names/labels/file names across the complete node tree.
    named_candidates = [
        node
        for node in iter_nodes_recursive(node_tree)
        if node.type == 'TEX_IMAGE' and node.image and any(keyword in image_search_text(node) for keyword in keywords)
    ]
    named_candidates.sort(
        key=lambda node: (
            next(index for index, keyword in enumerate(keywords) if keyword in image_search_text(node)),
            node.name,
        )
    )
    return named_candidates[0].image if named_candidates else None


def find_normal_map(node_tree, principled):
    normal_socket = principled.inputs.get('Normal') if principled else None
    normal_nodes = find_upstream_nodes(normal_socket, 'NORMAL_MAP')
    normal_nodes.sort(key=lambda candidate: (candidate[1], candidate[0].name))

    for normal, _ in normal_nodes:
        color_images = find_upstream_images(normal.inputs.get('Color'))
        color_images.sort(key=lambda candidate: (candidate[1], candidate[0].name))
        if color_images:
            return color_images[0][0].image

    return find_image_for_map(
        node_tree,
        None,
        (),
        ('normal', 'nrm'),
    )


def find_bump_map(node_tree, principled):
    normal_socket = principled.inputs.get('Normal') if principled else None
    bump_nodes = find_upstream_nodes(normal_socket, 'BUMP')
    bump_nodes.sort(key=lambda candidate: (candidate[1], candidate[0].name))

    for bump, _ in bump_nodes:
        height_images = find_upstream_images(bump.inputs.get('Height'))
        height_images.sort(key=lambda candidate: (candidate[1], candidate[0].name))
        if not height_images:
            continue

        return height_images[0][0].image

    # Some imported materials leave their height images unconnected. Retain the
    # full-tree semantic fallback used for maps without a Principled input.
    image = find_image_for_map(
        node_tree,
        None,
        (),
        ('height', 'displacement', 'disp', 'bump'),
    )
    return image


def determine_alpha_mode(material, has_alpha, has_transparent_closure=False):
    explicit_mode = str(material.get('luz_alpha_mode', '')).lower()
    if explicit_mode in {'opaque', 'mask', 'blend'}:
        return explicit_mode

    if not has_alpha:
        return 'opaque'

    # A Transparent BSDF mixed by a continuous shader factor cannot be
    # represented by luz's binary alpha test. Blender's dithered mode preserves
    # fractional coverage, so use regular alpha blending as the closest WebGL
    # equivalent. Principled/image alpha remains eligible for Mask below, which
    # preserves foliage, grates, and other authored cutouts.
    if has_transparent_closure:
        return 'blend'

    render_method = getattr(material, 'surface_render_method', None)
    if render_method == 'BLENDED':
        return 'blend'
    if render_method == 'DITHERED':
        return 'mask'

    # Blender versions before Surface Render Method used blend_method.
    blend_method = getattr(material, 'blend_method', None)
    if blend_method == 'BLEND':
        return 'blend'
    if blend_method in {'CLIP', 'HASHED'}:
        return 'mask'

    return 'mask'


def determine_alpha_cutoff(material):
    explicit_cutoff = material.get('luz_alpha_cutoff')
    if explicit_cutoff is not None:
        return max(0.0, min(1.0, float(explicit_cutoff)))

    cutoff = float(getattr(material, 'alpha_threshold', 0.5))
    # Blender's Dithered mode commonly reports zero because it does not use a
    # hard cutoff itself. luz approximates dithering with a binary mask, where
    # zero would keep every texel and make the mask ineffective.
    return 0.5 if cutoff <= 0.0 else min(1.0, cutoff)


def socket_value(socket):
    value = getattr(socket, 'default_value', 0.0)
    if isinstance(value, (int, float)):
        result = float(value)
        if not math.isfinite(result):
            raise RuntimeError(f"Socket '{socket.name}' has a non-finite default value")
        return result
    try:
        result = [float(component) for component in list(value)[:4]]
    except TypeError:
        raise RuntimeError(f"Unsupported socket default on '{socket.name}'")
    if not all(math.isfinite(component) for component in result):
        raise RuntimeError(f"Socket '{socket.name}' has a non-finite default value")
    return result


def socket_named(sockets, *names):
    for name in names:
        matches = [socket for socket in sockets if socket.name == name or getattr(socket, 'identifier', None) == name]
        if matches:
            return next((socket for socket in matches if getattr(socket, 'enabled', True)), matches[0])
    return None


def active_group_output(node_tree):
    outputs = [node for node in node_tree.nodes if node.type == 'GROUP_OUTPUT']
    return next((node for node in outputs if getattr(node, 'is_active_output', False)), outputs[0] if outputs else None)


class MaterialGraphBuilder:
    SUPPORTED_PRINCIPLED = {
        'Base Color',
        'Alpha',
        'Normal',
        'Metallic',
        'Roughness',
        'Emission Color',
        'Emission',
        'Emission Strength',
        'Transmission Weight',
        'Transmission',
        'IOR',
        'Specular IOR Level',
        'Specular',
        'Subsurface Weight',
        'Subsurface Scale',
    }

    def __init__(self, material, base_path, available_attributes=None, active_uv_map=None):
        self.material = material
        self.base_path = base_path
        self.available_attributes = available_attributes
        self.active_uv_map = active_uv_map
        self.nodes = {}
        self.node_ids = {}
        self.resolving = set()
        self.principled_surfaces = {}
        self.glass_surfaces = set()
        self.missing_attributes_warned = set()
        self.raycast_nodes_warned = set()

    def error(self, node, socket, message):
        socket_name = getattr(socket, 'name', '?')
        raise RuntimeError(f"Material '{self.material.name}', node '{node.name}', socket '{socket_name}': {message}")

    @staticmethod
    def rna_identity(value):
        """Return a stable identity for a Blender RNA value across wrapper objects."""
        as_pointer = getattr(value, 'as_pointer', None)
        return as_pointer() if callable(as_pointer) else id(value)

    def node_id(self, node, group_stack):
        key = (
            self.rna_identity(node),
            tuple(self.rna_identity(group) for group in group_stack),
        )
        if key not in self.node_ids:
            self.node_ids[key] = f'n{len(self.node_ids)}'
        return self.node_ids[key]

    @staticmethod
    def output_name(node, output_socket):
        name = output_socket.name
        if node.type in {'TEX_NOISE', 'TEX_CHECKER', 'TEX_WAVE', 'TEX_GRADIENT'} and name in {'Fac', 'Factor'}:
            return 'Factor'
        return name

    def input(self, socket, group_stack):
        if socket is None:
            return {'value': 0.0}
        if socket.is_linked:
            link = socket.links[0]
            return self.output(link.from_node, link.from_socket, group_stack)
        return {'value': socket_value(socket)}

    def group_input(self, output_socket, group_stack):
        if not group_stack:
            self.error(output_socket.node, output_socket, 'group input is outside a group instance')
        group_node = group_stack[-1]
        external_socket = socket_named(group_node.inputs, output_socket.identifier, output_socket.name)
        if external_socket is None:
            self.error(group_node, output_socket, 'group input has no matching instance socket')
        return self.input(external_socket, group_stack[:-1])

    def group_output(self, node, output_socket, group_stack):
        group_output = active_group_output(node.node_tree)
        if group_output is None:
            self.error(node, output_socket, 'node group has no output node')
        internal_socket = socket_named(group_output.inputs, output_socket.identifier, output_socket.name)
        if internal_socket is None:
            self.error(node, output_socket, 'node group has no matching output socket')
        return self.input(internal_socket, group_stack + (node,))

    def static_menu_value(self, socket, group_stack, resolving=None):
        """Resolve an export-time menu choice through groups and reroutes."""
        if socket is None:
            return None
        if resolving is None:
            resolving = set()
        key = (
            self.rna_identity(socket),
            tuple(self.rna_identity(group) for group in group_stack),
        )
        if key in resolving:
            self.error(socket.node, socket, 'menu selection contains a cycle')
        resolving.add(key)
        try:
            if not socket.is_linked:
                value = getattr(socket, 'default_value', None)
                return value if isinstance(value, str) else None

            link = socket.links[0]
            node, output_socket = link.from_node, link.from_socket
            if node.type == 'REROUTE':
                return self.static_menu_value(node.inputs[0], group_stack, resolving)
            if node.type == 'GROUP_INPUT':
                if not group_stack:
                    self.error(node, output_socket, 'group input is outside a group instance')
                group_node = group_stack[-1]
                external = socket_named(group_node.inputs, output_socket.identifier, output_socket.name)
                if external is None:
                    self.error(group_node, output_socket, 'group input has no matching instance socket')
                return self.static_menu_value(external, group_stack[:-1], resolving)
            if node.type == 'GROUP':
                group_output = active_group_output(node.node_tree)
                internal = (
                    socket_named(group_output.inputs, output_socket.identifier, output_socket.name)
                    if group_output
                    else None
                )
                return self.static_menu_value(internal, group_stack + (node,), resolving)
            return None
        finally:
            resolving.remove(key)

    def image_surface(self, node):
        if not node.image:
            self.error(node, node.outputs[0] if node.outputs else node, 'image texture has no image')
        path = normalize_texture_path(node.image.filepath, self.base_path, node.image)
        if path is None:
            self.error(node, node.outputs[0] if node.outputs else node, 'image is unavailable to the web export')
        tiling = {
            'REPEAT': 'repeat',
            'EXTEND': 'none',
            'CLIP': 'none',
            'MIRROR': 'mirror',
        }.get(str(getattr(node, 'extension', 'REPEAT')), 'repeat')
        filtering = {
            'Closest': 'none',
            'Linear': 'bilinear',
            'Cubic': 'trilinear',
            'Smart': 'trilinear',
        }.get(str(getattr(node, 'interpolation', 'Linear')), 'bilinear')
        return {
            'path': path,
            'format': 'color',
            'colorSpace': image_color_space(node.image, 'sRGB'),
            'tiling': tiling,
            'filtering': filtering,
            'areMipmapsEnabled': filtering == 'trilinear',
        }

    def add_node(self, node, output_socket, group_stack):
        node_type = node.type
        inputs = {}
        properties = {}
        surface = None

        def add(target, *names):
            socket = socket_named(node.inputs, *names)
            if socket is not None:
                inputs[target] = self.input(socket, group_stack)

        if node_type == 'TEX_COORD':
            portable = 'textureCoordinate'
            if output_socket.name not in {'UV', 'Object', 'Generated'}:
                self.error(node, output_socket, 'only UV, Object, and Generated texture coordinates are supported')
        elif node_type == 'UVMAP':
            portable = 'textureCoordinate'
            if output_socket.name != 'UV':
                self.error(node, output_socket, 'only the UV output is supported')
            uv_map = str(getattr(node, 'uv_map', ''))
            if uv_map and self.active_uv_map is not None and uv_map != self.active_uv_map:
                self.error(
                    node,
                    output_socket,
                    f"UV map '{uv_map}' is not the active exported UV map '{self.active_uv_map}'",
                )
            resolved_uv_map = uv_map or self.active_uv_map
            if resolved_uv_map:
                properties = {'uvMap': resolved_uv_map}
        elif node_type == 'NEW_GEOMETRY':
            portable = 'geometry'
            if output_socket.name not in {'Incoming', 'Normal', 'Position'}:
                self.error(node, output_socket, 'only Incoming, Normal, and Position geometry outputs are supported')
        elif node_type == 'TEX_IMAGE':
            portable = 'imageTexture'
            vector_socket = socket_named(node.inputs, 'Vector')
            if vector_socket is not None and vector_socket.is_linked:
                inputs['vector'] = self.input(vector_socket, group_stack)
            surface = self.image_surface(node)
        elif node_type in {'VALUE', 'RGB'}:
            portable = 'value' if node_type == 'VALUE' else 'rgb'
            inputs['value'] = {'value': socket_value(output_socket)}
        elif node_type == 'MAPPING':
            portable = 'mapping'
            vector_type = str(getattr(node, 'vector_type', 'POINT'))
            add('vector', 'Vector')
            add('location', 'Location')
            add('rotation', 'Rotation')
            scale_socket = socket_named(node.inputs, 'Scale')
            if scale_socket is not None:
                if scale_socket.is_linked:
                    inputs['scale'] = self.input(scale_socket, group_stack)
                else:
                    scale = [float(component) for component in list(scale_socket.default_value)[:3]]
                    if any(math.isnan(component) for component in scale):
                        self.error(node, scale_socket, 'scale contains NaN')
                    if any(math.isinf(component) for component in scale):
                        if vector_type != 'TEXTURE':
                            self.error(node, scale_socket, 'scale contains an infinite value')
                        scale = [
                            math.copysign(FLOAT32_MAX, component) if math.isinf(component) else component
                            for component in scale
                        ]
                        print(
                            f"[luz Export] Warning: material '{self.material.name}' Mapping node "
                            f"'{node.name}' uses Blender's infinite Texture scale; clamping it to float32 range"
                        )
                    inputs['scale'] = {'value': scale}
            properties = {'vectorType': vector_type}
        elif node_type == 'MATH':
            portable = 'math'
            if len(node.inputs) > 0:
                inputs['value1'] = self.input(node.inputs[0], group_stack)
            if len(node.inputs) > 1:
                inputs['value2'] = self.input(node.inputs[1], group_stack)
            properties = {'operation': node.operation, 'isClampingEnabled': bool(getattr(node, 'use_clamp', False))}
        elif node_type in {'VECTOR_MATH', 'VECT_MATH'}:
            portable = 'vectorMath'
            if len(node.inputs) > 0:
                inputs['vector1'] = self.input(node.inputs[0], group_stack)
            if node.operation == 'SCALE':
                add('scale', 'Scale')
            elif len(node.inputs) > 1:
                inputs['vector2'] = self.input(node.inputs[1], group_stack)
            properties = {'operation': node.operation}
        elif node_type in {'MIX', 'MIX_RGB'}:
            portable = 'mix'
            add('factor', 'Factor', 'Fac')
            add('a', 'A', 'Color1')
            add('b', 'B', 'Color2')
            properties = {
                'blendType': getattr(node, 'blend_type', 'MIX'),
                'isResultClampingEnabled': bool(getattr(node, 'clamp_result', getattr(node, 'use_clamp', False))),
                'dataType': str(getattr(node, 'data_type', 'RGBA')) if node_type == 'MIX' else 'RGBA',
            }
            if properties['dataType'] not in {'FLOAT', 'VECTOR', 'RGBA'}:
                self.error(node, output_socket, f"Mix data type '{properties['dataType']}' is unsupported")
        elif node_type == 'HUE_SAT':
            portable = 'hueSaturation'
            add('hue', 'Hue')
            add('saturation', 'Saturation')
            add('value', 'Value')
            add('factor', 'Fac')
            add('color', 'Color')
        elif node_type == 'BRIGHTCONTRAST':
            portable = 'brightContrast'
            add('color', 'Color')
            add('bright', 'Bright')
            add('contrast', 'Contrast')
        elif node_type == 'GAMMA':
            portable = 'gamma'
            add('color', 'Color')
            add('gamma', 'Gamma')
        elif node_type == 'INVERT':
            portable = 'invert'
            add('factor', 'Factor', 'Fac')
            add('color', 'Color')
        elif node_type == 'RGBTOBW':
            portable = 'rgbToBW'
            add('color', 'Color')
        elif node_type == 'SEPARATE_COLOR':
            portable = 'separateColor'
            mode = str(getattr(node, 'mode', 'RGB'))
            if mode != 'RGB':
                self.error(node, output_socket, f"Separate Color mode '{mode}' is unsupported")
            add('color', 'Color')
            properties = {'mode': mode}
        elif node_type == 'CLAMP':
            portable = 'clamp'
            clamp_type = str(getattr(node, 'clamp_type', 'MINMAX'))
            if clamp_type != 'MINMAX':
                self.error(node, output_socket, f"Clamp mode '{clamp_type}' is unsupported")
            add('value', 'Value')
            add('minimum', 'Min')
            add('maximum', 'Max')
            properties = {'clampType': clamp_type}
        elif node_type == 'MAP_RANGE':
            portable = 'mapRange'
            data_type = str(getattr(node, 'data_type', 'FLOAT'))
            interpolation = str(getattr(node, 'interpolation_type', 'LINEAR'))
            if data_type != 'FLOAT' or interpolation not in {'LINEAR', 'SMOOTHSTEP'}:
                self.error(
                    node,
                    output_socket,
                    'only linear and smooth-step float Map Range nodes are supported',
                )
            add('value', 'Value')
            add('fromMinimum', 'From Min')
            add('fromMaximum', 'From Max')
            add('toMinimum', 'To Min')
            add('toMaximum', 'To Max')
            properties = {
                'dataType': data_type,
                'interpolation': interpolation,
                'isClampingEnabled': bool(getattr(node, 'clamp', True)),
            }
        elif node_type == 'VALTORGB':
            portable = 'colorRamp'
            add('factor', 'Fac', 'Factor')
            ramp = node.color_ramp
            color_mode = str(getattr(ramp, 'color_mode', 'RGB'))
            elements = sorted(ramp.elements, key=lambda element: element.position)
            # Hue interpolation has no effect when every stop is achromatic:
            # RGB, HSV, and HSL all reduce to interpolation of the same scalar
            # lightness/value plus alpha. Normalize that exact case to luz's
            # RGB ramp instead of rejecting Blender assets which happen to
            # retain HSL/HSV mode for an entirely grayscale ramp.
            is_achromatic = all(
                max(float(component) for component in element.color[:3])
                - min(float(component) for component in element.color[:3])
                <= 1e-6
                for element in elements
            )
            if color_mode != 'RGB' and not is_achromatic:
                self.error(node, output_socket, f"ColorRamp color mode '{color_mode}' is unsupported")
            interpolation = str(getattr(ramp, 'interpolation', 'LINEAR'))
            if interpolation not in {'CONSTANT', 'LINEAR', 'EASE', 'B_SPLINE'}:
                self.error(node, output_socket, f"ColorRamp interpolation '{interpolation}' is unsupported")
            if len(elements) < 2:
                self.error(node, output_socket, 'ColorRamp must have at least two elements')
            for index, element in enumerate(elements):
                inputs[f'position{index}'] = {'value': float(element.position)}
                inputs[f'color{index}'] = {'value': [float(component) for component in element.color]}
            properties = {
                'interpolation': interpolation,
                'elementCount': len(elements),
            }
        elif node_type == 'CURVE_RGB':
            portable = 'rgbCurves'
            add('factor', 'Factor', 'Fac')
            add('color', 'Color')
            mapping = node.mapping
            mapping.update()
            for channel in mapping.curves[:3]:
                points = [(float(point.location[0]), float(point.location[1])) for point in channel.points]
                if len(points) != 2 or any(
                    abs(actual - expected) > 1e-6
                    for point, expected_point in zip(points, ((0.0, 0.0), (1.0, 1.0)))
                    for actual, expected in zip(point, expected_point)
                ):
                    self.error(node, output_socket, 'per-channel RGB curves are unsupported')
            combined = sorted(mapping.curves[3].points, key=lambda point: point.location[0])
            if len(combined) < 2 or len(combined) > 32:
                self.error(node, output_socket, 'combined RGB curve must contain between 2 and 32 points')
            for index, point in enumerate(combined):
                inputs[f'position{index}'] = {'value': float(point.location[0])}
                inputs[f'value{index}'] = {'value': float(point.location[1])}
            properties = {
                'pointCount': len(combined),
                'extensionMode': str(getattr(mapping, 'extend', 'HORIZONTAL')),
            }
        elif node_type == 'SEPXYZ':
            portable = 'separateXYZ'
            add('vector', 'Vector')
        elif node_type == 'COMBXYZ':
            portable = 'combineXYZ'
            add('x', 'X')
            add('y', 'Y')
            add('z', 'Z')
        elif node_type == 'TEX_NOISE':
            portable = 'noiseTexture'
            dimensions = str(getattr(node, 'noise_dimensions', '3D'))
            if dimensions not in {'3D', '4D'}:
                self.error(node, output_socket, f"Noise Texture dimensions '{dimensions}' are unsupported")
            add('vector', 'Vector')
            if dimensions == '4D':
                add('w', 'W')
            add('scale', 'Scale')
            add('detail', 'Detail')
            add('roughness', 'Roughness')
            add('lacunarity', 'Lacunarity')
            add('distortion', 'Distortion')
            properties = {'dimensions': dimensions}
        elif node_type == 'TEX_WAVE':
            portable = 'waveTexture'
            wave_type = str(getattr(node, 'wave_type', 'BANDS'))
            bands_direction = str(getattr(node, 'bands_direction', 'X'))
            rings_direction = str(getattr(node, 'rings_direction', 'X'))
            wave_profile = str(getattr(node, 'wave_profile', 'SIN'))
            if wave_type not in {'BANDS', 'RINGS'}:
                self.error(node, output_socket, f"Wave type '{wave_type}' is unsupported")
            if bands_direction not in {'X', 'Y', 'Z', 'DIAGONAL'}:
                self.error(node, output_socket, f"Wave bands direction '{bands_direction}' is unsupported")
            if rings_direction not in {'X', 'Y', 'Z', 'SPHERICAL'}:
                self.error(node, output_socket, f"Wave rings direction '{rings_direction}' is unsupported")
            if wave_profile != 'SIN':
                self.error(node, output_socket, f"Wave profile '{wave_profile}' is unsupported")
            add('vector', 'Vector')
            add('scale', 'Scale')
            add('distortion', 'Distortion')
            add('detail', 'Detail')
            add('detailScale', 'Detail Scale')
            add('detailRoughness', 'Detail Roughness')
            add('phaseOffset', 'Phase Offset')
            properties = {
                'waveType': wave_type,
                'bandsDirection': bands_direction,
                'ringsDirection': rings_direction,
                'waveProfile': wave_profile,
            }
        elif node_type == 'TEX_GRADIENT':
            portable = 'gradientTexture'
            gradient_type = str(getattr(node, 'gradient_type', 'LINEAR'))
            if gradient_type != 'LINEAR':
                self.error(node, output_socket, f"Gradient type '{gradient_type}' is unsupported")
            add('vector', 'Vector')
            properties = {'gradientType': gradient_type}
        elif node_type == 'AMBIENT_OCCLUSION':
            portable = 'ambientOcclusion'
            add('color', 'Color')
            add('distance', 'Distance')
            normal_socket = socket_named(node.inputs, 'Normal')
            if normal_socket is not None and normal_socket.is_linked:
                inputs['normal'] = self.input(normal_socket, group_stack)
            properties = {
                'inside': bool(getattr(node, 'inside', False)),
                'localOnly': bool(getattr(node, 'only_local', False)),
            }
            print(
                f"[luz Export] Warning: material '{self.material.name}' uses Ambient Occlusion node "
                f"'{node.name}'; luz uses its renderer AO and exports this node as unoccluded"
            )
        elif node_type == 'TEX_CHECKER':
            portable = 'checkerTexture'
            add('vector', 'Vector')
            add('color1', 'Color1')
            add('color2', 'Color2')
            add('scale', 'Scale')
        elif node_type == 'TEX_VORONOI':
            portable = 'voronoiTexture'
            dimensions = str(getattr(node, 'voronoi_dimensions', '3D'))
            feature = str(getattr(node, 'feature', 'F1'))
            distance = str(getattr(node, 'distance', 'EUCLIDEAN'))
            supported_configuration = (
                (
                    dimensions == '3D'
                    and feature == 'F1'
                    and distance in {'EUCLIDEAN', 'MANHATTAN', 'CHEBYCHEV', 'MINKOWSKI'}
                )
                or (dimensions == '3D' and feature == 'DISTANCE_TO_EDGE')
                or (dimensions == '4D' and feature == 'F1' and distance == 'EUCLIDEAN')
                or (dimensions == '4D' and feature == 'DISTANCE_TO_EDGE')
            )
            if not supported_configuration:
                self.error(
                    node,
                    output_socket,
                    f'Voronoi configuration {dimensions}/{feature}/{distance} is unsupported',
                )
            add('vector', 'Vector')
            if dimensions == '4D':
                add('w', 'W')
            add('scale', 'Scale')
            add('randomness', 'Randomness')
            if dimensions == '3D' and distance == 'MINKOWSKI':
                add('exponent', 'Exponent')
            properties = {
                'dimensions': dimensions,
                'feature': feature,
                'distance': distance,
                'isNormalizationEnabled': bool(getattr(node, 'normalize', False)),
            }
        elif node_type == 'FRESNEL':
            portable = 'fresnel'
            add('indexOfRefraction', 'IOR')
            normal_socket = socket_named(node.inputs, 'Normal')
            if normal_socket is not None and normal_socket.is_linked:
                inputs['normal'] = self.input(normal_socket, group_stack)
        elif node_type == 'LAYER_WEIGHT':
            portable = 'layerWeight'
            add('blend', 'Blend')
            normal_socket = socket_named(node.inputs, 'Normal')
            if normal_socket is not None and normal_socket.is_linked:
                inputs['normal'] = self.input(normal_socket, group_stack)
        elif node_type == 'VECTOR_ROTATE':
            portable = 'vectorRotate'
            rotation_type = str(getattr(node, 'rotation_type', 'AXIS_ANGLE'))
            if rotation_type != 'AXIS_ANGLE':
                self.error(node, output_socket, f"Vector Rotate mode '{rotation_type}' is unsupported")
            add('vector', 'Vector')
            add('center', 'Center')
            add('axis', 'Axis')
            add('angle', 'Angle')
            properties = {'isInversionEnabled': bool(getattr(node, 'invert', False))}
        elif node_type == 'NORMAL_MAP':
            portable = 'normalMap'
            space = str(getattr(node, 'space', 'TANGENT'))
            if space not in {'TANGENT', 'OBJECT', 'WORLD'}:
                self.error(node, output_socket, f"Normal Map space '{space}' is unsupported")
            add('strength', 'Strength')
            add('color', 'Color')
            properties = {'space': space}
        elif node_type == 'BUMP':
            portable = 'bump'
            add('strength', 'Strength')
            add('distance', 'Distance')
            add('height', 'Height')
            normal_socket = socket_named(node.inputs, 'Normal')
            if normal_socket is not None and normal_socket.is_linked:
                inputs['normal'] = self.input(normal_socket, group_stack)
            properties = {'isInversionEnabled': bool(getattr(node, 'invert', False))}
        else:
            self.error(node, output_socket, f"unsupported contributing node type '{node_type}'")

        data = {'type': portable}
        if inputs:
            data['inputs'] = inputs
        if properties:
            data['properties'] = properties
        if surface:
            data['surface'] = surface
        return data

    def output(self, node, output_socket, group_stack=()):
        if node.type == 'REROUTE':
            return self.input(node.inputs[0], group_stack)
        if node.type == 'GROUP':
            return self.group_output(node, output_socket, group_stack)
        if node.type == 'GROUP_INPUT':
            return self.group_input(output_socket, group_stack)
        if node.type == 'FRAME':
            self.error(node, output_socket, 'frame nodes cannot produce values')
        if node.type == 'ATTRIBUTE':
            attribute_name = str(getattr(node, 'attribute_name', ''))
            attribute_type = str(getattr(node, 'attribute_type', 'GEOMETRY'))
            if (
                attribute_type == 'GEOMETRY'
                and self.available_attributes is not None
                and attribute_name not in self.available_attributes
            ):
                warning_key = (self.rna_identity(node), attribute_name)
                if warning_key not in self.missing_attributes_warned:
                    print(
                        f"[luz Export] Warning: material '{self.material.name}' Attribute node "
                        f"'{node.name}' references missing geometry attribute '{attribute_name}'; "
                        "exporting Blender's zero default"
                    )
                    self.missing_attributes_warned.add(warning_key)
                return {'value': socket_value(output_socket)}
            self.error(
                node,
                output_socket,
                f"geometry attribute '{attribute_name}' cannot be represented by the luz v1 vertex format",
            )
        if node.type == 'MATERIAL_RAYCAST':
            warning_key = self.rna_identity(node)
            if warning_key not in self.raycast_nodes_warned:
                print(
                    f"[luz Export] Warning: material '{self.material.name}' Raycast node "
                    f"'{node.name}' cannot trace scene geometry in luz material graphs; "
                    "exporting Blender's no-hit result"
                )
                self.raycast_nodes_warned.add(warning_key)
            if output_socket.name == 'Hit Distance':
                return self.input(socket_named(node.inputs, 'Length'), group_stack)
            if output_socket.name in {'Is Hit', 'Self Hit'}:
                return {'value': 0.0}
            if output_socket.name in {'Hit Position', 'Hit Normal'}:
                return {'value': [0.0, 0.0, 0.0]}
            self.error(node, output_socket, 'Raycast attribute outputs are unsupported')

        output_name = self.output_name(node, output_socket)
        key = (
            self.rna_identity(node),
            tuple(self.rna_identity(group) for group in group_stack),
            output_name,
        )
        if key in self.resolving:
            self.error(node, output_socket, 'material graph contains a cycle')
        self.resolving.add(key)
        node_id = self.node_id(node, group_stack)
        if node_id not in self.nodes:
            self.nodes[node_id] = self.add_node(node, output_socket, group_stack)
        self.resolving.remove(key)
        return {'node': node_id, 'output': output_name}

    @staticmethod
    def principled_closure_count(closure):
        if closure is None:
            return 0
        if closure['type'] == 'principled':
            return 1
        if closure['type'] in {'mix', 'add'}:
            return MaterialGraphBuilder.principled_closure_count(
                closure['firstClosure']
            ) + MaterialGraphBuilder.principled_closure_count(closure['secondClosure'])
        return 0

    @staticmethod
    def closure_count(closure, closure_type):
        if closure is None:
            return 0
        if closure['type'] == closure_type:
            return 1
        if closure['type'] in {'mix', 'add'}:
            return MaterialGraphBuilder.closure_count(
                closure['firstClosure'], closure_type
            ) + MaterialGraphBuilder.closure_count(closure['secondClosure'], closure_type)
        return 0

    def surface_closure(self, socket, group_stack=(), allow_unsupported=False):
        if socket is None or not socket.is_linked:
            if allow_unsupported:
                return None
            raise RuntimeError(f"Material '{self.material.name}' has an unlinked shader closure")
        link = socket.links[0]
        node, output_socket = link.from_node, link.from_socket
        if node.type == 'BSDF_PRINCIPLED':
            closure = {'type': 'principled'}
            self.principled_surfaces[id(closure)] = (node, group_stack, closure)
            return closure
        if node.type == 'BSDF_GLASS':
            closure = {'type': 'principled'}
            closure_id = id(closure)
            self.principled_surfaces[closure_id] = (node, group_stack, closure)
            self.glass_surfaces.add(closure_id)
            return closure
        if node.type in {'BSDF_GLOSSY', 'BSDF_ANISOTROPIC'}:
            color = socket_named(node.inputs, 'Color')
            roughness = socket_named(node.inputs, 'Roughness')
            normal = socket_named(node.inputs, 'Normal')
            closure = {
                'type': 'glossy',
                'color': self.input(color, group_stack) if color is not None else {'value': [1.0, 1.0, 1.0, 1.0]},
                'roughness': self.input(roughness, group_stack) if roughness is not None else {'value': 0.0},
            }
            if normal is not None and normal.is_linked:
                normal_input = self.input(normal, group_stack)
                normal_value = normal_input.get('value')
                is_zero_sentinel = (
                    isinstance(normal_value, list)
                    and len(normal_value) >= 3
                    and sum(component * component for component in normal_value[:3]) < 1e-12
                )
                if not is_zero_sentinel:
                    closure['normal'] = normal_input
            return closure
        if node.type == 'BSDF_TRANSPARENT':
            color = socket_named(node.inputs, 'Color')
            return {
                'type': 'transparent',
                'color': self.input(color, group_stack) if color is not None else {'value': [1.0, 1.0, 1.0, 1.0]},
            }
        if node.type == 'EMISSION':
            color = socket_named(node.inputs, 'Color')
            strength = socket_named(node.inputs, 'Strength')
            return {
                'type': 'emission',
                'color': self.input(color, group_stack) if color is not None else {'value': [1.0, 1.0, 1.0, 1.0]},
                'strength': self.input(strength, group_stack) if strength is not None else {'value': 1.0},
            }
        if node.type == 'REROUTE':
            return self.surface_closure(node.inputs[0], group_stack, allow_unsupported)
        if node.type == 'GROUP':
            group_output = active_group_output(node.node_tree)
            internal = (
                socket_named(group_output.inputs, output_socket.identifier, output_socket.name)
                if group_output
                else None
            )
            return self.surface_closure(internal, group_stack + (node,), allow_unsupported)
        if node.type == 'GROUP_INPUT':
            if not group_stack:
                self.error(node, output_socket, 'group input is outside a group instance')
            group_node = group_stack[-1]
            external = socket_named(group_node.inputs, output_socket.identifier, output_socket.name)
            if external is None:
                self.error(group_node, output_socket, 'group input has no matching instance socket')
            return self.surface_closure(external, group_stack[:-1], allow_unsupported)
        if node.type == 'MENU_SWITCH':
            if getattr(node, 'data_type', None) != 'SHADER':
                self.error(node, output_socket, 'only shader Menu Switch closures are supported')
            menu_socket = socket_named(node.inputs, 'Menu')
            selection = self.static_menu_value(menu_socket, group_stack)
            if selection is None:
                self.error(
                    node,
                    menu_socket or output_socket,
                    'shader Menu Switch selection must resolve to a static menu value',
                )
            branch = socket_named(node.inputs, selection)
            if branch is None or branch is menu_socket:
                self.error(node, menu_socket or output_socket, f"Menu Switch has no branch '{selection}'")
            return self.surface_closure(branch, group_stack, allow_unsupported)
        if node.type in {'MIX_SHADER', 'ADD_SHADER'}:
            closure_type = 'mix' if node.type == 'MIX_SHADER' else 'add'
            node_label = 'Mix Shader' if node.type == 'MIX_SHADER' else 'Add Shader'
            shader_inputs = [candidate for candidate in node.inputs if candidate.type == 'SHADER']
            if len(shader_inputs) != 2:
                self.error(node, output_socket, f'{node_label} must have two shader branches')
            closures = [self.surface_closure(candidate, group_stack, True) for candidate in shader_inputs]
            supported = [closure for closure in closures if closure is not None]
            if not supported:
                if allow_unsupported:
                    return None
                self.error(node, output_socket, f'{node_label} has no supported shader branch')
            if len(supported) == 1:
                ignored = [
                    candidate.links[0].from_node
                    for candidate, closure in zip(shader_inputs, closures)
                    if closure is None and candidate.is_linked
                ]
                if ignored:
                    descriptions = ', '.join(f"'{candidate.name}' ({candidate.type})" for candidate in ignored)
                    print(
                        f"[luz Export] Warning: material '{self.material.name}' ignores unsupported "
                        f'{node_label} branch {descriptions}'
                    )
                return supported[0]
            if closure_type == 'add':
                return {
                    'type': 'add',
                    'firstClosure': closures[0],
                    'secondClosure': closures[1],
                }
            factor_socket = socket_named(node.inputs, 'Fac', 'Factor')
            if factor_socket is None:
                factor_socket = node.inputs[0]
            return {
                'type': 'mix',
                'factor': self.input(factor_socket, group_stack),
                'firstClosure': closures[0],
                'secondClosure': closures[1],
            }
        if allow_unsupported:
            return None
        self.error(node, output_socket, f"unsupported contributing shader closure '{node.type}'")

    def volume_closure(self, socket, group_stack=()):
        if socket is None or not socket.is_linked:
            return None

        link = socket.links[0]
        node, output_socket = link.from_node, link.from_socket
        key = (
            'volume',
            self.rna_identity(node),
            self.rna_identity(output_socket),
            tuple(self.rna_identity(group) for group in group_stack),
        )
        if key in self.resolving:
            self.error(node, output_socket, 'material volume graph contains a cycle')
        self.resolving.add(key)
        try:
            if node.type == 'VOLUME_ABSORPTION':
                color = socket_named(node.inputs, 'Color')
                density = socket_named(node.inputs, 'Density')
                return {
                    'type': 'absorption',
                    'color': self.input(color, group_stack) if color is not None else {'value': [1.0, 1.0, 1.0, 1.0]},
                    'density': self.input(density, group_stack) if density is not None else {'value': 0.0},
                }
            if node.type == 'REROUTE':
                return self.volume_closure(node.inputs[0], group_stack)
            if node.type == 'GROUP':
                group_output = active_group_output(node.node_tree)
                internal = (
                    socket_named(group_output.inputs, output_socket.identifier, output_socket.name)
                    if group_output
                    else None
                )
                if internal is None:
                    self.error(node, output_socket, 'node group has no matching volume output socket')
                return self.volume_closure(internal, group_stack + (node,))
            if node.type == 'GROUP_INPUT':
                if not group_stack:
                    self.error(node, output_socket, 'group input is outside a group instance')
                group_node = group_stack[-1]
                external = socket_named(group_node.inputs, output_socket.identifier, output_socket.name)
                if external is None:
                    self.error(group_node, output_socket, 'group input has no matching volume instance socket')
                return self.volume_closure(external, group_stack[:-1])

            self.error(node, output_socket, f"unsupported contributing volume closure '{node.type}'")
        finally:
            self.resolving.remove(key)

    def build(self):
        if not self.material.node_tree:
            color = [float(value) for value in self.material.diffuse_color]
            return (
                {
                    'version': 1,
                    'nodes': {},
                    'outputs': self.default_outputs(color),
                    'surface': {'type': 'principled'},
                },
                False,
                False,
                False,
            )

        outputs = [node for node in self.material.node_tree.nodes if node.type == 'OUTPUT_MATERIAL']
        material_output = next(
            (node for node in outputs if getattr(node, 'is_active_output', False)), outputs[0] if outputs else None
        )
        surface = self.surface_closure(material_output.inputs.get('Surface') if material_output else None)
        volume = self.volume_closure(material_output.inputs.get('Volume') if material_output else None)

        supported = {
            'baseColor': ('Base Color',),
            'alpha': ('Alpha',),
            'normal': ('Normal',),
            'metallic': ('Metallic',),
            'roughness': ('Roughness',),
            'emissionColor': ('Emission Color', 'Emission'),
            'emissionStrength': ('Emission Strength',),
            'transmission': ('Transmission Weight', 'Transmission'),
            'indexOfRefraction': ('IOR',),
            'specularLevel': ('Specular IOR Level', 'Specular'),
            'subsurfaceWeight': ('Subsurface Weight',),
            'subsurfaceScale': ('Subsurface Scale',),
        }
        defaults = self.default_outputs()
        graph_outputs = dict(defaults)
        principled = None
        group_stack = ()
        principled_parameters = {}
        if self.principled_surfaces:
            # Resolve every Principled leaf before adding synthetic nodes. This keeps
            # generated IDs deterministic and prevents them from colliding with IDs
            # assigned while traversing linked inputs.
            for closure_id, (leaf, leaf_stack, _) in self.principled_surfaces.items():
                if closure_id in self.glass_surfaces:
                    color = socket_named(leaf.inputs, 'Color')
                    roughness = socket_named(leaf.inputs, 'Roughness')
                    index_of_refraction = socket_named(leaf.inputs, 'IOR')
                    normal = socket_named(leaf.inputs, 'Normal')
                    parameters = dict(defaults)
                    parameters.update(
                        {
                            'baseColor': self.input(color, leaf_stack)
                            if color is not None
                            else {'value': [1.0, 1.0, 1.0, 1.0]},
                            'normal': self.input(normal, leaf_stack)
                            if normal is not None and normal.is_linked
                            else defaults['normal'],
                            'metallic': {'value': 0.0},
                            'roughness': self.input(roughness, leaf_stack) if roughness is not None else {'value': 0.0},
                            'transmission': {'value': 1.0},
                            'indexOfRefraction': self.input(index_of_refraction, leaf_stack)
                            if index_of_refraction is not None
                            else {'value': 1.5},
                        }
                    )
                else:
                    parameters = {}
                    for target, names in supported.items():
                        socket = socket_named(leaf.inputs, *names)
                        if target == 'normal' and socket is not None and not socket.is_linked:
                            parameters[target] = defaults[target]
                        else:
                            parameters[target] = (
                                self.input(socket, leaf_stack) if socket is not None else defaults[target]
                            )
                principled_parameters[closure_id] = parameters

                supported_inputs = (
                    {'Color', 'Roughness', 'IOR', 'Normal'}
                    if closure_id in self.glass_surfaces
                    else self.SUPPORTED_PRINCIPLED
                )
                for socket in leaf.inputs:
                    if socket.name not in supported_inputs and socket.is_linked:
                        print(
                            f"[luz Export] Warning: material '{self.material.name}' ignores unsupported "
                            f"{leaf.name} input '{socket.name}' from node '{socket.links[0].from_node.name}'"
                        )

            principled, group_stack, _ = next(iter(self.principled_surfaces.values()))

            def add_parameter_mix(factor, first, second, target, path):
                node_id = f'n{len(self.node_ids)}'
                self.node_ids[('principledMix', path, target)] = node_id
                data_type = (
                    'VECTOR'
                    if target == 'normal'
                    else ('RGBA' if target in {'baseColor', 'emissionColor'} else 'FLOAT')
                )
                self.nodes[node_id] = {
                    'type': 'mix',
                    'inputs': {'factor': factor, 'a': first, 'b': second},
                    'properties': {
                        'blendType': 'MIX',
                        'isResultClampingEnabled': False,
                        'dataType': data_type,
                    },
                }
                return {'node': node_id, 'output': 'Result'}

            def flatten_principled(closure, path=()):
                if closure['type'] == 'principled':
                    return {'type': 'principled'}, principled_parameters[id(closure)]
                if closure['type'] not in {'mix', 'add'}:
                    return closure, None

                first_closure, first_parameters = flatten_principled(closure['firstClosure'], path + (0,))
                second_closure, second_parameters = flatten_principled(closure['secondClosure'], path + (1,))
                if first_parameters is not None and second_parameters is not None:
                    if closure['type'] == 'add':
                        raise RuntimeError(
                            f"Material '{self.material.name}' adds multiple Principled BSDF closures "
                            'whose parameters cannot share one luz material sample'
                        )
                    mixed_parameters = {
                        target: add_parameter_mix(
                            closure['factor'], first_parameters[target], second_parameters[target], target, path
                        )
                        for target in supported
                    }
                    if first_closure['type'] == 'principled' and second_closure['type'] == 'principled':
                        return {'type': 'principled'}, mixed_parameters
                    return {
                        'type': 'mix',
                        'factor': closure['factor'],
                        'firstClosure': first_closure,
                        'secondClosure': second_closure,
                    }, mixed_parameters

                flattened = {
                    'type': closure['type'],
                    'firstClosure': first_closure,
                    'secondClosure': second_closure,
                }
                if closure['type'] == 'mix':
                    flattened['factor'] = closure['factor']
                return flattened, first_parameters or second_parameters

            surface, flattened_parameters = flatten_principled(surface)
            if flattened_parameters is not None:
                graph_outputs.update(flattened_parameters)
            if len(self.principled_surfaces) > 1:
                print(
                    f"[luz Export] Warning: material '{self.material.name}' flattens "
                    f'{len(self.principled_surfaces)} mixed Principled BSDF closures into one supported parameter set'
                )

        ao_image = (
            find_image_for_map(
                self.material.node_tree,
                principled,
                (),
                ('ambientocclusion', 'ambient_occlusion', 'occlusion', '_ao', ' ao'),
            )
            if principled is not None
            else None
        )
        if ao_image:
            ao_path = normalize_texture_path(ao_image.filepath, self.base_path, ao_image)
            if ao_path:
                node_id = f'n{len(self.node_ids)}'
                self.node_ids[('ambientOcclusion',)] = node_id
                self.nodes[node_id] = {
                    'type': 'imageTexture',
                    'surface': {
                        'path': ao_path,
                        'format': 'color',
                        'colorSpace': image_color_space(ao_image, 'linear'),
                        'tiling': 'repeat',
                        'filtering': 'trilinear',
                        'areMipmapsEnabled': True,
                    },
                }
                graph_outputs['occlusion'] = {'node': node_id, 'output': 'Color'}
            else:
                graph_outputs['occlusion'] = defaults['occlusion']
        else:
            graph_outputs['occlusion'] = defaults['occlusion']

        principled_leaves = [value[:2] for value in self.principled_surfaces.values()]
        alpha_sockets = [socket_named(leaf.inputs, 'Alpha') for leaf, _ in principled_leaves]
        transmission_sockets = [
            socket_named(leaf.inputs, 'Transmission Weight', 'Transmission') for leaf, _ in principled_leaves
        ]
        has_transparent_closure = self.closure_count(surface, 'transparent') > 0
        has_alpha = has_transparent_closure or any(
            socket and (socket.is_linked or float(socket.default_value) < 1.0) for socket in alpha_sockets
        )
        has_transmission = bool(self.glass_surfaces) or any(
            socket and (socket.is_linked or float(socket.default_value) > 0.0) for socket in transmission_sockets
        )
        graph = {
            'version': 1,
            'nodes': self.nodes,
            'outputs': graph_outputs,
            'surface': surface,
        }
        if volume is not None:
            graph['volume'] = volume
        return graph, has_alpha, has_transmission, has_transparent_closure

    @staticmethod
    def default_outputs(base_color=None):
        return {
            'baseColor': {'value': base_color or [0.8, 0.8, 0.8, 1.0]},
            'alpha': {'value': 1.0},
            'normal': {'value': [0.0, 0.0, 1.0]},
            'metallic': {'value': 0.0},
            'roughness': {'value': 0.5},
            'occlusion': {'value': 1.0},
            'emissionColor': {'value': [0.0, 0.0, 0.0, 1.0]},
            'emissionStrength': {'value': 1.0},
            'transmission': {'value': 0.0},
            'indexOfRefraction': {'value': 1.45},
            'specularLevel': {'value': 0.5},
            'subsurfaceWeight': {'value': 0.0},
            'subsurfaceScale': {'value': 0.01},
        }


def extract_material(material, base_path, available_attributes=None, active_uv_map=None):
    graph, has_alpha, has_transmission, has_transparent_closure = MaterialGraphBuilder(
        material, base_path, available_attributes, active_uv_map
    ).build()
    material_data = {'graph': graph}
    alpha_mode = determine_alpha_mode(material, has_alpha, has_transparent_closure)
    if alpha_mode != 'opaque':
        material_data['alphaMode'] = alpha_mode
    if alpha_mode == 'mask':
        material_data['alphaCutoff'] = round5(determine_alpha_cutoff(material))
    if has_transmission:
        material_data['blendMode'] = 'transmissive'

    # Preserve explicitly authored transmission controls even while the graph's
    # transmission input is temporarily zero. This keeps Blender metadata
    # stable while artists iterate, without treating the metadata itself as an
    # instruction to route an opaque material through the transmission pass.
    if has_transmission or 'luz_transmission_depth' in material:
        material_data['transmissionDepth'] = round5(max(0.0, float(material.get('luz_transmission_depth', 0.05))))

    if 'luz_transmission_edge_fade' in material:
        transmission_edge_fade = max(0.0, float(material.get('luz_transmission_edge_fade', 0.0)))
        material_data['transmissionEdgeFade'] = round5(transmission_edge_fade)

    if not has_transmission and ('luz_transmission_depth' in material or 'luz_transmission_edge_fade' in material):
        print(
            f"[luz Export] Warning: material '{material.name}' has transmission metadata "
            'but its exported transmission is zero; the values are preserved but the '
            'material will not use the transmission pass'
        )
    double_sided = material.get('luz_double_sided', False)
    if not isinstance(double_sided, bool):
        raise RuntimeError(f"Material '{material.name}' property 'luz_double_sided' must be a boolean")
    if double_sided:
        material_data['isDoubleSided'] = True
    return material_data


def triangulate_mesh(mesh):
    triangulated_mesh = bmesh.new()
    triangulated_mesh.from_mesh(mesh)
    bmesh.ops.triangulate(triangulated_mesh, faces=triangulated_mesh.faces)
    triangulated_mesh.to_mesh(mesh)
    triangulated_mesh.free()


def validate_object_action_dependencies(obj, action, key):
    dependencies = []
    parent = obj.parent
    while parent:
        dependencies.append(parent)
        parent = parent.parent
    for constraint in obj.constraints:
        if constraint.mute:
            continue
        for prop in constraint.bl_rna.properties:
            if prop.type == 'POINTER':
                target = getattr(constraint, prop.identifier, None)
                if isinstance(target, bpy.types.Object):
                    dependencies.append(target)
    for driver in obj.animation_data.drivers:
        if driver.mute:
            continue
        if driver.data_path not in {
            'location',
            'rotation_euler',
            'rotation_quaternion',
            'rotation_axis_angle',
            'scale',
        }:
            raise RuntimeError(f"'{key}', action '{action.name}': unsupported driven property; use Timeline")
        for variable in driver.driver.variables:
            for target in variable.targets:
                if target.id and target.id != obj:
                    dependencies.append(target.id)
    visited = set()
    while dependencies:
        dependency = dependencies.pop()
        if dependency in visited:
            continue
        visited.add(dependency)
        animation = getattr(dependency, 'animation_data', None)
        if animation and (animation.action or len(animation.nla_tracks) or len(animation.drivers)):
            raise RuntimeError(
                f"'{key}', action '{action.name}': animated dependency '{dependency.name}' requires Timeline export"
            )
        if isinstance(dependency, bpy.types.Object):
            if dependency.parent:
                dependencies.append(dependency.parent)
            for constraint in dependency.constraints:
                if not constraint.mute:
                    dependencies.extend(
                        getattr(constraint, prop.identifier)
                        for prop in constraint.bl_rna.properties
                        if prop.type == 'POINTER'
                        and isinstance(getattr(constraint, prop.identifier, None), bpy.types.Object)
                    )


@contextmanager
def isolated_object_action(context, obj, action, slot):
    frame, subframe = context.scene.frame_current, context.scene.frame_subframe
    states = []
    try:
        for item in bpy.data.objects:
            animation = item.animation_data
            if animation:
                states.append(
                    (
                        item,
                        {
                            channel: tuple(getattr(item, channel))
                            for channel in (
                                'location',
                                'rotation_euler',
                                'rotation_quaternion',
                                'rotation_axis_angle',
                                'scale',
                            )
                        },
                        animation.action,
                        animation.action_slot,
                        animation.use_nla,
                        animation.action_blend_type,
                        animation.action_influence,
                        [(driver, driver.mute) for driver in animation.drivers],
                    )
                )
                animation.action = None
                animation.use_nla = False
                if item != obj:
                    for driver in animation.drivers:
                        driver.mute = True
        animation = obj.animation_data
        animation.action = action
        animation.action_slot = slot
        animation.action_blend_type = 'REPLACE'
        animation.action_influence = 1.0
        context.view_layer.update()
        yield
    finally:
        for item, transforms, previous_action, previous_slot, use_nla, blend_type, influence, drivers in states:
            animation = item.animation_data
            animation.action = previous_action
            if previous_action:
                animation.action_slot = previous_slot
            animation.use_nla = use_nla
            animation.action_blend_type = blend_type
            animation.action_influence = influence
            for driver, mute in drivers:
                driver.mute = mute
            for channel, values in transforms.items():
                setattr(item, channel, values)
        context.scene.frame_set(frame, subframe=subframe)
        context.view_layer.update()


@contextmanager
def isolated_armature_action(context, armature, action, slot):
    animation = armature.animation_data
    previous = (
        animation.action,
        animation.action_slot,
        animation.use_nla,
        animation.action_blend_type,
        animation.action_influence,
    )
    frame, subframe = context.scene.frame_current, context.scene.frame_subframe
    poses = [(bone, bone.matrix_basis.copy()) for bone in armature.pose.bones]
    try:
        animation.action = None
        animation.use_nla = False
        animation.action = action
        animation.action_slot = slot
        animation.action_blend_type = 'REPLACE'
        animation.action_influence = 1.0
        for bone, _ in poses:
            bone.matrix_basis = mathutils.Matrix.Identity(4)
        context.view_layer.update()
        yield
    finally:
        animation.action = None
        animation.action = previous[0]
        if previous[0]:
            animation.action_slot = previous[1]
        animation.use_nla = previous[2]
        animation.action_blend_type = previous[3]
        animation.action_influence = previous[4]
        for bone, matrix in poses:
            bone.matrix_basis = matrix
        context.scene.frame_set(frame, subframe=subframe)
        context.view_layer.update()


class SkeletalExport:
    def __init__(self, obj, depsgraph):
        self.obj = obj
        modifiers = [modifier for modifier in obj.modifiers if modifier.type == 'ARMATURE']
        self.modifier = modifiers[0]
        self.armature = self.modifier.object
        reason = None
        if len(modifiers) != 1:
            reason = 'multiple Armature modifiers'
        elif self.armature is None:
            reason = 'an Armature modifier without an armature'
        elif not self.modifier.show_viewport:
            reason = 'a disabled Armature modifier'
        elif self.modifier.use_deform_preserve_volume:
            reason = 'Preserve Volume'
        elif self.modifier.use_bone_envelopes or not self.modifier.use_vertex_groups:
            reason = 'envelope deformation or disabled vertex groups'
        elif self.modifier.vertex_group:
            reason = 'an Armature modifier vertex-group mask'
        elif obj.data.shape_keys:
            reason = 'shape keys'
        elif any(bone.bbone_segments > 1 for bone in self.armature.data.bones):
            reason = 'segmented B-Bone deformation'
        elif any(
            modifier.show_viewport for modifier in list(obj.modifiers)[list(obj.modifiers).index(self.modifier) + 1 :]
        ):
            reason = 'enabled post-armature modifiers'
        if reason:
            raise RuntimeError(f"'{obj.name}' uses {reason}; disable Export animation for a static snapshot")
        self.offset = self.get_offset(depsgraph)
        self.world_matrix = self.obj.evaluated_get(depsgraph).matrix_world.copy()
        self.bones = []

        def collect(bone):
            self.bones.append(bone)
            for child in sorted(bone.children, key=lambda bone: bone.name):
                collect(child)

        for bone in sorted(
            (bone for bone in self.armature.data.bones if bone.parent is None), key=lambda bone: bone.name
        ):
            collect(bone)
        if not self.bones:
            raise RuntimeError(f"'{obj.name}' has an empty skeleton")
        self.indices = {bone.name: index for index, bone in enumerate(self.bones)}
        self.groups = {
            group.index: self.indices[group.name]
            for group in obj.vertex_groups
            if group.name in self.indices and self.armature.data.bones[group.name].use_deform
        }
        self.samples = {bone.name: [] for bone in self.bones}
        self.reduced_vertices = set()

    def get_offset(self, depsgraph):
        try:
            return (
                self.obj.evaluated_get(depsgraph).matrix_world.inverted()
                @ self.armature.evaluated_get(depsgraph).matrix_world
            )
        except ValueError as error:
            raise RuntimeError(f"'{self.obj.name}' has a singular mesh-to-armature transform") from error

    @contextmanager
    def undeformed(self, context):
        previous = self.modifier.show_viewport
        try:
            self.modifier.show_viewport = False
            context.view_layer.update()
            yield context.evaluated_depsgraph_get()
        finally:
            self.modifier.show_viewport = previous
            context.view_layer.update()

    def influences(self, vertex):
        influences = sorted(
            (
                (self.groups[group.group], float(group.weight))
                for group in vertex.groups
                if group.group in self.groups and group.weight > 0
            ),
            key=lambda item: (-item[1], item[0]),
        )
        if len(influences) > 4:
            self.reduced_vertices.add(vertex.index)
        influences = influences[:4]
        total = sum(weight for _, weight in influences)
        indices = [index for index, _ in influences]
        weights = [weight / total for _, weight in influences]
        return tuple(indices + [0] * (4 - len(indices))), tuple(weights + [0.0] * (4 - len(weights)))

    def skeleton(self):
        basis = mathutils.Matrix(transformation_matrix).to_4x4()
        bones = []
        for bone in self.bones:
            matrix = basis @ self.offset @ bone.matrix_local @ basis.inverted()
            if not all(math.isfinite(value) for row in matrix for value in row) or matrix.determinant() == 0:
                raise RuntimeError(f"'{self.obj.name}', bone '{bone.name}' has an invalid bind matrix")
            bones.append(
                {
                    'name': bone.name,
                    'parent': bone.parent.name if bone.parent else '',
                    'head': list(transform_vector(transformation_matrix, self.offset @ bone.head_local)),
                    'tail': list(transform_vector(transformation_matrix, self.offset @ bone.tail_local)),
                    'bindMatrix': [matrix[row][column] for column in range(4) for row in range(4)],
                }
            )
        return {'bones': bones}

    def sample(self, depsgraph, frame):
        offset = self.get_offset(depsgraph)
        if max(abs(offset[row][column] - self.offset[row][column]) for row in range(4) for column in range(4)) > 1e-5:
            raise RuntimeError(f"'{self.obj.name}' has an animated mesh-to-armature offset at frame {frame}")
        poses = self.armature.evaluated_get(depsgraph).pose.bones
        for bone in self.bones:
            matrix = self.offset @ poses[bone.name].matrix
            if bone.parent:
                matrix = (self.offset @ poses[bone.parent.name].matrix).inverted() @ matrix
            pose = convert_transform(matrix, f'{self.obj.name}, bone {bone.name}, frame {frame}')
            samples = self.samples[bone.name]
            if samples and sum(a * b for a, b in zip(samples[-1]['rotation'], pose['rotation'])) < 0:
                pose['rotation'] = [-value for value in pose['rotation']]
            samples.append(pose)

    def clip(self, sample_rate, tolerances, in_place=False):
        tolerances = dict(DEFAULT_ANIMATION_TOLERANCES, **(tolerances or {}))
        if any(not math.isfinite(value) or value < 0 for value in tolerances.values()):
            raise RuntimeError('Animation reduction tolerances must be finite and nonnegative')
        keyframes = {}
        for name, samples in self.samples.items():
            if in_place and self.armature.data.bones[name].parent is None:
                samples = make_animation_in_place(samples, self.world_matrix)
            times = [index / sample_rate for index in range(len(samples))]
            tracks = {}
            for channel in ('translation', 'rotation', 'scale'):
                values = [pose[channel] for pose in samples]
                tracks[channel] = reduce_animation_track(times, values, channel, tolerances[channel])
            keyframes[name] = tracks
        if self.reduced_vertices:
            print(
                f'[luz Export] {self.obj.name}: reduced {len(self.reduced_vertices)} vertices to their strongest four influences'
            )
        return {'duration': times[-1], 'isAutoplayEnabled': True, 'keyframes': keyframes}


def build_meshes_from_object(obj, depsgraph, apply_modifiers, skeleton=None):
    mesh_obj = obj.evaluated_get(depsgraph) if apply_modifiers else obj
    mesh = mesh_obj.to_mesh()

    try:
        triangulate_mesh(mesh)

        meshes = {}
        vertices_by_key = {}
        indices_by_key = {}
        vertex_indices_by_key = {}
        material_by_key = {}
        weights_by_key = {}

        material_slots = list(obj.material_slots)

        def mesh_key(polygon):
            mat_name = None
            if material_slots and 0 <= polygon.material_index < len(material_slots):
                mat = material_slots[polygon.material_index].material
                if mat:
                    mat_name = mat.name
            key = mat_name or f'{obj.name}_mat{polygon.material_index}'
            return key, mat_name

        for polygon in mesh.polygons:
            key, mat_name = mesh_key(polygon)
            vertices = vertices_by_key.setdefault(key, [])
            indices = indices_by_key.setdefault(key, [])
            vertex_indices = vertex_indices_by_key.setdefault(key, {})
            if mat_name and key not in material_by_key:
                material_by_key[key] = mat_name

            for i, vert_index in enumerate(polygon.vertices):
                vertex = mesh.vertices[vert_index]

                position = transform_vector(transformation_matrix, vertex.co)
                normal_vec = vertex.normal if polygon.use_smooth else polygon.normal
                normal = transform_vector(transformation_matrix, normal_vec)

                if mesh.uv_layers.active is not None:
                    loop_index = polygon.loop_indices[i]
                    texture_coordinates = mesh.uv_layers.active.data[loop_index].uv
                else:
                    texture_coordinates = (0.0, 0.0)

                emitted_vertex = (
                    float(position[0]),
                    float(position[1]),
                    float(position[2]),
                    float(normal[0]),
                    float(normal[1]),
                    float(normal[2]),
                    float(texture_coordinates[0]),
                    float(texture_coordinates[1]),
                )
                influences = skeleton.influences(vertex) if skeleton else None
                vertex_key = (emitted_vertex, influences)
                vertex_index = vertex_indices.get(vertex_key)
                if vertex_index is None:
                    vertex_index = len(vertices)
                    vertex_indices[vertex_key] = vertex_index
                    vertices.append(emitted_vertex)
                    if influences:
                        weights_by_key.setdefault(key, []).append(
                            {'vertex': vertex_index, 'indices': influences[0], 'weights': influences[1]}
                        )
                indices.append(vertex_index)

    finally:
        mesh_obj.to_mesh_clear()

    for key, verts in vertices_by_key.items():
        if not verts:
            continue

        mesh_data = {
            'topology': 'triangles',
            '_vertex_data': verts,
            '_index_data': indices_by_key[key],
            'boundingBox': {
                'minimum': [min(vertex[axis] for vertex in verts) for axis in range(3)],
                'maximum': [max(vertex[axis] for vertex in verts) for axis in range(3)],
            },
        }

        if key in material_by_key:
            mesh_data['material'] = material_by_key[key]
        if skeleton:
            mesh_data['weights'] = weights_by_key[key]

        meshes[key] = mesh_data

    return meshes


def mesh_attribute_info_from_object(obj, depsgraph, apply_modifiers):
    mesh_obj = obj.evaluated_get(depsgraph) if apply_modifiers else obj
    mesh = mesh_obj.to_mesh()
    try:
        active_uv_map = mesh.uv_layers.active.name if mesh.uv_layers.active is not None else None
        return {attribute.name for attribute in mesh.attributes}, active_uv_map
    finally:
        mesh_obj.to_mesh_clear()


def build_model_from_object(obj, depsgraph, apply_modifiers, base_path, skeleton=None):
    materials = {}
    meshes = {}
    available_attributes, active_uv_map = mesh_attribute_info_from_object(obj, depsgraph, apply_modifiers)

    for material_slot in obj.material_slots:
        mat = material_slot.material
        if not mat or mat.name in materials:
            continue
        materials[mat.name] = extract_material(mat, base_path, available_attributes, active_uv_map)

    meshes.update(build_meshes_from_object(obj, depsgraph, apply_modifiers, skeleton))

    model_data = {
        '$schema': MODEL_SCHEMA_PATH,
        'type': 'model',
        'materials': materials,
        'meshes': meshes,
    }

    return model_data


def determine_model_component_path(model_filepath):
    normalized = os.path.normpath(model_filepath)
    marker = os.sep + 'assets' + os.sep
    if marker in normalized:
        subpath = normalized.split(marker, 1)[1]
        return './assets/' + subpath.replace('\\', '/')
    return os.path.basename(model_filepath)


def preserve_existing_filename_case(path):
    """Use the exact on-disk spelling of an existing case-insensitive match.

    Windows accepts a case-only object rename without changing the directory
    entry. Webpack's in-memory filesystem is case-sensitive, so scene URLs must
    match the spelling copied from disk.
    """
    directory = os.path.dirname(path) or os.curdir
    desired_name = os.path.basename(path)
    if not os.path.isdir(directory):
        return path

    entries = [entry.name for entry in os.scandir(directory) if entry.is_file()]
    if desired_name in entries:
        return path

    matches = [name for name in entries if name.casefold() == desired_name.casefold()]
    if len(matches) > 1:
        raise RuntimeError(f"Multiple files in '{directory}' differ only by case from '{desired_name}'")
    return os.path.join(directory, matches[0]) if matches else path


def indent_block(text, spaces):
    prefix = ' ' * spaces
    return text.replace('\n', '\n' + prefix)


def align4(data):
    while len(data) % 4:
        data.append(0)


def write_geometry_file(model_path, model_data):
    geometry_path = model_path[: -len('.model.json')] + '.geometry'
    binary = bytearray(16)

    for mesh_data in model_data.get('meshes', {}).values():
        vertices = mesh_data.pop('_vertex_data')
        indices = mesh_data.pop('_index_data')

        align4(binary)
        vertex_offset = len(binary)
        for vertex in vertices:
            binary.extend(struct.pack('<8f', *vertex))

        mesh_data['vertices'] = {
            'byteOffset': vertex_offset,
            'count': len(vertices),
            'byteStride': 32,
            'attributes': {
                'position': {'format': 'float32x3', 'byteOffset': 0},
                'normal': {'format': 'float32x3', 'byteOffset': 12},
                'textureCoordinates': {'format': 'float32x2', 'byteOffset': 24},
            },
        }

        align4(binary)
        index_offset = len(binary)
        index_format = 'uint16' if max(indices, default=0) <= 0xFFFF else 'uint32'
        pack_format = '<H' if index_format == 'uint16' else '<I'
        for index in indices:
            binary.extend(struct.pack(pack_format, index))

        mesh_data['indices'] = {
            'byteOffset': index_offset,
            'count': len(indices),
            'format': index_format,
        }

    struct.pack_into('<4sHHII', binary, 0, b'LUZG', 1, 0, len(binary), 0)
    with open(geometry_path, 'wb') as geometry_file:
        geometry_file.write(binary)

    model_data['geometry'] = {
        'uri': os.path.basename(geometry_path),
        'byteLength': len(binary),
    }


def write_model_file(model_path, model_data):
    try:
        model_json = json.dumps(model_data, indent=2, allow_nan=False)
    except ValueError as error:
        raise RuntimeError(f"Model '{os.path.basename(model_path)}' contains a non-finite JSON value") from error
    with open(model_path, 'w', encoding='utf-8') as f:
        f.write(model_json)
        f.write('\n')


def write_animation_files(model_path, model_data):
    directory = os.path.join(os.path.dirname(os.path.dirname(model_path)), 'animations')
    references = {}
    for name, clip in model_data.get('animations', {}).items():
        document = {'type': 'skeletalAnimation', 'schemaVersion': 1, **clip}
        canonical = json.dumps(document, sort_keys=True, separators=(',', ':'), allow_nan=False)
        digest = hashlib.sha256(canonical.encode('utf-8')).hexdigest()
        path = os.path.join(directory, digest + '.animation.json')
        os.makedirs(directory, exist_ok=True)
        document = {'$schema': '../../schemas/skeletal-animation.schema.json', **document}
        contents = json.dumps(document, indent=2, allow_nan=False) + '\n'
        if not os.path.isfile(path):
            write_text_atomic(path, contents)
        else:
            with open(path, encoding='utf-8') as existing:
                if json.load(existing) != document:
                    raise RuntimeError(f"Animation content does not match its digest: '{path}'")
        references[name] = document_reference(path, model_path)
    if 'animations' in model_data:
        model_data['animations'] = references


def linked_node(socket):
    if socket is None or not socket.is_linked:
        return None, None
    link = socket.links[0]
    node, output = link.from_node, link.from_socket
    while node.type == 'REROUTE':
        if not node.inputs or not node.inputs[0].is_linked:
            return None, None
        link = node.inputs[0].links[0]
        node, output = link.from_node, link.from_socket
    return node, output


def environment_world_source(world):
    if world is None or not getattr(world, 'use_nodes', False) or world.node_tree is None:
        return None

    outputs = [node for node in world.node_tree.nodes if node.type == 'OUTPUT_WORLD']
    output = next(
        (node for node in outputs if getattr(node, 'is_active_output', False)),
        outputs[0] if outputs else None,
    )
    if output is None:
        return None

    background, background_output = linked_node(socket_named(output.inputs, 'Surface'))
    if background is None:
        return None
    if background.type != 'BACKGROUND':
        raise RuntimeError(
            f"World '{world.name}', node '{background.name}', socket '{background_output.name}': "
            'exported environments must use a Background shader'
        )

    color_socket = socket_named(background.inputs, 'Color')
    environment, environment_output = linked_node(color_socket)
    if environment is None:
        return None
    if environment.type != 'TEX_ENVIRONMENT':
        raise RuntimeError(
            f"World '{world.name}', node '{environment.name}', socket '{environment_output.name}': "
            'bake the contributing World color graph to an EXR or HDR Environment Texture first'
        )
    if str(getattr(environment, 'projection', 'EQUIRECTANGULAR')) != 'EQUIRECTANGULAR':
        raise RuntimeError(
            f"World '{world.name}', node '{environment.name}': only equirectangular environments are supported"
        )
    if environment.image is None:
        raise RuntimeError(f"World '{world.name}', node '{environment.name}': no environment image is selected")

    source_path = os.path.abspath(bpy.path.abspath(environment.image.filepath))
    if not source_path or not os.path.isfile(source_path):
        raise RuntimeError(f"World '{world.name}', node '{environment.name}': environment image is unavailable")
    if os.path.splitext(source_path)[1].lower() not in {'.exr', '.hdr'}:
        raise RuntimeError(
            f"World '{world.name}', node '{environment.name}': use an EXR or HDR image for image-based lighting"
        )

    strength_socket = socket_named(background.inputs, 'Strength')
    if strength_socket is not None and strength_socket.is_linked:
        raise RuntimeError(
            f"World '{world.name}', node '{background.name}', socket 'Strength': linked strength is unsupported"
        )
    strength = max(0.0, socket_value(strength_socket)) if strength_socket is not None else 1.0

    rotation = 0.0
    vector_socket = socket_named(environment.inputs, 'Vector')
    coordinate, coordinate_output = linked_node(vector_socket)
    if coordinate is not None and coordinate.type == 'MAPPING':
        location = socket_value(socket_named(coordinate.inputs, 'Location'))
        scale = socket_value(socket_named(coordinate.inputs, 'Scale'))
        mapping_rotation = socket_value(socket_named(coordinate.inputs, 'Rotation'))
        if any(abs(value) > 1e-6 for value in location) or any(abs(value - 1.0) > 1e-6 for value in scale):
            raise RuntimeError(
                f"World '{world.name}', node '{coordinate.name}': environment Mapping location and scale must remain unchanged"
            )
        if abs(mapping_rotation[0]) > 1e-6 or abs(mapping_rotation[1]) > 1e-6:
            raise RuntimeError(
                f"World '{world.name}', node '{coordinate.name}': only Z-axis environment rotation is supported"
            )
        # Blender rotates around Z; luz rotates its Y-up environment in the
        # opposite sampling direction.
        rotation = -float(mapping_rotation[2])
        coordinate, coordinate_output = linked_node(socket_named(coordinate.inputs, 'Vector'))

    if coordinate is not None and (
        coordinate.type != 'TEX_COORD' or coordinate_output.name not in {'Generated', 'Normal'}
    ):
        raise RuntimeError(
            f"World '{world.name}', node '{coordinate.name}', socket '{coordinate_output.name}': "
            'Environment Texture coordinates must come from Generated/Normal coordinates, optionally through Mapping'
        )

    return {
        'image': environment.image,
        'sourcePath': source_path,
        'strength': strength,
        'rotation': rotation,
    }


def environment_size(world, key, default, minimum, maximum):
    value = int(world.get(key, default))
    value = max(minimum, min(maximum, value))
    # KTX mip chains and cubemap filtering are simplest and deterministic at
    # power-of-two dimensions.
    return 1 << round(math.log2(value))


def cube_directions(numpy, size):
    coordinate = (numpy.arange(size, dtype=numpy.float32) + 0.5) * (2.0 / size) - 1.0
    horizontal, vertical = numpy.meshgrid(coordinate, coordinate)
    one = numpy.ones_like(horizontal)
    faces = numpy.stack(
        [
            numpy.stack([one, -vertical, -horizontal], axis=-1),
            numpy.stack([-one, -vertical, horizontal], axis=-1),
            numpy.stack([horizontal, one, vertical], axis=-1),
            numpy.stack([horizontal, -one, -vertical], axis=-1),
            numpy.stack([horizontal, -vertical, one], axis=-1),
            numpy.stack([-horizontal, -vertical, -one], axis=-1),
        ]
    )
    return faces / numpy.linalg.norm(faces, axis=-1, keepdims=True)


def sample_equirectangular(numpy, pixels, directions):
    # Convert luz (X right, Y up, Z forward) back to Blender (X right, Y
    # forward, Z up) before sampling Blender's equirectangular image.
    blender_x = directions[..., 0]
    blender_y = -directions[..., 2]
    blender_z = directions[..., 1]
    u = numpy.mod(numpy.arctan2(blender_y, blender_x) / (2.0 * math.pi) + 0.5, 1.0)
    v = numpy.arcsin(numpy.clip(blender_z, -1.0, 1.0)) / math.pi + 0.5

    height, width = pixels.shape[:2]
    x = u * width - 0.5
    y = numpy.clip(v * height - 0.5, 0.0, height - 1.0)
    x0 = numpy.floor(x).astype(numpy.int64) % width
    x1 = (x0 + 1) % width
    y0 = numpy.floor(y).astype(numpy.int64)
    y1 = numpy.minimum(y0 + 1, height - 1)
    tx = (x - numpy.floor(x))[..., None]
    ty = (y - numpy.floor(y))[..., None]
    lower = pixels[y0, x0] * (1.0 - tx) + pixels[y0, x1] * tx
    upper = pixels[y1, x0] * (1.0 - tx) + pixels[y1, x1] * tx
    return lower * (1.0 - ty) + upper * ty


def tangent_basis(numpy, normals):
    alternate = numpy.zeros_like(normals)
    alternate[..., 2] = 1.0
    poles = numpy.abs(normals[..., 2]) >= 0.999
    alternate[poles] = (1.0, 0.0, 0.0)
    tangent = numpy.cross(alternate, normals)
    tangent /= numpy.maximum(numpy.linalg.norm(tangent, axis=-1, keepdims=True), 1e-8)
    return tangent, numpy.cross(normals, tangent)


def hammersley(index, count):
    bits = index
    inverse = 0.0
    fraction = 0.5
    while bits:
        inverse += (bits & 1) * fraction
        bits >>= 1
        fraction *= 0.5
    return (index + 0.5) / count, inverse


def prefilter_radiance(numpy, source, size, sample_count):
    mip_count = int(math.log2(size)) + 1
    levels = []
    for level in range(mip_count):
        level_size = max(1, size >> level)
        normals = cube_directions(numpy, level_size)
        roughness = level / max(1, mip_count - 1)
        if level == 0:
            levels.append(sample_equirectangular(numpy, source, normals))
            continue

        tangent, bitangent = tangent_basis(numpy, normals)
        accumulated = numpy.zeros(normals.shape, dtype=numpy.float32)
        total_weight = numpy.zeros(normals.shape[:-1] + (1,), dtype=numpy.float32)
        alpha = max(roughness * roughness, 1e-4)
        for sample in range(sample_count):
            xi_x, xi_y = hammersley(sample, sample_count)
            phi = 2.0 * math.pi * xi_x
            cosine = math.sqrt((1.0 - xi_y) / (1.0 + (alpha * alpha - 1.0) * xi_y))
            sine = math.sqrt(max(0.0, 1.0 - cosine * cosine))
            half_vector = tangent * (math.cos(phi) * sine) + bitangent * (math.sin(phi) * sine) + normals * cosine
            light = 2.0 * numpy.sum(normals * half_vector, axis=-1, keepdims=True) * half_vector - normals
            light /= numpy.maximum(numpy.linalg.norm(light, axis=-1, keepdims=True), 1e-8)
            weight = numpy.maximum(numpy.sum(normals * light, axis=-1, keepdims=True), 0.0)
            accumulated += sample_equirectangular(numpy, source, light) * weight
            total_weight += weight
        levels.append(accumulated / numpy.maximum(total_weight, 1e-6))
    return levels


def convolve_irradiance(numpy, source, size, sample_count):
    normals = cube_directions(numpy, size)
    tangent, bitangent = tangent_basis(numpy, normals)
    accumulated = numpy.zeros(normals.shape, dtype=numpy.float32)
    for sample in range(sample_count):
        xi_x, xi_y = hammersley(sample, sample_count)
        phi = 2.0 * math.pi * xi_x
        radius = math.sqrt(xi_y)
        local_x = math.cos(phi) * radius
        local_y = math.sin(phi) * radius
        local_z = math.sqrt(max(0.0, 1.0 - xi_y))
        direction = tangent * local_x + bitangent * local_y + normals * local_z
        accumulated += sample_equirectangular(numpy, source, direction)
    return accumulated * (math.pi / sample_count)


def write_environment_ktx(path, levels):
    import numpy

    size = int(levels[0].shape[1])
    temporary_path = path + '.tmp'
    with open(temporary_path, 'wb') as output:
        output.write(b'\xabKTX 11\xbb\r\n\x1a\n')
        output.write(
            struct.pack(
                '<13I',
                0x04030201,
                0x140B,
                2,
                0x1908,
                0x881A,
                0x1908,
                size,
                size,
                0,
                0,
                6,
                len(levels),
                0,
            )
        )
        for level in levels:
            rgb = numpy.nan_to_num(level, nan=0.0, posinf=HALF_FLOAT_MAX, neginf=0.0)
            rgb = numpy.clip(rgb, 0.0, HALF_FLOAT_MAX)
            alpha = numpy.ones(rgb.shape[:-1] + (1,), dtype=numpy.float32)
            rgba = numpy.concatenate([rgb, alpha], axis=-1).astype('<f2', copy=False)
            face_size = rgba[0].nbytes
            output.write(struct.pack('<I', face_size))
            for face in range(6):
                output.write(rgba[face].tobytes(order='C'))
                output.write(b'\0' * ((-face_size) % 4))
    os.replace(temporary_path, path)


def compile_environment(world, source, output_dir):
    import hashlib

    import numpy

    sky_size = environment_size(world, 'luz_environment_sky_size', 256, 16, 2048)
    radiance_size = environment_size(world, 'luz_environment_radiance_size', 256, 16, 1024)
    irradiance_size = environment_size(world, 'luz_environment_irradiance_size', 64, 8, 256)
    sample_count = max(8, min(256, int(world.get('luz_environment_samples', 64))))
    source_stat = os.stat(source['sourcePath'])
    settings = {
        'version': ENVIRONMENT_COMPILER_VERSION,
        'source': os.path.normcase(source['sourcePath']),
        'sourceSize': source_stat.st_size,
        'sourceModified': source_stat.st_mtime_ns,
        'strength': source['strength'],
        'skySize': sky_size,
        'radianceSize': radiance_size,
        'irradianceSize': irradiance_size,
        'samples': sample_count,
    }
    fingerprint = hashlib.sha256(json.dumps(settings, sort_keys=True, allow_nan=False).encode('utf-8')).hexdigest()
    cache_path = os.path.join(output_dir, 'environment-cache.json')
    outputs = {
        'sky': os.path.join(output_dir, 'sky.ktx'),
        'radiance': os.path.join(output_dir, 'radiance.ktx'),
        'irradiance': os.path.join(output_dir, 'irradiance.ktx'),
    }
    if os.path.isfile(cache_path) and all(os.path.isfile(path) for path in outputs.values()):
        try:
            with open(cache_path, encoding='utf-8') as cache_file:
                if json.load(cache_file).get('fingerprint') == fingerprint:
                    print(f"[luz Export] Reusing compiled environment '{world.name}'")
                    return outputs
        except (OSError, ValueError, AttributeError):
            pass

    image = source['image']
    width, height = (int(value) for value in image.size)
    channels = int(image.channels)
    if width <= 0 or height <= 0 or channels < 3:
        raise RuntimeError(f"World '{world.name}': environment image has no RGB pixel data")
    flat_pixels = numpy.empty(width * height * channels, dtype=numpy.float32)
    image.pixels.foreach_get(flat_pixels)
    pixels = flat_pixels.reshape((height, width, channels))[..., :3]
    pixels = numpy.maximum(pixels * float(source['strength']), 0.0)

    os.makedirs(output_dir, exist_ok=True)
    print(
        f"[luz Export] Compiling environment '{world.name}' "
        f'({sky_size}px sky, {radiance_size}px radiance, {irradiance_size}px irradiance)'
    )
    sky = sample_equirectangular(numpy, pixels, cube_directions(numpy, sky_size))
    radiance = prefilter_radiance(numpy, pixels, radiance_size, sample_count)
    irradiance = convolve_irradiance(numpy, pixels, irradiance_size, sample_count)
    write_environment_ktx(outputs['sky'], [sky])
    write_environment_ktx(outputs['radiance'], radiance)
    write_environment_ktx(outputs['irradiance'], [irradiance])

    cache_data = {'fingerprint': fingerprint, 'settings': settings}
    with open(cache_path + '.tmp', 'w', encoding='utf-8') as cache_file:
        cache_file.write(json.dumps(cache_data, indent=2, allow_nan=False))
        cache_file.write('\n')
    os.replace(cache_path + '.tmp', cache_path)
    return outputs


def export_world_environment(world, scene_filepath):
    source = environment_world_source(world)
    if source is None:
        return None

    scene_dir = os.path.dirname(scene_filepath)
    environment_root = (
        os.path.join(os.path.dirname(scene_dir), 'environments')
        if os.path.basename(scene_dir).lower() == 'scenes'
        else os.path.join(scene_dir, 'environments')
    )
    safe_name = (
        ''.join(character if character.isalnum() or character in '._-' else '_' for character in world.name).strip('._')
        or 'environment'
    )
    output_dir = os.path.join(environment_root, safe_name)
    outputs = compile_environment(world, source, output_dir)

    def relative(path):
        value = os.path.relpath(path, scene_dir).replace(os.sep, '/')
        return value if value.startswith('.') else './' + value

    return {
        'sky': relative(outputs['sky']),
        'radiance': relative(outputs['radiance']),
        'irradiance': relative(outputs['irradiance']),
        'rotation': source['rotation'],
    }


def build_colliders_from_object(obj, depsgraph, apply_modifiers, include_all_faces=False):
    mesh_obj = obj.evaluated_get(depsgraph) if apply_modifiers else obj
    mesh = mesh_obj.to_mesh()
    mesh.transform(obj.evaluated_get(depsgraph).matrix_world)

    attr = mesh.attributes.get('is_collider')
    if not include_all_faces and (not attr or attr.domain != 'FACE'):
        mesh_obj.to_mesh_clear()
        return []

    collider_polys = []

    for poly in mesh.polygons:
        if not include_all_faces and not attr.data[poly.index].value:
            continue

        indices = list(poly.vertices)
        if len(indices) < 3:
            continue

        # Fan triangulation per flagged face
        for i in range(1, len(indices) - 1):
            tri_indices = (indices[0], indices[i], indices[i + 1])
            verts = []
            for vert_index in tri_indices:
                co = mesh.vertices[vert_index].co
                transformed = transform_vector(transformation_matrix, co)
                verts.append([round5(transformed[0]), round5(transformed[1]), round5(transformed[2])])
            collider_polys.append(verts)

    mesh_obj.to_mesh_clear()
    return collider_polys


def is_rigid_body_object(obj):
    # Prefer explicit geometry attribute (boolean) if present
    data_attrs = getattr(obj.data, 'attributes', None)
    if data_attrs:
        attr = data_attrs.get('is_rigid_body')
        if attr and hasattr(attr, 'data'):
            try:
                if any(bool(item.value) for item in attr.data):
                    return True
            except Exception:
                pass

    # Custom property opt-in
    if bool(obj.get('is_rigid_body', False)):
        return True

    # Blender rigid body settings
    rb = getattr(obj, 'rigid_body', None)
    return rb is not None


def determine_rigid_shape(obj):
    # Custom property override
    if 'rigid_body_shape' in obj:
        return str(obj['rigid_body_shape']).lower()
    if 'rigid_shape' in obj:
        return str(obj['rigid_shape']).lower()

    rb = getattr(obj, 'rigid_body', None)
    if rb and getattr(rb, 'collision_shape', None):
        return str(rb.collision_shape).lower()

    return 'box'


def build_body_from_object(obj, depsgraph, apply_modifiers, transform):
    if not is_rigid_body_object(obj):
        return None

    mesh_obj = obj.evaluated_get(depsgraph) if apply_modifiers else obj
    mesh = mesh_obj.to_mesh()

    if not mesh.vertices:
        mesh_obj.to_mesh_clear()
        return None

    min_coords = [float('inf')] * 3
    max_coords = [float('-inf')] * 3

    for vertex in mesh.vertices:
        position = transform_vector(transformation_matrix, vertex.co)
        for i in range(3):
            min_coords[i] = min(min_coords[i], position[i])
            max_coords[i] = max(max_coords[i], position[i])

    mesh_obj.to_mesh_clear()

    scale = transform['scale']
    center = [round5(((max_coords[i] + min_coords[i]) * 0.5) * scale[i]) for i in range(3)]
    extents = [round5(((max_coords[i] - min_coords[i]) * 0.5) * abs(scale[i])) for i in range(3)]

    shape = determine_rigid_shape(obj)
    volume = {'type': 'cuboid'}

    if shape in ('box', 'cuboid'):
        volume = {'type': 'cuboid', 'extents': extents}
    elif shape == 'sphere':
        radius = max(extents)
        volume = {'type': 'sphere', 'radius': radius}
    elif shape == 'cylinder':
        # Cylinder meshes in Blender point along +Z; after axis conversion the height lands on engine Y.
        # Volume expects height along local Z, so use X/Z for radius and Y for height.
        radius = max(extents[0], extents[2])
        height = extents[1] * 2
        volume = {'type': 'cylinder', 'radius': radius, 'height': round5(height)}
    elif shape in ('ellipsoid', 'capsule', 'cone'):
        # Capsule/cone not directly supported: export as ellipsoid using extents
        volume = {'type': 'ellipsoid', 'radius': extents}
    elif shape in ('convex_hull', 'mesh'):
        # Fallback to tight-fitting cuboid
        volume = {'type': 'cuboid', 'extents': extents}

    if any(abs(c) > 1e-5 for c in center):
        volume['origin'] = center

    mass = 1.0
    rb = getattr(obj, 'rigid_body', None)
    if rb:
        mass = rb.mass if getattr(rb, 'type', 'ACTIVE') == 'ACTIVE' else 0.0
    elif obj.get('rigid_body_mass') is not None:
        mass = float(obj.get('rigid_body_mass'))

    body_component = {
        'type': 'body',
        'motionType': 'dynamic' if mass > 0 else 'static',
        'mass': round5(mass),
        'volume': volume,
    }
    if rb:
        body_component['friction'] = round5(float(rb.friction))

    return body_component


def should_export_passive_body_as_colliders(obj, body_component):
    """Use static mesh triangles where a passive Body would lose collision detail."""
    rigid_body = getattr(obj, 'rigid_body', None)
    if not rigid_body or getattr(rigid_body, 'type', 'ACTIVE') != 'PASSIVE':
        return False

    if determine_rigid_shape(obj) == 'mesh':
        return True

    volume = body_component.get('volume', {}) if body_component else {}
    if volume.get('type') != 'cuboid':
        return False

    extents = volume.get('extents', [])
    return len(extents) == 3 and any(abs(float(extent)) <= 1e-5 for extent in extents)


def light_component_from_object(obj):
    light = obj.data
    light_types = {'SPOT': 'spot', 'SUN': 'directional', 'POINT': 'point'}
    if light.type not in light_types:
        raise RuntimeError(f"Light '{obj.name}' uses unsupported type '{light.type}'; use Spot, Sun or Point")

    def light_property(name, default):
        return obj.get(name, light.get(name, default))

    def numeric_light_property(name, default):
        try:
            value = float(light_property(name, default))
        except (TypeError, ValueError):
            raise RuntimeError(f"Light '{obj.name}' property '{name}' must be numeric")
        if not math.isfinite(value):
            raise RuntimeError(f"Light '{obj.name}' property '{name}' must be finite")
        return value

    color = [round5(c) for c in light.color]
    intensity = round5(getattr(light, 'energy', 1.0))

    light_range = round5(numeric_light_property('luz_range', getattr(light, 'cutoff_distance', 40.0)))
    if light_range <= 0.0:
        raise RuntimeError(f"Light '{obj.name}' range must be greater than zero")

    softness = round5(getattr(light, 'spot_blend', 1.0))

    clip_start = round5(numeric_light_property('luz_clip_start', 0.1))
    clip_end = round5(numeric_light_property('luz_clip_end', light_range))
    if clip_start <= 0.0:
        raise RuntimeError(f"Light '{obj.name}' property 'luz_clip_start' must be greater than zero")
    if clip_end <= clip_start:
        raise RuntimeError(f"Light '{obj.name}' property 'luz_clip_end' must be greater than luz_clip_start")

    shadow_size = [round5(numeric_light_property(name, 20.0)) for name in ('luz_shadow_width', 'luz_shadow_height')]
    if any(value <= 0.0 for value in shadow_size):
        raise RuntimeError(f"Light '{obj.name}' shadow width and height must be greater than zero")

    component = {
        'type': 'light',
        'lightType': light_types[light.type],
        'shadowSize': shadow_size,
        'color': color,
        'intensity': intensity,
        'range': light_range,
        'softness': softness,
        'clipPlanes': [clip_start, clip_end],
        'volumetricIntensity': max(0.0, float(light_property('luz_volumetric_intensity', 0.0))),
        'volumetricDensity': max(0.0, float(light_property('luz_volumetric_density', 0.02))),
        'volumetricAnisotropy': max(-0.9, min(0.9, float(light_property('luz_volumetric_anisotropy', 0.35)))),
        'volumetricNoiseScale': max(0.0, float(light_property('luz_volumetric_noise_scale', 1.5))),
        'volumetricNoiseSpeed': max(0.0, float(light_property('luz_volumetric_noise_speed', 0.002))),
        'volumetricNoiseStrength': max(0.0, min(1.0, float(light_property('luz_volumetric_noise_strength', 0.6)))),
    }
    if light.type == 'SPOT':
        cone_angle = round5(math.degrees(getattr(light, 'spot_size', math.radians(90.0))))
        if not 0.0 < cone_angle < 180.0:
            raise RuntimeError(f"Light '{obj.name}' cone angle must be between 0 and 180 degrees, exclusively")
        component['coneAngle'] = cone_angle
        component['coneFalloff'] = round5(max(0.0, min(cone_angle, numeric_light_property('luz_cone_falloff', 10.0))))
    return component


def camera_component_from_object(obj, scene):
    camera = obj.data

    render = scene.render
    aspect = 1.0
    if render.resolution_y != 0:
        aspect = (render.resolution_x * render.pixel_aspect_x) / (render.resolution_y * render.pixel_aspect_y)

    # Radians.
    vertical_angle = getattr(camera, 'angle_y', None)
    if vertical_angle is None or vertical_angle == 0:
        vertical_angle = getattr(camera, 'angle', math.radians(90.0))

    # Degrees.
    field_of_view = math.degrees(vertical_angle)

    clip_start = float(getattr(camera, 'clip_start', 0.1))
    clip_end = float(getattr(camera, 'clip_end', 100.0))

    dof = getattr(camera, 'dof', None)
    depth_of_field_enabled = bool(getattr(dof, 'use_dof', False)) if dof else False
    focus_distance = float(getattr(dof, 'focus_distance', 10.0)) if dof else 10.0
    focus_object = getattr(dof, 'focus_object', None) if dof else None
    if focus_object is not None:
        camera_position = obj.matrix_world.translation
        focus_position = focus_object.matrix_world.translation
        camera_forward = obj.matrix_world.to_quaternion() @ mathutils.Vector((0.0, 0.0, -1.0))
        focus_distance = abs((focus_position - camera_position).dot(camera_forward.normalized()))

    focal_length = float(getattr(camera, 'lens', 50.0))
    f_stop = float(getattr(dof, 'aperture_fstop', 2.8)) if dof else 2.8
    sensor_height = 2.0 * focal_length * math.tan(vertical_angle * 0.5)

    optical_values = {
        'focusDistance': focus_distance,
        'focalLength': focal_length,
        'sensorHeight': sensor_height,
        'fStop': f_stop,
    }
    for name, value in optical_values.items():
        if not math.isfinite(value) or value <= 0.0:
            raise RuntimeError(f"Camera '{obj.name}' has invalid depth-of-field value '{name}': {value}")

    return {
        'type': 'camera',
        'aspect': float(aspect),
        'fieldOfView': float(field_of_view),
        'clipPlanes': [clip_start, clip_end],
        'isDepthOfFieldEnabled': depth_of_field_enabled,
        **optical_values,
    }


def derive_reflection_plane_from_object(obj, depsgraph, apply_modifiers):
    mesh_obj = obj.evaluated_get(depsgraph) if apply_modifiers else obj
    mesh = mesh_obj.to_mesh()

    try:
        polygons = [polygon for polygon in mesh.polygons if polygon.area > 1e-12]
        if not polygons:
            return None

        reference_normal = max(polygons, key=lambda polygon: polygon.area).normal.normalized()
        normal = mathutils.Vector((0.0, 0.0, 0.0))
        point = mathutils.Vector((0.0, 0.0, 0.0))
        total_area = 0.0

        for polygon in polygons:
            area = float(polygon.area)
            polygon_normal = polygon.normal.normalized()
            if polygon_normal.dot(reference_normal) < 0.0:
                polygon_normal.negate()

            normal += polygon_normal * area
            point += polygon.center * area
            total_area += area

        if normal.length_squared <= 1e-12 or total_area <= 1e-12:
            return None

        normal.normalize()
        point /= total_area

        # Keep the conventional Blender local +Z side as the reflector front
        # whenever the fitted direction has an unambiguous orientation.
        if normal.z < 0.0:
            normal.negate()

        engine_normal = mathutils.Vector(transform_vector(transformation_matrix, normal))
        engine_point = mathutils.Vector(transform_vector(transformation_matrix, point))
        engine_normal.normalize()

        return {
            'normal': [float(value) for value in engine_normal],
            'offset': float(engine_normal.dot(engine_point)),
        }
    finally:
        mesh_obj.to_mesh_clear()


def reflector_component_from_object(obj, depsgraph, apply_modifiers):
    if not bool(obj.get('luz_planar_reflector', False)):
        return None

    component = {
        'type': 'reflector',
        'resolutionScale': max(0.1, min(1.0, float(obj.get('luz_reflection_resolution', 0.5)))),
        'clipBias': max(0.0, float(obj.get('luz_reflection_clip_bias', 0.001))),
        'intensity': max(0.0, float(obj.get('luz_reflection_intensity', 1.0))),
        'maximumRoughness': max(0.04, min(1.0, float(obj.get('luz_reflection_maximum_roughness', 0.8)))),
    }

    plane = derive_reflection_plane_from_object(obj, depsgraph, apply_modifiers)
    if plane:
        component.update(plane)

    if 'luz_reflection_offset' in obj:
        component['offset'] = float(obj['luz_reflection_offset'])

    mesh_names = obj.get('luz_reflection_meshes')
    if isinstance(mesh_names, str):
        component['meshes'] = [name.strip() for name in mesh_names.split(',') if name.strip()]

    return component


def select_mesh_objects(objects, only_visible=False):
    return sorted(
        (obj for obj in objects if obj.type == 'MESH' and (not only_visible or obj.visible_get())), key=source_identity
    )


def source_identity(source):
    library = bpy.path.abspath(source.library.filepath) if source.library else ''
    return library + '::' + source.name_full


def asset_filename(source):
    name = ''.join(c if c.isalnum() or c in '._-' else '_' for c in source.name).strip('.') or 'asset'
    # Hash even local names: case-insensitive filesystems and sanitized names can collide.
    suffix = hashlib.sha256(source_identity(source).encode('utf-8')).hexdigest()[:12]
    return f'{name}-{suffix}'


def is_content_addressed_model_file(filename):
    for suffix in ('.model.json', '.geometry'):
        if not filename.endswith(suffix):
            continue
        stem = filename[: -len(suffix)]
        separator = stem.rfind('-')
        digest = stem[separator + 1 :]
        return (
            separator > 0 and len(digest) == 12 and all(character in '0123456789abcdef' for character in digest.lower())
        )
    return False


def document_strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, dict):
        for child in value.values():
            yield from document_strings(child)
    elif isinstance(value, list):
        for child in value:
            yield from document_strings(child)


def document_models(value):
    if isinstance(value, dict):
        if value.get('type') == 'model':
            yield value
        for child in value.values():
            yield from document_models(child)
    elif isinstance(value, list):
        for child in value:
            yield from document_models(child)


def validate_animation_document(document, path):
    def reject():
        raise ValueError(f"Invalid animation document '{path}'")

    def is_number(value):
        return isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value)

    if (
        not isinstance(document, dict)
        or document.get('type') != 'skeletalAnimation'
        or type(document.get('schemaVersion')) is not int
        or document['schemaVersion'] != 1
        or not isinstance(document.get('keyframes'), dict)
        or not document['keyframes']
        or not is_number(document.get('duration'))
        or document['duration'] <= 0
        or ('isAutoplayEnabled' in document and not isinstance(document['isAutoplayEnabled'], bool))
        or ('playback' in document and document['playback'] not in ('once', 'loop'))
    ):
        reject()
    for tracks in document['keyframes'].values():
        if not isinstance(tracks, dict):
            reject()
        for channel, size in (('translation', 3), ('rotation', 4), ('scale', 3)):
            keys = tracks.get(channel)
            if not isinstance(keys, list) or not keys:
                reject()
            previous_time = -1
            for key in keys:
                if not isinstance(key, dict):
                    reject()
                time, value = key.get('time'), key.get('value')
                if (
                    not is_number(time)
                    or time < 0
                    or time <= previous_time
                    or time > document['duration']
                    or not isinstance(value, list)
                    or len(value) != size
                    or not all(is_number(component) for component in value)
                ):
                    reject()
                if (
                    channel == 'rotation'
                    and abs(math.sqrt(sum(component * component for component in value)) - 1) > 1e-4
                ):
                    reject()
                if channel == 'scale' and any(abs(component) < 1e-8 for component in value):
                    reject()
                previous_time = time


def cleanup_obsolete_model_exports(asset_root):
    """Remove generated assets only after their complete reference graph is readable."""
    models_dir = os.path.abspath(os.path.join(asset_root, 'models'))
    animations_dir = os.path.abspath(os.path.join(asset_root, 'animations'))
    document_paths = []
    for directory_name, suffix in (('scenes', '.scene.json'), ('entities', '.entity.json')):
        directory = os.path.join(asset_root, directory_name)
        if not os.path.isdir(directory):
            continue
        for root, _, filenames in os.walk(directory):
            document_paths.extend(os.path.join(root, filename) for filename in filenames if filename.endswith(suffix))
    if os.path.isdir(models_dir):
        for root, _, filenames in os.walk(models_dir):
            document_paths.extend(
                os.path.join(root, filename)
                for filename in filenames
                if filename.endswith('.model.json') and not is_content_addressed_model_file(filename)
            )
    if not document_paths:
        return []

    referenced = set()
    visited = set()
    model_documents = []
    try:
        while document_paths:
            document_path = os.path.abspath(document_paths.pop())
            identity = os.path.normcase(document_path)
            if identity in visited:
                continue
            visited.add(identity)
            with open(document_path, encoding='utf-8') as document_file:
                document = json.load(document_file)
            if not isinstance(document, dict):
                raise ValueError(f"Invalid asset document '{document_path}'")
            if document_path.lower().endswith('.model.json'):
                referenced.add(identity)
                referenced.add(os.path.normcase(document_path[: -len('.model.json')] + '.geometry'))
                model_documents.append((document_path, document))
            else:
                model_documents.extend((document_path, model) for model in document_models(document))
            for value in document_strings(document):
                if value.lower().endswith(('.model.json', '.entity.json')):
                    document_paths.append(os.path.join(os.path.dirname(document_path), value))
        for model_path, model in model_documents:
            animations = model.get('animations', {})
            if not isinstance(animations, dict):
                raise ValueError(f"Invalid animation references in '{model_path}'")
            for name, value in animations.items():
                if not isinstance(value, str) or not value.strip():
                    raise ValueError(f"Invalid animation reference '{name}' in '{model_path}'")
                animation_path = os.path.abspath(os.path.join(os.path.dirname(model_path), value))
                with open(animation_path, encoding='utf-8') as animation_file:
                    animation = json.load(animation_file)
                validate_animation_document(animation, animation_path)
                referenced.add(os.path.normcase(animation_path))
    except (OSError, ValueError, TypeError) as error:
        print(f'[luz Export] Skipping stale model cleanup because an asset document is invalid: {error}')
        return []

    removed = []
    for directory in (models_dir, animations_dir):
        if not os.path.isdir(directory):
            continue
        if os.path.normcase(os.path.realpath(directory)) != os.path.normcase(os.path.abspath(directory)):
            continue
        for filename in os.listdir(directory):
            if directory == models_dir:
                if not is_content_addressed_model_file(filename):
                    continue
            else:
                digest, suffix = filename[:64], filename[64:]
                if (
                    len(digest) != 64
                    or suffix != '.animation.json'
                    or any(character not in '0123456789abcdef' for character in digest)
                ):
                    continue
            path = os.path.join(directory, filename)
            if not os.path.isfile(path) or os.path.islink(path):
                continue
            if os.path.normcase(os.path.abspath(path)) in referenced:
                continue
            try:
                os.remove(path)
                removed.append(path)
            except FileNotFoundError:
                pass
    return removed


def document_reference(target, document):
    relative = os.path.relpath(target, os.path.dirname(document)).replace(os.sep, '/')
    return relative if relative.startswith('.') else './' + relative


class EntityHierarchyExporter:
    """Shared scene/selected-root writer. Source assets and placements have separate identities."""

    def __init__(
        self,
        context,
        filepath,
        only_visible,
        apply_modifiers,
        bake_animation=False,
        animation_tolerances=None,
        animation_source='timeline',
        in_place=False,
    ):
        self.context = context
        self.filepath = os.path.abspath(filepath)
        self.depsgraph = context.evaluated_depsgraph_get()
        self.only_visible = only_visible
        self.apply_modifiers = apply_modifiers
        self.base_path = get_base_path(filepath)
        directory = os.path.dirname(self.filepath)
        asset_root = (
            os.path.dirname(directory) if os.path.basename(directory).lower() in ('scenes', 'entities') else directory
        )
        self.models_dir = os.path.join(asset_root, 'models')
        self.entities_dir = os.path.join(asset_root, 'entities')
        self.models = {}
        self.collections = {}
        self.collection_stack = []
        self.colliders = {}
        self.bake_animation = bake_animation
        self.animation_tolerances = animation_tolerances
        if animation_source not in ('timeline', 'actions'):
            raise RuntimeError('Animation source must be timeline or actions')
        self.animation_source = animation_source
        self.in_place = in_place
        self.animation_nodes = []
        self.animation_references = {}
        self.pending_documents = []
        self.pending_models = []
        self.skeletons = []

    def world(self, obj):
        return obj.evaluated_get(self.depsgraph).matrix_world.copy()

    def visible(self, obj, collection_source=False):
        if not self.only_visible:
            return True
        # Unlinked collection sources have no view-layer visibility of their own.
        return not obj.hide_render and (not obj.hide_viewport if collection_source else obj.visible_get())

    def model(self, obj, document):
        identity = source_identity(obj)
        if identity not in self.models:
            write_export_status(self.filepath, 'Exporting models from Blender', len(self.models))
            path = os.path.join(self.models_dir, asset_filename(obj) + '.model.json')
            os.makedirs(self.models_dir, exist_ok=True)
            skeleton = (
                SkeletalExport(obj, self.depsgraph)
                if self.bake_animation and any(modifier.type == 'ARMATURE' for modifier in obj.modifiers)
                else None
            )
            if skeleton:
                with skeleton.undeformed(self.context) as depsgraph:
                    data = build_model_from_object(obj, depsgraph, self.apply_modifiers, self.base_path, skeleton)
                data['armatures'] = {skeleton.armature.name: skeleton.skeleton()}
                self.skeletons.append((skeleton, data))
                self.depsgraph = self.context.evaluated_depsgraph_get()
            else:
                data = build_model_from_object(obj, self.depsgraph, self.apply_modifiers, self.base_path)
            self.pending_models.append((path, data))
            self.models[identity] = path
        return document_reference(self.models[identity], document)

    def keys(self, objects):
        result = {}
        for obj in sorted(objects, key=source_identity):
            name = obj.name
            if name in result:
                name = asset_filename(obj)
            while name in result:
                name += '_'
            result[name] = obj
        return result

    def forest(self, objects, document, standalone=False, collection_source=False, offset=None):
        members = set(objects)
        included = set()
        for obj in members:
            if self.visible(obj, collection_source) and obj.type in ('EMPTY', 'MESH', 'CAMERA', 'LIGHT'):
                included.add(obj)
                parent = obj.parent
                while parent in members:
                    included.add(parent)
                    parent = parent.parent
        roots = [obj for obj in included if obj.parent not in included]

        def build(obj, key, parent_world=None):
            world = self.world(obj)
            if parent_world is not None:
                try:
                    local = parent_world.inverted() @ world
                except ValueError as error:
                    raise RuntimeError(f"'{key}' has a singular parent transform") from error
            else:
                local = offset @ world if offset is not None else world
            transform = convert_transform(local, key)
            if obj.parent_type == 'BONE':
                raise RuntimeError(f"'{key}' uses bone parenting, which entity export does not support")
            children = {
                name: build(child, key + '/' + name, world)
                for name, child in self.keys([child for child in included if child.parent == obj]).items()
            }
            components = {}
            visible = self.visible(obj, collection_source)
            if visible and obj.instance_type == 'COLLECTION' and obj.instance_collection:
                reference = {'entity': self.collection(obj.instance_collection, document)}
                # A wrapper is needed only if the instancer also parents ordinary objects.
                if children or self.bake_animation:
                    collection_key = 'Collection'
                    while collection_key in children:
                        collection_key += '_'
                    children[collection_key] = reference
                else:
                    return dict(reference, **transform)
            elif visible and obj.type == 'MESH':
                components[obj.data.name] = self.model(obj, document)
                body = build_body_from_object(obj, self.depsgraph, self.apply_modifiers, transform)
                passive = should_export_passive_body_as_colliders(obj, body)
                polygons = build_colliders_from_object(
                    obj, self.depsgraph, self.apply_modifiers, include_all_faces=passive
                )
                if body and (parent_world is not None or collection_source):
                    raise RuntimeError(
                        f"'{key}' has a nested physics body. Move the body to a scene/entity root; compound bodies are unsupported"
                    )
                if polygons and (
                    standalone or collection_source or parent_world is not None or children or (body and not passive)
                ):
                    raise RuntimeError(
                        f"'{key}' has attached polygon colliders. Use a root body or export a flat static surface in a whole scene"
                    )
                if passive:
                    if not polygons:
                        raise RuntimeError(f"Passive rigid body '{key}' has no faces to export as static colliders")
                    body = None
                if body:
                    self.add_generated_component(components, 'Body', body)
                reflector = reflector_component_from_object(obj, self.depsgraph, self.apply_modifiers)
                if reflector:
                    self.add_generated_component(components, 'Reflector', reflector)
                for index, vertices in enumerate(polygons):
                    self.colliders[f'{key}_collider_{index}'] = {'type': 'polygon', 'vertices': vertices}
            elif visible and obj.type == 'CAMERA':
                components[obj.data.name] = camera_component_from_object(obj, self.context.scene)
            elif visible and obj.type == 'LIGHT':
                components[obj.data.name] = light_component_from_object(obj)
            result = dict(transform, components=components)
            if children:
                result['children'] = children
            if self.bake_animation:
                self.animation_references[id(result)] = transform
                self.animation_nodes.append(
                    (
                        obj,
                        obj.parent if parent_world is not None else None,
                        offset if parent_world is None else None,
                        result,
                        key,
                    )
                )
            return result

        return {name: build(obj, name) for name, obj in self.keys(roots).items()}

    @staticmethod
    def add_generated_component(components, name, component):
        key = name
        index = 1
        while key in components:
            key = f'{name}.{index:03d}'
            index += 1
        components[key] = component

    def collection(self, collection, document):
        identity = source_identity(collection)
        if identity in self.collection_stack:
            raise RuntimeError('Recursive collection instance: ' + ' -> '.join(self.collection_stack + [identity]))
        if identity not in self.collections:
            self.collection_stack.append(identity)
            try:
                path = os.path.join(self.entities_dir, asset_filename(collection) + '.entity.json')
                offset = mathutils.Matrix.Translation(-collection.instance_offset)
                children = self.forest(
                    collection.all_objects, path, standalone=True, collection_source=True, offset=offset
                )
                self.pending_documents.append((path, {'children': children}))
                self.collections[identity] = path
            finally:
                self.collection_stack.pop()
        return document_reference(self.collections[identity], document)

    def finish(self, objects):
        if self.bake_animation:
            if self.animation_source == 'timeline':
                self.bake(objects)
            else:
                self.validate_instances(objects)
                scene = self.context.scene
                self.bake_actions(scene.render.fps / scene.render.fps_base)
                self.bake_object_actions(scene.render.fps / scene.render.fps_base)
        else:
            self.validate_instances(objects)
        for path, data in self.pending_models:
            write_animation_files(path, data)
        for path, data in self.pending_models:
            write_geometry_file(path, data)
            write_model_file(path, data)
        for path, data in self.pending_documents:
            self.publish(path, data)

    def bake(self, objects):
        scene = self.context.scene
        sample_rate = scene.render.fps / scene.render.fps_base
        if scene.frame_end <= scene.frame_start or not math.isfinite(sample_rate) or sample_rate <= 0:
            raise RuntimeError('Animation baking needs at least two frames and a positive frame rate')
        tracks = [[] for _ in self.animation_nodes]
        track_spaces = [
            self.world(parent)
            if parent is not None
            else offset.inverted()
            if offset is not None
            else mathutils.Matrix.Identity(4)
            for _, parent, offset, _, _ in self.animation_nodes
        ]
        rig_ancestors = set()
        for skeleton, _ in self.skeletons:
            ancestor = skeleton.armature
            while ancestor is not None:
                rig_ancestors.add(ancestor)
                ancestor = ancestor.parent
        for frame in range(scene.frame_start, scene.frame_end + 1):
            scene.frame_set(frame)
            self.depsgraph = self.context.evaluated_depsgraph_get()
            write_export_status(
                self.filepath,
                'Baking animation',
                frame - scene.frame_start,
                scene.frame_end - scene.frame_start,
            )
            for track, (obj, parent, offset, node, key) in zip(tracks, self.animation_nodes):
                world = self.world(obj)
                if parent is not None:
                    try:
                        local = self.world(parent).inverted() @ world
                    except ValueError as error:
                        raise RuntimeError(f"'{key}' has a singular parent at frame {frame}") from error
                else:
                    local = offset @ world if offset is not None else world
                track.append(convert_transform(local, f'{key}, frame {frame}'))
            self.validate_instances(objects)
            for skeleton, _ in self.skeletons:
                skeleton.sample(self.depsgraph, frame)
        for skeleton, data in self.skeletons:
            data['animations'] = {'Timeline': skeleton.clip(sample_rate, self.animation_tolerances, self.in_place)}
        for track, space, (obj, parent, offset, node, key) in zip(tracks, track_spaces, self.animation_nodes):
            if self.in_place and (parent is None or obj in rig_ancestors):
                track = make_animation_in_place(track, space)
            self.add_object_animation(track, node, key, 'Timeline', sample_rate)

    def add_object_animation(self, track, node, key, name, sample_rate, retain_constant=False):
        first = self.animation_references[id(node)]
        initial_rotation = mathutils.Quaternion((first['rotation'][3], *first['rotation'][:3]))
        inverse_rotation = initial_rotation.conjugated()
        initial_translation = mathutils.Vector(first['translation'])
        samples = []
        previous_rotation = None
        for index, pose in enumerate(track):
            translation = inverse_rotation @ (mathutils.Vector(pose['translation']) - initial_translation)
            rotation = inverse_rotation @ mathutils.Quaternion((pose['rotation'][3], *pose['rotation'][:3]))
            rotation.normalize()
            if previous_rotation is not None and rotation.dot(previous_rotation) < 0:
                rotation.negate()
            previous_rotation = rotation.copy()
            scale = [pose['scale'][axis] / first['scale'][axis] for axis in range(3)]
            if min(scale) < 1e-8:
                raise RuntimeError(f"'{key}' changes scale sign at frame {index}; animated scales must not cross zero")
            samples.append(
                {
                    'translation': list(translation),
                    'rotation': [rotation.x, rotation.y, rotation.z, rotation.w],
                    'scale': scale,
                }
            )

        def identity(sample):
            return (
                max(abs(v) for v in sample['translation']) <= 1e-6
                and max(abs(v - 1) for v in sample['scale']) <= 1e-6
                and max(abs(v) for v in sample['rotation'][:3]) <= 1e-6
            )

        if not retain_constant and all(identity(sample) for sample in samples):
            return
        if any(name.startswith(key + '_collider_') for name in self.colliders):
            raise RuntimeError(f"'{key}' has moving polygon colliders; use a supported root body shape")
        for component in node['components'].values():
            if isinstance(component, dict) and component.get('type') == 'body':
                if any(max(abs(v - 1) for v in sample['scale']) > 1e-6 for sample in samples):
                    raise RuntimeError(
                        f"'{key}' animates body scale; collider dimensions are baked and must remain constant"
                    )
                component['motionType'] = 'kinematic'
        animation = build_animation_tracks(samples, sample_rate, self.animation_tolerances)
        if not animation['tracks']:
            animation['tracks']['translation'] = [
                {'time': 0, 'value': samples[0]['translation']},
                {'time': animation['duration'], 'value': samples[-1]['translation']},
            ]
        self.add_generated_component(
            node['components'],
            name,
            {'type': 'animation', 'schemaVersion': 2, 'playback': 'once', 'isAutoplayEnabled': False, **animation},
        )

    def bake_actions(self, sample_rate):
        if not math.isfinite(sample_rate) or sample_rate <= 0:
            raise RuntimeError('Animation baking needs a positive frame rate')
        rigs = {}
        for skeleton, data in self.skeletons:
            data['animations'] = {}
            rigs.setdefault(skeleton.armature, []).append((skeleton, data))
        for armature, models in rigs.items():
            animation = armature.animation_data
            if animation is None:
                continue
            if animation.use_tweak_mode:
                raise RuntimeError(f"'{armature.name}': exit NLA tweak mode before exporting action clips")
            references = []
            if animation.action:
                references.append((animation.action, animation.action_slot))
            for track in animation.nla_tracks:
                for strip in track.strips:
                    if strip.type == 'CLIP' and strip.action:
                        references.append((strip.action, strip.action_slot))
                    elif strip.type == 'META':
                        raise RuntimeError(f"'{armature.name}': unpack NLA meta strips before exporting action clips")
            references = sorted(set(references), key=lambda item: (item[0].name, item[1].identifier if item[1] else ''))
            names = set()
            for action, slot in references:
                curves = []
                for layer in action.layers:
                    for strip in layer.strips:
                        bag = strip.channelbag(slot) if slot else None
                        if bag:
                            curves.extend(bag.fcurves)
                if not curves:
                    continue
                if all(
                    curve.data_path
                    in {'location', 'rotation_euler', 'rotation_quaternion', 'rotation_axis_angle', 'scale'}
                    for curve in curves
                ):
                    continue
                for curve in curves:
                    if not curve.data_path.startswith('pose.bones[') or curve.data_path.rsplit('.', 1)[-1] not in (
                        'location',
                        'rotation_euler',
                        'rotation_quaternion',
                        'rotation_axis_angle',
                        'scale',
                    ):
                        raise RuntimeError(
                            f"'{armature.name}', action '{action.name}': separate clips require bone transform channels; "
                            'keep object motion and custom-property animation in Timeline'
                        )
                    try:
                        armature.path_resolve(curve.data_path)
                    except (ValueError, KeyError) as error:
                        raise RuntimeError(
                            f"'{armature.name}', action '{action.name}': incompatible bone channel"
                        ) from error
                name = action.name
                suffix = 1
                while name in names:
                    name = f'{action.name}.{suffix:03d}'
                    suffix += 1
                names.add(name)
                frame_start = math.floor(action.frame_range[0])
                frame_end = max(frame_start + 1, math.ceil(action.frame_range[1]))
                with isolated_armature_action(self.context, armature, action, slot):
                    for skeleton, _ in models:
                        skeleton.samples = {bone.name: [] for bone in skeleton.bones}
                    for frame in range(frame_start, frame_end + 1):
                        self.context.scene.frame_set(frame)
                        depsgraph = self.context.evaluated_depsgraph_get()
                        write_export_status(
                            self.filepath, f'Baking action {name}', frame - frame_start, frame_end - frame_start
                        )
                        for skeleton, _ in models:
                            skeleton.sample(depsgraph, frame)
                    for skeleton, data in models:
                        clip = skeleton.clip(sample_rate, self.animation_tolerances, self.in_place)
                        clip['isAutoplayEnabled'] = False
                        data['animations'][name] = clip

    def bake_object_actions(self, sample_rate):
        for obj, parent, offset, node, key in self.animation_nodes:
            animation = obj.animation_data
            if animation is None:
                continue
            if animation.use_tweak_mode:
                raise RuntimeError(f"'{key}': exit NLA tweak mode before exporting actions")
            references = []
            if animation.action:
                references.append((animation.action, animation.action_slot))
            for nla_track in animation.nla_tracks:
                for strip in nla_track.strips:
                    if strip.type == 'CLIP' and strip.action:
                        references.append((strip.action, strip.action_slot))
                    elif strip.type == 'META':
                        raise RuntimeError(f"'{key}': unpack NLA meta strips before exporting actions")
            for action, slot in sorted(
                set(references), key=lambda item: (item[0].name, item[1].identifier if item[1] else '')
            ):
                curves = [
                    curve
                    for layer in action.layers
                    for strip in layer.strips
                    for curve in (strip.channelbag(slot).fcurves if slot and strip.channelbag(slot) else [])
                ]
                if not curves or (
                    obj.type == 'ARMATURE' and all(curve.data_path.startswith('pose.bones[') for curve in curves)
                ):
                    continue
                channels = {'location', 'rotation_euler', 'rotation_quaternion', 'rotation_axis_angle', 'scale'}
                if any(curve.data_path not in channels for curve in curves):
                    raise RuntimeError(
                        f"'{key}', action '{action.name}': object actions require transform channels only; use Timeline for mixed bone/object or custom-property animation"
                    )
                validate_object_action_dependencies(obj, action, key)
                frame_start = math.floor(action.frame_range[0])
                frame_end = max(frame_start + 1, math.ceil(action.frame_range[1]))
                track = []
                with isolated_object_action(self.context, obj, action, slot):
                    space = (
                        self.world(parent)
                        if parent is not None
                        else offset.inverted()
                        if offset is not None
                        else mathutils.Matrix.Identity(4)
                    )
                    for frame in range(frame_start, frame_end + 1):
                        self.context.scene.frame_set(frame)
                        self.depsgraph = self.context.evaluated_depsgraph_get()
                        world = self.world(obj)
                        try:
                            local = (
                                self.world(parent).inverted() @ world
                                if parent is not None
                                else offset @ world
                                if offset is not None
                                else world
                            )
                        except ValueError as error:
                            raise RuntimeError(f"'{key}', action '{action.name}': singular parent transform") from error
                        track.append(convert_transform(local, f'{key}, action {action.name}, frame {frame}'))
                self.depsgraph = self.context.evaluated_depsgraph_get()
                if self.in_place and parent is None:
                    track = make_animation_in_place(track, space)
                self.add_object_animation(track, node, key, action.name, sample_rate, retain_constant=True)

    def validate_instances(self, objects):
        # Compare reconstructed placements against Blender's evaluated instance matrices.
        expected = []

        def collect(collection, placement, stack):
            identity = source_identity(collection)
            if identity in stack:
                raise RuntimeError('Recursive collection instance: ' + ' -> '.join(stack + [identity]))
            base = placement @ mathutils.Matrix.Translation(-collection.instance_offset)
            for obj in collection.all_objects:
                world = base @ self.world(obj)
                if obj.instance_type == 'COLLECTION' and obj.instance_collection:
                    collect(obj.instance_collection, world, stack + [identity])
                elif self.visible(obj, True):
                    expected.append((source_identity(obj), world))

        placements = set()
        for obj in objects:
            if obj.instance_type == 'COLLECTION' and obj.instance_collection and self.visible(obj):
                placements.add(obj)
                collect(obj.instance_collection, self.world(obj), [])
        for instance in self.depsgraph.object_instances:
            if not instance.is_instance or not instance.parent or instance.parent.original not in placements:
                continue
            identity = source_identity(instance.object.original)
            candidates = [matrix for source, matrix in expected if source == identity]
            if not candidates:  # A filtered source or the empty used to place a nested collection.
                continue

            def error(matrix):
                return max(
                    abs(matrix[row][col] - instance.matrix_world[row][col]) for row in range(4) for col in range(4)
                )

            magnitude = max(1.0, max(abs(v) for row in instance.matrix_world for v in row))
            if min(error(matrix) for matrix in candidates) > 1e-4 * magnitude:
                raise RuntimeError(
                    f"Collection placement for '{identity}' does not match Blender's evaluated pose; unsupported instance transform"
                )

    @staticmethod
    def publish(path, data):
        os.makedirs(os.path.dirname(os.path.abspath(path)), exist_ok=True)
        write_text_atomic(path, json.dumps(data, indent=2, allow_nan=False) + '\n')


def _export_luz_scene(
    context,
    scene_filepath,
    only_visible=False,
    apply_modifiers=True,
    bake_animation=False,
    animation_tolerances=None,
    animation_source='timeline',
    in_place=False,
):
    scene_filepath = ensure_extension(scene_filepath, '.scene.json')
    writer = EntityHierarchyExporter(
        context,
        scene_filepath,
        only_visible,
        apply_modifiers,
        bake_animation,
        animation_tolerances,
        animation_source,
        in_place,
    )
    entities = writer.forest(context.scene.objects, writer.filepath)
    if not entities:
        raise RuntimeError('No entities found to export (check visibility filter).')
    writer.finish(context.scene.objects)
    if bake_animation:
        context.scene.frame_set(context.scene.frame_start)
    scene_data = {'$schema': SCENE_SCHEMA_PATH, 'entities': entities}
    if writer.colliders:
        scene_data['colliders'] = writer.colliders
    write_export_status(writer.filepath, 'Exporting environment from Blender')
    environment = export_world_environment(context.scene.world, writer.filepath)
    if environment:
        scene_data['environment'] = environment
    write_export_status(writer.filepath, 'Finalizing Blender export')
    writer.publish(writer.filepath, scene_data)
    removed_models = cleanup_obsolete_model_exports(os.path.dirname(writer.models_dir))
    if removed_models:
        print(f'[luz Export] Removed {len(removed_models)} obsolete model files')
    print(f'luz scene exported to: {writer.filepath}')


def _export_luz_entity(
    context,
    entity_filepath,
    only_visible=False,
    apply_modifiers=True,
    bake_animation=False,
    animation_tolerances=None,
    animation_source='timeline',
    in_place=False,
):
    root = context.active_object
    if root is None:
        raise RuntimeError('Select an active object to export as the entity root')
    path = ensure_extension(entity_filepath, '.entity.json')
    writer = EntityHierarchyExporter(
        context,
        path,
        only_visible,
        apply_modifiers,
        bake_animation,
        animation_tolerances,
        animation_source,
        in_place,
    )
    objects = [root] + list(root.children_recursive)
    entities = writer.forest(objects, writer.filepath, standalone=True)
    if len(entities) != 1:
        raise RuntimeError('The selected root has no visible exportable descendants')
    entity = next(iter(entities.values()))
    entity['translation'] = [0.0, 0.0, 0.0]
    entity['rotation'] = [0.0, 0.0, 0.0, 1.0]
    writer.finish(objects)
    writer.publish(writer.filepath, entity)
    print(f'luz entity exported to: {writer.filepath}')


@contextmanager
def animation_export_state(context, enabled):
    scene = context.scene
    frame, subframe = scene.frame_current, scene.frame_subframe
    world = scene.rigidbody_world
    physics_enabled = world.enabled if world else None
    try:
        if enabled:
            if world:
                world.enabled = False
            scene.frame_set(scene.frame_start)
        yield
    finally:
        if enabled:
            if world:
                world.enabled = physics_enabled
            scene.frame_set(frame, subframe=subframe)


def export_luz_entity(
    context,
    entity_filepath,
    only_visible=False,
    apply_modifiers=True,
    bake_animation=False,
    animation_tolerances=None,
    animation_source='timeline',
    in_place=False,
):
    path = ensure_extension(entity_filepath, '.entity.json')
    try:
        with animation_export_state(context, bake_animation):
            return _export_luz_entity(
                context,
                path,
                only_visible,
                apply_modifiers,
                bake_animation,
                animation_tolerances,
                animation_source,
                in_place,
            )
    finally:
        remove_auxiliary_file(export_status_path(path))


def export_luz_scene(
    context,
    scene_filepath,
    only_visible=False,
    apply_modifiers=True,
    bake_animation=False,
    animation_tolerances=None,
    animation_source='timeline',
    in_place=False,
):
    scene_filepath = ensure_extension(scene_filepath, '.scene.json')
    write_export_status(scene_filepath, 'Preparing Blender export')
    try:
        with animation_export_state(context, bake_animation):
            return _export_luz_scene(
                context,
                scene_filepath,
                only_visible,
                apply_modifiers,
                bake_animation,
                animation_tolerances,
                animation_source,
                in_place,
            )
    finally:
        remove_auxiliary_file(export_status_path(scene_filepath))


# ---------------------------------------------------------------------------
# Operator
# ---------------------------------------------------------------------------


class EXPORT_OT_luz_model(Operator):
    """Export scene meshes as a luz model plus a scene with camera and light entities"""

    bl_idname = 'export_scene.luz_model'
    bl_label = 'luz Scene (.scene.json)'
    bl_options = {'PRESET'}

    bake_animation: BoolProperty(
        name='Export animation',
        description='Export animation from the selected source; other properties use the first scene frame',
        default=False,
    )
    animation_source: EnumProperty(
        name='Animation Source',
        items=[
            ('timeline', 'Timeline', 'Export evaluated object and skeletal animation over the scene timeline'),
            (
                'actions',
                'Action clips',
                'Export referenced object and armature actions as separate, initially stopped animations',
            ),
        ],
        default='timeline',
    )
    in_place: BoolProperty(
        name='Animate in place',
        description='Remove horizontal root travel while preserving height, rotation, and limb motion',
        default=False,
    )
    animation_translation_tolerance: FloatProperty(
        name='Translation tolerance',
        description='Maximum position error in Blender distance units when reducing baked keys',
        default=DEFAULT_ANIMATION_TOLERANCES['translation'],
        min=0,
        precision=6,
    )
    animation_rotation_tolerance: FloatProperty(
        name='Rotation tolerance',
        description='Maximum angular error in degrees when reducing baked keys',
        default=DEFAULT_ANIMATION_TOLERANCES['rotation'],
        min=0,
        precision=4,
        subtype='ANGLE',
        unit='ROTATION',
    )
    animation_scale_tolerance: FloatProperty(
        name='Scale tolerance',
        description='Maximum per-axis scale error when reducing baked keys',
        default=DEFAULT_ANIMATION_TOLERANCES['scale'],
        min=0,
        precision=6,
    )

    filepath: StringProperty(
        name='File Path',
        description='File path for exporting the luz scene',
        subtype='FILE_PATH',
    )

    only_visible: BoolProperty(
        name='Only visible objects',
        description='Export visible objects and the transform ancestors they require',
        default=False,
    )

    apply_modifiers: BoolProperty(
        name='Apply modifiers',
        description='Apply modifiers to the mesh before exporting',
        default=True,
    )

    def execute(self, context):
        scene_path = ensure_extension(self.filepath, '.scene.json')
        try:
            export_luz_scene(
                context,
                scene_path,
                only_visible=self.only_visible,
                apply_modifiers=self.apply_modifiers,
                bake_animation=self.bake_animation,
                animation_tolerances={
                    'translation': self.animation_translation_tolerance,
                    'rotation': self.animation_rotation_tolerance,
                    'scale': self.animation_scale_tolerance,
                },
                animation_source=self.animation_source,
                in_place=self.in_place,
            )
        except (RuntimeError, OSError) as error:
            self.report({'ERROR'}, str(error))
            return {'CANCELLED'}
        return {'FINISHED'}

    def invoke(self, context, event):
        # Suggest a name based on the blend file
        if not self.filepath:
            if bpy.data.filepath:
                base = bpy.path.basename(bpy.data.filepath)
                base_no_ext = os.path.splitext(base)[0]
                default_scene = base_no_ext + '.scene.json'
                default_scene_path = os.path.join(os.path.dirname(bpy.data.filepath), default_scene)
            else:
                default_scene = 'editor.scene.json'
                default_scene_path = os.path.join(os.path.expanduser('~'), default_scene)

            self.filepath = default_scene_path

        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def draw(self, context):
        layout = self.layout
        layout.prop(self, 'filepath', text='Scene Path')
        layout.prop(self, 'only_visible')
        layout.prop(self, 'apply_modifiers')
        layout.prop(self, 'bake_animation')
        if self.bake_animation:
            layout.prop(self, 'animation_source')
            layout.prop(self, 'in_place')
            layout.prop(self, 'animation_translation_tolerance')
            layout.prop(self, 'animation_rotation_tolerance')
            layout.prop(self, 'animation_scale_tolerance')


class EXPORT_OT_luz_entity(Operator):
    """Export the active object and its descendants as a reusable entity asset"""

    bl_idname = 'export_scene.luz_entity'
    bl_label = 'luz Entity (.entity.json)'
    bl_options = {'PRESET'}

    filepath: StringProperty(name='File Path', subtype='FILE_PATH')
    only_visible: BoolProperty(name='Only visible objects', default=False)
    apply_modifiers: BoolProperty(name='Apply modifiers', default=True)
    bake_animation: BoolProperty(
        name='Export animation',
        description='Export animation from the selected source; other properties use the first scene frame',
        default=False,
    )
    animation_source: EnumProperty(
        name='Animation Source',
        items=[
            ('timeline', 'Timeline', 'Export evaluated object and skeletal animation over the scene timeline'),
            (
                'actions',
                'Action clips',
                'Export referenced object and armature actions as separate, initially stopped animations',
            ),
        ],
        default='timeline',
    )
    in_place: BoolProperty(
        name='Animate in place',
        description='Remove horizontal root travel while preserving height, rotation, and limb motion',
        default=False,
    )
    animation_translation_tolerance: FloatProperty(
        name='Translation tolerance',
        description='Maximum position error in Blender distance units when reducing baked keys',
        default=DEFAULT_ANIMATION_TOLERANCES['translation'],
        min=0,
        precision=6,
    )
    animation_rotation_tolerance: FloatProperty(
        name='Rotation tolerance',
        description='Maximum angular error in degrees when reducing baked keys',
        default=DEFAULT_ANIMATION_TOLERANCES['rotation'],
        min=0,
        precision=4,
        subtype='ANGLE',
        unit='ROTATION',
    )
    animation_scale_tolerance: FloatProperty(
        name='Scale tolerance',
        description='Maximum per-axis scale error when reducing baked keys',
        default=DEFAULT_ANIMATION_TOLERANCES['scale'],
        min=0,
        precision=6,
    )

    def execute(self, context):
        try:
            export_luz_entity(
                context,
                self.filepath,
                self.only_visible,
                self.apply_modifiers,
                self.bake_animation,
                {
                    'translation': self.animation_translation_tolerance,
                    'rotation': self.animation_rotation_tolerance,
                    'scale': self.animation_scale_tolerance,
                },
                animation_source=self.animation_source,
                in_place=self.in_place,
            )
        except (RuntimeError, OSError) as error:
            self.report({'ERROR'}, str(error))
            return {'CANCELLED'}
        return {'FINISHED'}

    def invoke(self, context, event):
        if not context.active_object:
            self.report({'ERROR'}, 'Select an active object to export')
            return {'CANCELLED'}
        if not self.filepath:
            self.filepath = os.path.join(
                os.path.dirname(bpy.data.filepath), context.active_object.name + '.entity.json'
            )
        context.window_manager.fileselect_add(self)
        return {'RUNNING_MODAL'}

    def draw(self, context):
        self.layout.prop(self, 'only_visible')
        self.layout.prop(self, 'apply_modifiers')
        self.layout.prop(self, 'bake_animation')
        if self.bake_animation:
            self.layout.prop(self, 'animation_source')
            self.layout.prop(self, 'in_place')
            self.layout.prop(self, 'animation_translation_tolerance')
            self.layout.prop(self, 'animation_rotation_tolerance')
            self.layout.prop(self, 'animation_scale_tolerance')


# ---------------------------------------------------------------------------
# Registration & menu
# ---------------------------------------------------------------------------


def menu_func_export(self, context):
    self.layout.operator(EXPORT_OT_luz_entity.bl_idname, text='luz Entity (.entity.json)')
    self.layout.operator(EXPORT_OT_luz_model.bl_idname, text='luz Scene (.scene.json)')


classes = (
    EXPORT_OT_luz_model,
    EXPORT_OT_luz_entity,
)


def register():
    from bpy.utils import register_class

    for cls in classes:
        register_class(cls)
    bpy.types.TOPBAR_MT_file_export.append(menu_func_export)


def unregister():
    from bpy.utils import unregister_class

    bpy.types.TOPBAR_MT_file_export.remove(menu_func_export)
    for cls in reversed(classes):
        unregister_class(cls)
