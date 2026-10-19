"""Check planar root motion removal across rotated mesh spaces and both animation sources."""

import argparse
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Matrix, Quaternion, Vector

sys.path.insert(0, str(Path(__file__).parent))
from entity_hierarchy_fixture import exporter


def evaluate(keys, time, channel='translation'):
    for first, second in zip(keys, keys[1:]):
        if first['time'] <= time <= second['time']:
            return exporter.animation_interpolate(
                channel, first['value'], second['value'], (time - first['time']) / (second['time'] - first['time'])
            )
    return keys[-1]['value']


def run(output):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end, scene.render.fps = 1, 5, 4
    wrapper = bpy.data.objects.new('Character', None)
    scene.collection.objects.link(wrapper)
    wrapper.rotation_euler.z = 0.35
    for frame in (1, 3, 5):
        wrapper.location = ((frame - 1) / 100, (frame - 1) / 50, (frame - 1) / 40)
        wrapper.keyframe_insert('location', frame=frame)
    for curve in (
        wrapper.animation_data.action.layers[0].strips[0].channelbag(wrapper.animation_data.action_slot).fcurves
    ):
        for point in curve.keyframe_points:
            point.interpolation = 'LINEAR'
    bpy.ops.object.armature_add()
    rig = bpy.context.object
    rig.name = 'Rig'
    rig.parent = wrapper
    rig.rotation_euler.x = math.pi / 2
    rig.scale = (0.02,) * 3
    bpy.ops.object.mode_set(mode='EDIT')
    root = rig.data.edit_bones[0]
    root.name = 'Hips'
    root.head, root.tail = (0, 0, 0), (0, 1, 0)
    child = rig.data.edit_bones.new('Child')
    child.head, child.tail, child.parent = (0, 1, 0), (0, 2, 0), root
    bpy.ops.object.mode_set(mode='OBJECT')
    for frame, height in [(1, 0), (3, 3), (5, 0)]:
        root = rig.pose.bones['Hips']
        root.rotation_mode = 'QUATERNION'
        root.location = (2 * frame, height, -4 * frame)
        root.rotation_quaternion = Quaternion((0, 1, 0), height / 10)
        root.keyframe_insert('location', frame=frame)
        root.keyframe_insert('rotation_quaternion', frame=frame)
        child = rig.pose.bones['Child']
        child.rotation_mode = 'QUATERNION'
        child.rotation_quaternion = Quaternion((1, 0, 0), height / 5)
        child.keyframe_insert('rotation_quaternion', frame=frame)
    action = rig.animation_data.action
    action.name = 'Travel'
    meshes = []
    for index in range(2):
        mesh = bpy.data.meshes.new(f'Skin{index}')
        mesh.from_pydata([(0, 0, 0), (1, 0, 0), (0, 1, 0)], [], [(0, 1, 2)])
        obj = bpy.data.objects.new(mesh.name, mesh)
        scene.collection.objects.link(obj)
        obj.parent = rig
        obj.location = (index + 1, -0.4, 0.2)
        obj.rotation_euler = (0.3 * index, 0, 0.2)
        obj.vertex_groups.new(name='Child').add([0, 1, 2], 1, 'REPLACE')
        obj.modifiers.new('Skin', 'ARMATURE').object = rig
        meshes.append(obj)
    scene.frame_set(1)
    world_matrices = {obj.name: obj.matrix_world.copy() for obj in meshes}
    scene.frame_set(3, subframe=0.25)
    bpy.context.view_layer.objects.active = wrapper
    inverse_basis = Matrix(exporter.transformation_matrix).inverted()

    def export(directory, source, in_place):
        exporter.export_luz_entity(
            bpy.context,
            str(directory / 'entities' / 'character.entity.json'),
            bake_animation=True,
            animation_source=source,
            in_place=in_place,
            animation_tolerances={'translation': 1e-5, 'rotation': 1e-5, 'scale': 1e-5},
        )
        assert scene.frame_current == 3 and scene.frame_subframe == 0.25
        assert rig.animation_data.action == action

    for source, clip_name in [('actions', 'Travel'), ('timeline', 'Timeline')]:
        raw_directory, pinned_directory = output / source / 'raw', output / source / 'in-place'
        export(raw_directory, source, False)
        export(pinned_directory, source, True)
        for obj in meshes:
            filename = exporter.asset_filename(obj) + '.model.json'
            raw = json.loads((raw_directory / 'models' / filename).read_text())
            pinned = json.loads((pinned_directory / 'models' / filename).read_text())
            raw_tracks = json.loads((raw_directory / 'models' / raw['animations'][clip_name]).read_text())['keyframes']
            pinned_tracks = json.loads((pinned_directory / 'models' / pinned['animations'][clip_name]).read_text())[
                'keyframes'
            ]
            assert raw_tracks['Child'] == pinned_tracks['Child']
            assert raw_tracks['Hips']['rotation'] == pinned_tracks['Hips']['rotation']
            assert raw_tracks['Hips']['scale'] == pinned_tracks['Hips']['scale']
            assert raw['armatures'] == pinned['armatures']
            world = world_matrices[obj.name]
            initial = world @ (inverse_basis @ Vector(evaluate(raw_tracks['Hips']['translation'], 0)))
            for frame in range(5):
                time = frame / 4
                original = world @ (inverse_basis @ Vector(evaluate(raw_tracks['Hips']['translation'], time)))
                actual = world @ (inverse_basis @ Vector(evaluate(pinned_tracks['Hips']['translation'], time)))
                assert abs(actual.x - initial.x) < 1e-5 and abs(actual.y - initial.y) < 1e-5
                assert abs(actual.z - original.z) < 1e-5
            assert abs(original.x - initial.x) + abs(original.y - initial.y) > 0.05
        if source == 'timeline':
            entity = json.loads((pinned_directory / 'entities' / 'character.entity.json').read_text())
            animation = next(
                component for component in entity['components'].values() if component['type'] == 'animation'
            )
            rotation = Quaternion((entity['rotation'][3], *entity['rotation'][:3]))
            for frame in range(5):
                displacement = inverse_basis @ (
                    rotation @ Vector(evaluate(animation['tracks']['translation'], frame / 4))
                )
                assert abs(displacement.x) < 1e-5 and abs(displacement.y) < 1e-5
                assert abs(displacement.z - frame / 40) < 1e-5
    root.rotation_quaternion = Quaternion((0, 1, 0), 0.5)
    root.keyframe_insert('rotation_quaternion', frame=5)
    export(output / 'turn-in-place', 'actions', True)
    for file in (output / 'turn-in-place' / 'models').glob('*.model.json'):
        reference = json.loads(file.read_text())['animations']['Travel']
        clip = json.loads((file.parent / reference).read_text())
        rotations = clip['keyframes']['Hips']['rotation']
        assert 'playback' not in clip
        assert exporter.animation_deviation('rotation', rotations[0]['value'], rotations[-1]['value']) > 0.1
    assert scene.frame_current == 3 and scene.frame_subframe == 0.25
    print('PASS in-place actions/timeline, rotated meshes, vertical motion, final turns, and restoration')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    arguments = parser.parse_args(sys.argv[sys.argv.index('--') + 1 :])
    run(Path(arguments.output).resolve())
