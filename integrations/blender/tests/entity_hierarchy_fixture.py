"""Run with Blender --background --python this_file -- --output <directory>.

Produces both export workflows plus a manifest consumed by blender-entity-reload.test.ts.
"""

import argparse
import importlib.util
import json
import math
import os
import sys
import tempfile

import bpy
from mathutils import Matrix, Quaternion

spec = importlib.util.spec_from_file_location(
    'luz_exporter_fixture', os.path.join(os.path.dirname(__file__), '..', 'luz_exporter', 'exporter.py')
)
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


def empty(name, collection):
    obj = bpy.data.objects.new(name, None)
    collection.objects.link(obj)
    return obj


def mesh(name, collection):
    data = bpy.data.meshes.new(name)
    data.from_pydata([(0, 0, 0), (1, 0, 0), (0, 1, 0), (0, 0, 1)], [], [(0, 2, 1), (0, 1, 3), (1, 2, 3), (2, 0, 3)])
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    return obj


def matrix(node):
    q = node.get('rotation', [0, 0, 0, 1])
    return Matrix.LocRotScale(
        node.get('translation', [0, 0, 0]), Quaternion((q[3], *q[:3])), node.get('scale', [1, 1, 1])
    )


def flatten(document, roots):
    result = {}

    def visit(node, filename, path, parent):
        if 'entity' in node:
            target = os.path.normpath(os.path.join(os.path.dirname(filename), node['entity']))
            with open(target, encoding='utf-8') as source:
                resolved = json.load(source)
            resolved.update({key: value for key, value in node.items() if key in ('translation', 'rotation', 'scale')})
            return visit(resolved, target, path, parent)
        world = parent @ matrix(node)
        result[path] = (world, node)
        for key, child in node.get('children', {}).items():
            visit(child, filename, path + '/' + key, world)

    for key, node in roots.items():
        visit(node, document, key, Matrix.Identity(4))
    return result


def close(a, b, label):
    error = max(abs(a[row][col] - b[row][col]) for row in range(4) for col in range(4))
    assert error < 2e-5, (label, error, a, b)


def failure(action, message):
    try:
        action()
    except RuntimeError as error:
        assert message in str(error), str(error)
    else:
        raise AssertionError('Expected rejection: ' + message)


def main(output):
    os.makedirs(output, exist_ok=True)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.world = None
    collection = scene.collection
    root = empty('Assembly', collection)
    root.location = (3, 4, 5)
    root.rotation_euler = (0.2, 0.3, 0.4)
    root.scale = (2, 3, 4)
    child = mesh('Part', collection)
    child.data.name = 'Reflector'  # Preserve the authored name even when a generated key collides.
    child.parent = root
    child.matrix_parent_inverse = Matrix.Translation((0.3, -0.5, 0.7))
    child.location = (1, 2, 3)
    child.rotation_euler = (0.1, 0.5, 0.2)  # Inherited shear is valid; local pose remains TRS.
    child['luz_planar_reflector'] = True
    marker = empty('Marker', collection)
    marker.parent = child
    marker.location = (0.5, 0.5, 0.5)
    camera = bpy.data.objects.new('View', bpy.data.cameras.new('View'))
    camera.data.name = 'Main Optics'
    collection.objects.link(camera)
    camera.parent = root
    camera.location = (0, -4, 2)
    light = bpy.data.objects.new('Lamp', bpy.data.lights.new('Lamp', 'SPOT'))
    light.data.name = 'Warm Key'
    collection.objects.link(light)
    light.parent = marker
    light.data.shadow_soft_size = 0.01
    light.data.cutoff_distance = 22.0
    assert exporter.light_component_from_object(light)['range'] == 22.0
    light['luz_range'] = 16.0
    assert exporter.light_component_from_object(light)['range'] == 16.0
    del light['luz_range']
    for value, expected_falloff in [(-1.0, 0.0), (5.0, 5.0), (360.0, math.degrees(light.data.spot_size))]:
        light['luz_cone_falloff'] = value
        assert exporter.light_component_from_object(light)['coneFalloff'] == exporter.round5(expected_falloff)
    del light['luz_cone_falloff']
    sun = bpy.data.objects.new('Sun', bpy.data.lights.new('Sun', 'SUN'))
    collection.objects.link(sun)
    sun.parent = root
    sun.location = (0, 0, 10)
    sun.rotation_euler = (0.3, -0.2, 0.4)
    sun.data['luz_shadow_width'] = 32.0
    sun['luz_shadow_width'] = 24.0
    sun['luz_shadow_height'] = 16.0
    sun['luz_clip_end'] = 60.0
    sun_component = exporter.light_component_from_object(sun)
    assert sun_component['lightType'] == 'directional'
    assert 'coneAngle' not in sun_component and 'coneFalloff' not in sun_component
    assert sun_component['shadowSize'] == [24.0, 16.0]
    assert sun_component['clipPlanes'] == [0.1, 60.0]
    for invalid in (0.0, -1.0, float('inf'), 'invalid'):
        sun['luz_shadow_width'] = invalid
        failure(lambda: exporter.light_component_from_object(sun), 'Light')
    sun['luz_shadow_width'] = 24.0
    for unsupported_type in ('AREA',):
        unsupported = bpy.data.objects.new('Unsupported', bpy.data.lights.new('Unsupported', unsupported_type))
        failure(lambda: exporter.light_component_from_object(unsupported), 'unsupported type')
        bpy.data.objects.remove(unsupported)
    point = bpy.data.objects.new('Point', bpy.data.lights.new('Point', 'POINT'))
    collection.objects.link(point)
    point.parent = root
    point.location = (2, 1, 3)
    point.data.cutoff_distance = 8.0
    assert exporter.light_component_from_object(point)['range'] == 8.0
    point.data['luz_range'] = 10.0
    point['luz_range'] = 12.0
    point['luz_clip_end'] = 15.0
    point_component = exporter.light_component_from_object(point)
    assert point_component['lightType'] == 'point'
    assert 'coneAngle' not in point_component and 'coneFalloff' not in point_component
    assert point_component['range'] == 12.0
    for invalid in (0.0, -1.0, float('inf'), 'invalid'):
        point['luz_range'] = invalid
        failure(lambda: exporter.light_component_from_object(point), 'Light')
    point['luz_range'] = 12.0
    body = mesh('BodyRoot', collection)
    body.data.name = 'Body'
    body.location = (20, 0, 4)
    body.scale = (1, 2, 3)
    body['is_rigid_body'] = True
    body_child = empty('BodyMarker', collection)
    body_child.parent = body
    body_child.location = (0, 0, 2)

    inner = bpy.data.collections.new('Inner')
    inner.instance_offset = (0.5, 1, 2)
    source_root = empty('SourceRoot', inner)
    source_root.location = (2, 3, 4)
    source = mesh('SourceMesh', inner)
    source.parent = source_root
    source.location = (1, 0, 0)
    outer = bpy.data.collections.new('Outer')
    outer.instance_offset = (1, -2, 3)
    nested = empty('Nested', outer)
    nested.instance_type = 'COLLECTION'
    nested.instance_collection = inner
    nested.location = (4, 5, 6)
    nested.rotation_euler.z = 0.7
    for name, x in [('InstanceA', -3), ('InstanceB', 8)]:
        placement = empty(name, collection)
        placement.instance_type = 'COLLECTION'
        placement.instance_collection = outer
        placement.location = (x, 0, 0)

    # Two linked libraries may legally provide objects with exactly the same name.
    for index in range(2):
        source_collection = bpy.data.collections.new('LinkedSource')
        linked_mesh = mesh('SameName', source_collection)
        linked_mesh.location.x = index + 1
        library_path = os.path.join(output, f'source-{index}.blend')
        bpy.data.libraries.write(library_path, {source_collection})
        bpy.data.objects.remove(linked_mesh, do_unlink=True)
        bpy.data.collections.remove(source_collection)
        with bpy.data.libraries.load(library_path, link=True) as (available, loaded):
            loaded.collections = ['LinkedSource']
        placement = empty(f'Linked{index}', collection)
        placement.instance_type = 'COLLECTION'
        placement.instance_collection = loaded.collections[0]
        placement.location.x = index * 10

    bpy.context.view_layer.update()
    scene_path = os.path.join(output, 'scenes', 'fixture.scene.json')
    exporter.export_luz_scene(bpy.context, scene_path)
    with open(scene_path, encoding='utf-8') as file:
        data = json.load(file)
    assert data['entities']['InstanceA']['entity'] == data['entities']['InstanceB']['entity']
    flat = flatten(scene_path, data['entities'])
    basis = Matrix(exporter.transformation_matrix).to_4x4()
    expected = {}
    for path, obj in [
        ('Assembly', root),
        ('Assembly/Part', child),
        ('Assembly/Part/Marker', marker),
        ('Assembly/View', camera),
        ('Assembly/Part/Marker/Lamp', light),
        ('Assembly/Sun', sun),
        ('Assembly/Point', point),
        ('BodyRoot', body),
        ('BodyRoot/BodyMarker', body_child),
    ]:
        world = basis @ obj.evaluated_get(bpy.context.evaluated_depsgraph_get()).matrix_world @ basis.inverted()
        close(flat[path][0], world, path)
        expected[path] = [world[row][col] for col in range(4) for row in range(4)]
    for instance in bpy.context.evaluated_depsgraph_get().object_instances:
        if instance.is_instance and instance.object.original == source:
            path = instance.parent.original.name + '/Nested/SourceRoot/SourceMesh'
            world = basis @ instance.matrix_world @ basis.inverted()
            close(flat[path][0], world, path)
            expected[path] = [world[row][col] for col in range(4) for row in range(4)]
    assert sum(path.startswith('Instance') for path in expected) == 2
    assert set(flat['Assembly/Part'][1]['components']) == {'Reflector', 'Reflector.001'}
    assert flat['Assembly/Part'][1]['components']['Reflector.001']['type'] == 'reflector'
    assert flat['Assembly/View'][1]['components']['Main Optics']['type'] == 'camera'
    assert flat['Assembly/Part/Marker/Lamp'][1]['components']['Warm Key']['type'] == 'light'
    spot_component = flat['Assembly/Part/Marker/Lamp'][1]['components']['Warm Key']
    assert spot_component['lightType'] == 'spot'
    assert spot_component['coneAngle'] == exporter.round5(math.degrees(light.data.spot_size))
    assert spot_component['coneFalloff'] == 10.0
    assert spot_component['range'] == light.data.cutoff_distance
    assert flat['Assembly/Sun'][1]['components']['Sun'] == sun_component
    assert flat['Assembly/Point'][1]['components']['Point'] == point_component
    assert set(flat['BodyRoot'][1]['components']) == {'Body', 'Body.001'}
    assert flat['BodyRoot'][1]['components']['Body.001']['type'] == 'body'
    linked_models = [
        component
        for path, (_, node) in flat.items()
        if path.startswith('Linked')
        for component in node.get('components', {}).values()
        if isinstance(component, str)
    ]
    assert len(linked_models) == 2 and linked_models[0] != linked_models[1]

    bpy.context.view_layer.objects.active = root
    entity_path = os.path.join(output, 'entities', 'assembly.entity.json')
    exporter.export_luz_entity(bpy.context, entity_path)
    with open(entity_path, encoding='utf-8') as file:
        asset = json.load(file)
    assert asset['translation'] == [0, 0, 0] and asset['rotation'] == [0, 0, 0, 1]
    assert all(abs(a - b) < 1e-5 for a, b in zip(asset['scale'], [2, 4, 3]))
    normalized = flatten(entity_path, {'Assembly': asset})
    inverse_placement = matrix(dict(data['entities']['Assembly'], scale=[1, 1, 1])).inverted()
    for path in normalized:
        close(normalized[path][0], inverse_placement @ flat[path][0], path)
        assert normalized[path][1].get('components', {}).keys() == flat[path][1].get('components', {}).keys()
    bpy.context.view_layer.objects.active = body
    exporter.export_luz_entity(bpy.context, os.path.join(output, 'entities', 'body.entity.json'))

    root.hide_set(True)
    filtered = os.path.join(output, 'scenes', 'filtered.scene.json')
    exporter.export_luz_scene(bpy.context, filtered, only_visible=True)
    with open(filtered, encoding='utf-8') as file:
        filtered_data = json.load(file)
    assert 'Part' in filtered_data['entities']['Assembly']['children']
    assert filtered_data['entities']['Assembly']['components'] == {}
    root.hide_set(False)

    child['is_rigid_body'] = True
    failure(lambda: exporter.export_luz_scene(bpy.context, scene_path), 'nested physics body')
    del child['is_rigid_body']
    child.data.attributes.new('is_collider', 'BOOLEAN', 'FACE').data[0].value = True
    failure(lambda: exporter.export_luz_scene(bpy.context, scene_path), 'attached polygon colliders')
    child.data.attributes.remove(child.data.attributes['is_collider'])
    failure(lambda: exporter.convert_transform(Matrix.Diagonal((0, 1, 1, 1)), 'zero'), 'singular')
    shear = Matrix.Identity(4)
    shear[0][1] = 0.3
    failure(lambda: exporter.convert_transform(shear, 'shear'), 'local shear')
    # A failed export must not replace the published document.
    with open(scene_path, encoding='utf-8') as file:
        assert json.load(file) == data
    with open(os.path.join(output, 'manifest.json'), 'w', encoding='utf-8') as file:
        json.dump({'scene': scene_path, 'entity': entity_path, 'expected': expected}, file, indent=2)
    print('Entity hierarchy fixture passed: ' + output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default=os.path.join(tempfile.gettempdir(), 'luz-entity-hierarchy-fixture'))
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else [])
    main(os.path.abspath(args.output))
