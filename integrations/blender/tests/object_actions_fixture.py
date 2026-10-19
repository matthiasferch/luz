"""Compare independently sampled object Actions with exported scene/entity poses."""

import argparse
import json
import sys
from pathlib import Path

import bpy
from mathutils import Matrix

sys.path.insert(0, str(Path(__file__).parent))
from entity_hierarchy_fixture import empty, exporter, failure, mesh


def create_action(obj, name, channel, keys):
    obj.animation_data_create().action = None
    for frame, value in keys:
        setattr(obj, channel, value)
        obj.keyframe_insert(channel, frame=frame)
    animation = obj.animation_data
    action, slot = animation.action, animation.action_slot
    action.name = name
    track = animation.nla_tracks.new()
    track.strips.new(name, 1, action).action_slot = slot
    track.mute = True
    return action, slot


def run(output):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start, scene.frame_end = 1, 9
    scene.render.fps = 8
    platform = mesh('Platform', scene.collection)
    platform['is_rigid_body'] = True
    horizontal = create_action(platform, 'Horizontal', 'location', [(1, (3, 2, 1)), (9, (7, 2, 1))])
    create_action(platform, 'Vertical', 'location', [(10, (5, 2, 4)), (26, (5, 2, 8))])
    create_action(platform, 'Hold', 'location', [(4, (6, 2, 3)), (8, (6, 2, 3))])
    create_action(platform, 'Turn', 'rotation_euler', [(1, (0, 0, 0.3)), (9, (0, 0, 1))])
    platform.rotation_euler = (0, 0, 0)
    platform.animation_data.action, platform.animation_data.action_slot = horizontal
    parent = empty('StaticParent', scene.collection)
    parent.location, parent.rotation_euler = (1, 2, 3), (0, 0, 0.4)
    child = empty('Child', scene.collection)
    child.parent = parent
    create_action(child, 'Scale', 'scale', [(1, (1, 2, 1)), (9, (2, 3, 2))])
    target = empty('Target', scene.collection)
    target.location = (2, 3, 4)
    child.constraints.new('COPY_LOCATION').target = target
    child.driver_add('rotation_euler', 2).driver.expression = 'frame / 40'

    action, slot = horizontal
    second_slot = action.slots.new(id_type='OBJECT', name='Other')
    bag = action.layers[0].strips[0].channelbags.new(second_slot)
    for index, value in enumerate((8, 2, 1)):
        curve = bag.fcurves.new('location', index=index)
        curve.keyframe_points.insert(1, value)
        curve.keyframe_points.insert(9, value + index)
    track = platform.animation_data.nla_tracks.new()
    track.strips.new('Other slot', 1, action).action_slot = second_slot
    track.mute = True

    scene.frame_set(3, subframe=0.25)
    scene_path = output / 'scenes' / 'actions.scene.json'
    entity_path = output / 'entities' / 'platform.entity.json'
    bpy.context.view_layer.objects.active = platform

    def export():
        exporter.export_luz_scene(
            bpy.context,
            str(scene_path),
            bake_animation=True,
            animation_source='actions',
            animation_tolerances={'translation': 0, 'rotation': 0, 'scale': 0},
        )

    def check_state():
        assert scene.frame_current == 3 and scene.frame_subframe == 0.25
        assert platform.animation_data.action == horizontal[0]
        assert platform.animation_data.action_slot == horizontal[1]
        assert all(track.mute for track in platform.animation_data.nla_tracks)
        assert not child.animation_data.drivers[0].mute

    export()
    check_state()
    exporter.export_luz_entity(bpy.context, str(entity_path), bake_animation=True, animation_source='actions')
    check_state()
    document = json.loads(scene_path.read_text())
    components = document['entities']['Platform']['components']
    assert {'Horizontal', 'Horizontal.001', 'Vertical', 'Hold', 'Turn'} <= components.keys()
    assert components['Vertical']['duration'] == 2
    assert components['Vertical']['tracks']['translation'][0]['value'] != [0, 0, 0]
    assert components['Hold']['tracks']
    assert components['Body']['motionType'] == 'kinematic'
    for component in components.values():
        if isinstance(component, dict) and component['type'] == 'animation':
            assert component['schemaVersion'] == 2 and component['isAutoplayEnabled'] is False
            assert component['playback'] == 'once' and 'isLooping' not in component

    basis = Matrix(exporter.transformation_matrix).to_4x4()
    expected = []
    with exporter.animation_export_state(bpy.context, True):
        position, rotation, _ = platform.matrix_world.decompose()
        placement = Matrix.LocRotScale(position, rotation, (1, 1, 1)).inverted()
        for obj, path in [(platform, 'Platform'), (child, 'StaticParent/Child')]:
            references = [
                (strip.action, strip.action_slot) for track in obj.animation_data.nla_tracks for strip in track.strips
            ]
            names = set()
            for action, slot in sorted(set(references), key=lambda pair: (pair[0].name, pair[1].identifier)):
                name, suffix = action.name, 1
                while name in names:
                    name = f'{action.name}.{suffix:03d}'
                    suffix += 1
                names.add(name)
                poses = []
                with exporter.isolated_object_action(bpy.context, obj, action, slot):
                    for frame in range(int(action.frame_range[0]), int(action.frame_range[1]) + 1):
                        scene.frame_set(frame)
                        world = obj.evaluated_get(bpy.context.evaluated_depsgraph_get()).matrix_world
                        matrix = basis @ world @ basis.inverted()
                        entity_matrix = basis @ placement @ world @ basis.inverted()
                        poses.append(
                            {
                                'scene': [v for column in matrix.transposed() for v in column],
                                'entity': [v for column in entity_matrix.transposed() for v in column],
                            }
                        )
                expected.append({'path': path, 'name': name, 'poses': poses})
    check_state()
    (output / 'manifest.json').write_text(
        json.dumps({'scene': str(scene_path), 'entity': str(entity_path), 'expected': expected})
    )

    published = {file: file.read_bytes() for file in output.rglob('*') if file.is_file()}
    original_convert = exporter.convert_transform

    def fail_sample(matrix, name):
        if 'action Vertical' in name:
            raise RuntimeError('injected object action failure')
        return original_convert(matrix, name)

    exporter.convert_transform = fail_sample
    try:
        failure(export, 'injected object action failure')
    finally:
        exporter.convert_transform = original_convert
    check_state()
    assert all(file.read_bytes() == data for file, data in published.items())
    platform['custom'] = 0
    platform.keyframe_insert('["custom"]', frame=1)
    failure(export, 'transform channels only')
    bag = horizontal[0].layers[0].strips[0].channelbag(horizontal[1])
    bag.fcurves.remove(next(curve for curve in bag.fcurves if curve.data_path == '["custom"]'))
    create_action(target, 'External', 'location', [(1, (2, 3, 4)), (9, (3, 3, 4))])
    failure(export, 'requires Timeline')
    check_state()
    assert all(file.read_bytes() == data for file, data in published.items())
    print('PASS object Actions, slots, offsets, constraints/drivers, restoration, publication:', output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    run(Path(parser.parse_args(sys.argv[sys.argv.index('--') + 1 :]).output).resolve())
