"""Run with Blender --background --factory-startup --python-exit-code 1 --python this_file."""

import json
import runpy
import tempfile
from pathlib import Path

import bpy


def create_image(filepath, color, file_format='PNG'):
    filepath.parent.mkdir(parents=True, exist_ok=True)
    image = bpy.data.images.new(filepath.stem, 1, 1)
    image.colorspace_settings.name = 'Non-Color'
    image.pixels = (*color, 1)
    image.filepath_raw = str(filepath)
    image.file_format = file_format
    image.save()
    return bpy.data.images.load(str(filepath), check_existing=False)


def create_texture(tree, image):
    texture = tree.nodes.new('ShaderNodeTexImage')
    texture.image = image
    return texture


def run_fixture(directory):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    source = directory / 'source'
    source.mkdir()
    bpy.ops.mesh.primitive_cube_add()
    obj = bpy.context.object
    material = bpy.data.materials.new('Imported textures')
    material.use_nodes = True
    obj.data.materials.append(material)
    tree = material.node_tree
    shader = tree.nodes.get('Principled BSDF')
    color_image = create_image(directory / 'external-a/paint.png', (0.2, 0.4, 0.6))
    roughness_image = create_image(directory / 'external-b/paint.png', (0.8, 0.8, 0.8))
    color_texture = create_texture(tree, color_image)
    tree.links.new(color_texture.outputs['Color'], shader.inputs['Base Color'])
    group_tree = bpy.data.node_groups.new('Nested image', 'ShaderNodeTree')
    group_tree.interface.new_socket(name='Roughness', in_out='OUTPUT', socket_type='NodeSocketColor')
    group_output = group_tree.nodes.new('NodeGroupOutput')
    roughness_texture = create_texture(group_tree, roughness_image)
    group_tree.links.new(roughness_texture.outputs['Color'], group_output.inputs['Roughness'])
    group = tree.nodes.new('ShaderNodeGroup')
    group.node_tree = group_tree
    tree.links.new(group.outputs['Roughness'], shader.inputs['Roughness'])

    packed_image = create_image(directory / 'external-a/packed.png', (0.5, 0.5, 0.5))
    packed_image.pack()
    packed_image.filepath = str(source / 'missing/packed.png')
    packed_texture = create_texture(tree, packed_image)
    tree.links.new(packed_texture.outputs['Color'], shader.inputs['Metallic'])

    relocated_image = create_image(source / 'poliigon/fixture/alpha.png', (1, 1, 1))
    relocated_image.filepath = str(directory / 'old-project/poliigon/fixture/alpha.png')
    relocated_texture = create_texture(tree, relocated_image)
    tree.links.new(relocated_texture.outputs['Color'], shader.inputs['Alpha'])

    normal_image = create_image(directory / 'external-a/normal.tiff', (0.5, 0.5, 1), 'TIFF')
    normal_image.colorspace_settings.name = 'Non-Color'
    normal_texture = create_texture(tree, normal_image)
    normal = tree.nodes.new('ShaderNodeNormalMap')
    tree.links.new(normal_texture.outputs['Color'], normal.inputs['Color'])
    tree.links.new(normal.outputs['Normal'], shader.inputs['Normal'])

    unused_image = bpy.data.images.new('Unused missing image', 1, 1)
    unused_image.filepath = str(directory / 'absent/unused.png')
    create_texture(tree, unused_image)
    scene = bpy.context.scene
    scene.frame_end = 2
    scene.frame_set(2)
    scene.world = bpy.data.worlds.new('Authored world')
    bpy.ops.wm.save_as_mainfile(filepath=str(source / 'fixture.blend'))
    images = (color_image, roughness_image, packed_image, relocated_image, normal_image, unused_image)
    paths = [image.filepath for image in images]
    original_blend = (source / 'fixture.blend').read_bytes()
    color_bytes = (directory / 'external-a/paint.png').read_bytes()
    roughness_bytes = (directory / 'external-b/paint.png').read_bytes()
    world = scene.world
    module = runpy.run_path(str(Path(__file__).resolve().parents[1] / 'tools/export_showcase.py'))
    output = directory / 'export/scenes/fixture.scene.json'
    module['export_showcase'](output)
    document = json.loads(output.read_text())
    reference = next(iter(document['entities'][obj.name]['components'].values()))
    model = json.loads((output.parent / reference).read_text())
    nodes = model['materials'][material.name]['graph']['nodes']
    texture_paths = [node['surface']['path'] for node in nodes.values() if node['type'] == 'imageTexture']
    assert len(set(texture_paths)) == 5, texture_paths
    exported_bytes = [(directory / 'export' / relative).read_bytes() for relative in texture_paths]
    assert color_bytes != roughness_bytes
    assert color_bytes in exported_bytes and roughness_bytes in exported_bytes
    assert bytes(packed_image.packed_file.data) in exported_bytes
    assert any(relative.endswith('.luz.png') for relative in texture_paths)
    assert (source / 'poliigon/fixture/alpha.png').read_bytes() in exported_bytes
    assert paths == [image.filepath for image in images]
    assert (source / 'fixture.blend').read_bytes() == original_blend
    assert scene.world == world and scene.frame_current == 2

    saved_export = output.read_bytes()
    color_texture.image = unused_image
    try:
        module['export_showcase'](output)
    except RuntimeError as error:
        assert 'missing' in str(error) and 'unused.png' in str(error), str(error)
    else:
        raise AssertionError('A missing, unpacked source must fail without replacing the exported scene')
    assert output.read_bytes() == saved_export
    assert scene.world == world and scene.frame_current == 2
    print(
        'Showcase texture fixture passed: external paths, name collisions, groups, packed images, TIFF, relocation and restoration'
    )


if __name__ == '__main__':
    with tempfile.TemporaryDirectory(prefix='luz-showcase-textures-') as temporary_directory:
        run_fixture(Path(temporary_directory).resolve())
