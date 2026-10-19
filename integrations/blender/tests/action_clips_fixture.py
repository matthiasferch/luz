"""Validate evaluated action clips, slot isolation, and restoration without authored assets."""

import argparse
import json
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).parent))
from entity_hierarchy_fixture import exporter, failure


def run(output):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, 5
    bpy.ops.object.armature_add()
    armature = bpy.context.object
    armature.name = 'Rig'
    bpy.ops.object.mode_set(mode='EDIT')
    child = armature.data.edit_bones.new('Child')
    child.head, child.tail = (0, 0, 1), (0, 0, 2)
    child.parent = armature.data.edit_bones[0]
    bpy.ops.object.mode_set(mode='OBJECT')
    root = armature.pose.bones[0]
    child = armature.pose.bones['Child']
    child.rotation_mode = 'XYZ'
    for frame, value in [(1, 0), (3, 0.2), (5, 0)]:
        root.location.x = value
        root.keyframe_insert('location', frame=frame)
    idle = armature.animation_data.action
    idle.name = 'Idle'
    idle_slot = armature.animation_data.action_slot
    armature.animation_data.action = None
    track = armature.animation_data.nla_tracks.new()
    strip = track.strips.new('Idle', 1, idle)
    strip.action_slot = idle_slot
    track.mute = True
    for frame, value in [(10, 0), (12, 0.5), (14, 0)]:
        child.rotation_euler.z = value
        child.keyframe_insert('rotation_euler', frame=frame)
    wave = armature.animation_data.action
    wave.name = 'Wave'
    wave_slot = armature.animation_data.action_slot
    mover = bpy.data.objects.new('Mover', None)
    scene.collection.objects.link(mover)
    for frame, value in [(1, 0), (5, 1)]:
        mover.location.x = value
        mover.keyframe_insert('location', frame=frame)
    meshes = []
    for name in ('Joints', 'Surface'):
        data = bpy.data.meshes.new(name)
        data.from_pydata([(0, 0, 0), (1, 0, 0), (0, 0, 2)], [], [(0, 1, 2)])
        obj = bpy.data.objects.new(name, data)
        scene.collection.objects.link(obj)
        obj.parent = armature
        obj.vertex_groups.new(name=child.name).add([0, 1, 2], 1, 'REPLACE')
        obj.modifiers.new('Skin', 'ARMATURE').object = armature
        meshes.append(obj)
    bpy.context.view_layer.objects.active = armature
    scene.frame_set(3, subframe=0.25)
    path = output / 'entities' / 'actions.entity.json'

    def export():
        exporter.export_luz_entity(
            bpy.context,
            str(path),
            bake_animation=True,
            animation_source='actions',
            animation_tolerances={'translation': 0, 'rotation': 0, 'scale': 0},
        )

    def check_state():
        animation = armature.animation_data
        assert animation.action == wave and animation.action_slot == wave_slot
        assert animation.use_nla and track.mute
        assert scene.frame_current == 3 and abs(scene.frame_subframe - 0.25) < 1e-6

    def models_in(directory):
        return [json.loads(file.read_text()) for file in (directory / 'models').glob('*.model.json')]

    def components_in(node):
        yield from node.get('components', {}).values()
        for child in node.get('children', {}).values():
            yield from components_in(child)

    for source, expected in [('timeline', {'Timeline'}), ('actions', {'Idle', 'Wave'})]:
        directory = output / source
        exporter.export_luz_scene(
            bpy.context,
            str(directory / 'scenes' / 'fixture.scene.json'),
            bake_animation=True,
            animation_source=source,
        )
        assert all(set(model['animations']) == expected for model in models_in(directory))
        models = models_in(directory)
        assert models[0]['animations'] == models[1]['animations']
        assert len(list((directory / 'animations').glob('*.animation.json'))) == len(expected)
        document = json.loads((directory / 'scenes' / 'fixture.scene.json').read_text())
        components = [component for node in document['entities'].values() for component in components_in(node)]
        assert any(isinstance(component, dict) and component.get('type') == 'animation' for component in components)
        check_state()

    exporter.export_luz_entity(
        bpy.context, str(output / 'static' / 'entities' / 'fixture.entity.json'), animation_source='actions'
    )
    assert all(not model.get('animations') and not model.get('armatures') for model in models_in(output / 'static'))
    check_state()
    scene.frame_end = scene.frame_start
    export()
    scene.frame_end = 5
    check_state()
    entity = json.loads(path.read_text())
    assert not any(
        isinstance(component, dict) and component.get('type') == 'animation' for component in components_in(entity)
    )
    for obj in meshes:
        document = output / 'models' / (exporter.asset_filename(obj) + '.model.json')
        model = json.loads(document.read_text())
        assert set(model['animations']) == {'Idle', 'Wave'}
        for action, slot in [(idle, idle_slot), (wave, wave_slot)]:
            clip = json.loads((output / 'models' / model['animations'][action.name]).read_text())
            assert clip['isAutoplayEnabled'] is False and 'playback' not in clip
            assert abs(clip['duration'] - 4 / 24) < 1e-7
            with exporter.isolated_armature_action(bpy.context, armature, action, slot):
                for bone_name, tracks in clip['keyframes'].items():
                    for channel, keys in tracks.items():
                        for key in keys:
                            scene.frame_set(int(action.frame_range[0] + round(key['time'] * 24)))
                            depsgraph = bpy.context.evaluated_depsgraph_get()
                            offset = (
                                obj.evaluated_get(depsgraph).matrix_world.inverted()
                                @ armature.evaluated_get(depsgraph).matrix_world
                            )
                            bone = armature.evaluated_get(depsgraph).pose.bones[bone_name]
                            matrix = offset @ bone.matrix
                            if bone.parent:
                                matrix = (offset @ bone.parent.matrix).inverted() @ matrix
                            pose = exporter.convert_transform(matrix, bone_name)
                            assert exporter.animation_deviation(channel, pose[channel], key['value']) < 1e-5
    check_state()
    idle.name = 'Timeline'
    export()
    assert all(set(model['animations']) == {'Timeline', 'Wave'} for model in models_in(output))
    idle.name = 'Idle'
    export()
    published = {file: file.read_bytes() for file in output.rglob('*') if file.is_file()}
    original_sample = exporter.SkeletalExport.sample

    def fail_action_sample(skeleton, depsgraph, frame):
        if armature.animation_data.action == idle:
            raise RuntimeError('injected action failure')
        original_sample(skeleton, depsgraph, frame)

    exporter.SkeletalExport.sample = fail_action_sample
    try:
        failure(export, 'injected action failure')
        check_state()
        assert all(file.read_bytes() == content for file, content in published.items())
    finally:
        exporter.SkeletalExport.sample = original_sample
    armature.keyframe_insert('location', frame=10)
    failure(export, 'bone transform channels')
    check_state()
    assert all(file.read_bytes() == content for file, content in published.items())
    print('PASS action clips, slot isolation, evaluated poses, and failure restoration:', output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1 :])
    run(Path(args.output).resolve())
