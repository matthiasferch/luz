"""Blender fixture for baked scene/entity transforms and engine reload validation."""

import argparse
import json
import os
import sys
import tempfile

import bpy
from mathutils import Matrix

sys.path.insert(0, os.path.dirname(__file__))
from entity_hierarchy_fixture import empty, exporter, failure, mesh


def animate(obj, path, start, middle):
    for frame, value in [(1, start), (5, middle), (9, start)]:
        setattr(obj, path, value)
        obj.keyframe_insert(data_path=path, frame=frame)


def main(output):
    os.makedirs(output, exist_ok=True)
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.world = None
    scene.frame_start, scene.frame_end = 1, 9
    scene.render.fps, scene.render.fps_base = 8, 1.25
    root = empty('Assembly', scene.collection)
    root.scale = (2, 3, 4)
    animate(root, 'location', (3, 4, 5), (5, 3, 7))
    animate(root, 'rotation_euler', (0.1, 0.2, 0.3), (0.4, 0.3, 0.8))
    part = mesh('Part', scene.collection)
    part.parent = root
    part.matrix_parent_inverse = Matrix.Translation((0.3, -0.5, 0.7))
    animate(part, 'rotation_euler', (0.1, 0.3, 0.2), (0.3, 0.4, 0.5))
    animate(part, 'scale', (1, 2, 1), (1.5, 1, 2))
    part['luz_planar_reflector'] = True
    lamp = bpy.data.objects.new('Lamp', bpy.data.lights.new('Lamp', 'POINT'))
    scene.collection.objects.link(lamp)
    lamp.parent = part
    animate(lamp, 'location', (0, 0, 1), (0, 0, 3))
    camera = bpy.data.objects.new('Camera', bpy.data.cameras.new('Camera'))
    scene.collection.objects.link(camera)
    camera.parent = root
    animate(camera, 'location', (0, -4, 1), (0, -2, 2))

    driver = empty('Driven', scene.collection)
    driver.driver_add('location', 0).driver.expression = 'sin((frame-1)*pi/4)'
    constrained = empty('Constrained', scene.collection)
    constrained.constraints.new('COPY_LOCATION').target = driver

    body = mesh('Platform', scene.collection)
    body['is_rigid_body'] = True
    body.scale = (2, 1, 3)
    animate(body, 'location', (10, 0, 1), (11, 0, 2))
    animate(body, 'rotation_euler', (0, 0, 0), (0, 0, 0.5))
    child = empty('RiderMarker', scene.collection)
    child.parent = body
    child.location = (0, 0, 2)

    falling = mesh('Dynamic', scene.collection)
    bpy.context.view_layer.objects.active = falling
    falling.select_set(True)
    bpy.ops.rigidbody.object_add()
    falling.location = (30, 0, 8)
    falling.select_set(False)
    scene.rigidbody_world.enabled = True

    passive = mesh('Static', scene.collection)
    bpy.context.view_layer.objects.active = passive
    passive.select_set(True)
    bpy.ops.rigidbody.object_add()
    passive.rigid_body.type = 'PASSIVE'
    passive.location = (40, 0, 0)
    passive.select_set(False)
    custom_static = mesh('CustomStatic', scene.collection)
    custom_static['is_rigid_body'] = True
    custom_static['rigid_body_mass'] = 0
    custom_static.location = (50, 0, 0)

    inner = bpy.data.collections.new('Inner')
    inner.instance_offset = (1, 2, 3)
    source = mesh('Source', inner)
    animate(source, 'location', (0, 0, 0), (1, 0, 0))
    outer = bpy.data.collections.new('Outer')
    outer.instance_offset = (2, 0, 0)
    nested = empty('Nested', outer)
    nested.instance_type, nested.instance_collection = 'COLLECTION', inner
    animate(nested, 'location', (0, 0, 0), (0, 1, 0))
    placements = []
    for name, x in [('InstanceA', -5), ('InstanceB', 5)]:
        placement = empty(name, scene.collection)
        placement.instance_type, placement.instance_collection = 'COLLECTION', outer
        animate(placement, 'location', (x, 0, 0), (x, 0, 2))
        placements.append(placement)

    scene.frame_set(4, subframe=0.25)
    scene_path = os.path.join(output, 'scenes', 'animation.scene.json')
    entity_path = os.path.join(output, 'entities', 'assembly.entity.json')
    exporter.export_luz_scene(bpy.context, scene_path, bake_animation=True)
    assert scene.frame_current == 4 and scene.frame_subframe == 0.25 and scene.rigidbody_world.enabled
    bpy.context.view_layer.objects.active = root
    exporter.export_luz_entity(bpy.context, entity_path, bake_animation=True)
    assert scene.frame_current == 4 and scene.frame_subframe == 0.25 and scene.rigidbody_world.enabled
    with open(scene_path, encoding='utf-8') as file:
        data = json.load(file)
    assert data['entities']['Platform']['components']['Body']['motionType'] == 'kinematic'
    platform_animation = data['entities']['Platform']['components']['Timeline']
    assert 'samples' not in platform_animation and 'sampleRate' not in platform_animation
    assert platform_animation['playback'] == 'once' and 'isLooping' not in platform_animation
    assert platform_animation['duration'] == 1.25
    assert 'translation' in platform_animation['tracks'] and 'rotation' in platform_animation['tracks']
    assert 'scale' not in platform_animation['tracks']
    assert 'Timeline' not in data['entities']['Dynamic']['components']
    assert data['entities']['Dynamic']['components']['Body']['motionType'] == 'dynamic'
    for name in ['Static', 'CustomStatic']:
        assert data['entities'][name]['components']['Body']['motionType'] == 'static'
        assert data['entities'][name]['components']['Body']['mass'] == 0
    assert 'Timeline' in data['entities']['Driven']['components']
    assert 'Timeline' in data['entities']['Constrained']['components']
    a = data['entities']['InstanceA']['children']['Collection']['entity']
    assert a == data['entities']['InstanceB']['children']['Collection']['entity']

    linear_samples = []
    for frame in range(193):
        time = frame / 24
        if time <= 2:
            x = time / 2
        elif time <= 6:
            x = 2 - time / 2
        else:
            x = time / 2 - 4
        linear_samples.append({'translation': [x, 0, 0], 'rotation': [0, 0, 0, 1], 'scale': [1, 1, 1]})
    reduced = exporter.build_animation_tracks(linear_samples, 24)
    assert reduced['duration'] == 8
    assert len(reduced['tracks']['translation']) == 4
    assert set(reduced['tracks']) == {'translation'}

    noisy_samples = [
        {'translation': [0, 0, 0], 'rotation': [0, 0, 0, 1], 'scale': [1, 1, 1]},
        {'translation': [0.5, 0.001, 0], 'rotation': [0, 0, 0, 1], 'scale': [1, 1, 1]},
        {'translation': [1, 0, 0], 'rotation': [0, 0, 0, 1], 'scale': [1, 1, 1]},
    ]
    precise = exporter.build_animation_tracks(noisy_samples, 1)
    loose = exporter.build_animation_tracks(noisy_samples, 1, {'translation': 0.01})
    assert len(precise['tracks']['translation']) == 3
    assert len(loose['tracks']['translation']) == 2

    basis = Matrix(exporter.transformation_matrix).to_4x4()
    expected = []
    objects = {
        'Assembly': root,
        'Assembly/Part': part,
        'Assembly/Part/Lamp': lamp,
        'Assembly/Camera': camera,
        'Driven': driver,
        'Constrained': constrained,
        'Platform': body,
        'Platform/RiderMarker': child,
    }
    with exporter.animation_export_state(bpy.context, True):
        scene.frame_set(1)
        initial = root.evaluated_get(bpy.context.evaluated_depsgraph_get()).matrix_world.copy()
        position, rotation, _ = initial.decompose()
        inverse_placement = (basis @ Matrix.LocRotScale(position, rotation, (1, 1, 1)) @ basis.inverted()).inverted()
        for frame in range(1, 10):
            scene.frame_set(frame)
            graph = bpy.context.evaluated_depsgraph_get()
            poses, asset_poses = {}, {}
            for path, obj in objects.items():
                world = basis @ obj.evaluated_get(graph).matrix_world @ basis.inverted()
                poses[path] = [world[row][col] for col in range(4) for row in range(4)]
                if path.startswith('Assembly'):
                    normalized = inverse_placement @ world
                    asset_poses[path] = [normalized[row][col] for col in range(4) for row in range(4)]
            for instance in graph.object_instances:
                if instance.is_instance and instance.object.original == source:
                    path = instance.parent.original.name + '/Collection/Nested/Collection/Source'
                    world = basis @ instance.matrix_world @ basis.inverted()
                    poses[path] = [world[row][col] for col in range(4) for row in range(4)]
            assert len([path for path in poses if path.startswith('Instance')]) == 2
            expected.append({'scene': poses, 'entity': asset_poses})

    root.hide_set(True)
    filtered_path = os.path.join(output, 'filtered', 'filtered.scene.json')
    exporter.export_luz_scene(bpy.context, filtered_path, only_visible=True, bake_animation=True)
    with open(filtered_path, encoding='utf-8') as file:
        assert 'Timeline' in json.load(file)['entities']['Assembly']['components']
    root.hide_set(False)

    # Snapshot-only export remains at the evaluated current frame.
    snapshot_path = os.path.join(output, 'snapshot', 'snapshot.scene.json')
    exporter.export_luz_scene(bpy.context, snapshot_path)
    with open(snapshot_path, encoding='utf-8') as file:
        assert 'Timeline' not in json.load(file)['entities']['Assembly']['components']
    assert scene.frame_current == 4 and scene.frame_subframe == 0.25

    bad_path = os.path.join(output, 'failures', 'bad.scene.json')
    os.makedirs(os.path.dirname(bad_path), exist_ok=True)
    with open(bad_path, 'w', encoding='utf-8') as file:
        file.write('previous published document')
    body.scale = (3, 1, 3)
    body.keyframe_insert(data_path='scale', frame=5)
    body.scale = (2, 1, 3)
    body.keyframe_insert(data_path='scale', frame=1)
    body.keyframe_insert(data_path='scale', frame=9)
    failure(lambda: exporter.export_luz_scene(bpy.context, bad_path, bake_animation=True), 'body scale')
    with open(bad_path, encoding='utf-8') as file:
        assert file.read() == 'previous published document'
    assert scene.frame_current == 4 and scene.frame_subframe == 0.25 and scene.rigidbody_world.enabled
    body.animation_data_clear()
    animate(body, 'location', (10, 0, 1), (11, 0, 2))
    body.location = (12, 0, 1)
    body.keyframe_insert(data_path='location', frame=9)
    exporter.export_luz_scene(bpy.context, bad_path, bake_animation=True)
    assert scene.frame_current == 4 and scene.frame_subframe == 0.25 and scene.rigidbody_world.enabled
    polygon = mesh('MovingPolygon', scene.collection)
    polygon.data.attributes.new('is_collider', 'BOOLEAN', 'FACE').data[0].value = True
    animate(polygon, 'location', (40, 0, 0), (41, 0, 0))
    failure(
        lambda: exporter.export_luz_scene(bpy.context, bad_path, bake_animation=True),
        'moving polygon colliders',
    )
    bpy.data.objects.remove(polygon, do_unlink=True)
    part.scale = (0, 1, 1)
    part.keyframe_insert(data_path='scale', frame=5)
    failure(lambda: exporter.export_luz_scene(bpy.context, bad_path, bake_animation=True), 'frame 5')
    assert scene.frame_current == 4 and scene.frame_subframe == 0.25 and scene.rigidbody_world.enabled
    with open(os.path.join(output, 'manifest.json'), 'w', encoding='utf-8') as file:
        json.dump(
            {
                'scene': scene_path,
                'entity': entity_path,
                'sampleRate': scene.render.fps / scene.render.fps_base,
                'expected': expected,
            },
            file,
        )
    print('Transform animation fixture passed: ' + output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', default=os.path.join(tempfile.gettempdir(), 'luz-transform-animation-fixture'))
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1 :] if '--' in sys.argv else [])
    main(os.path.abspath(args.output))
