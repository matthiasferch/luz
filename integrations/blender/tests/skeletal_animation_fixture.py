"""Export synthetic rigs and optional jog.blend; record Blender's evaluated reference poses."""

import argparse
import json
import os
import struct
import sys
from pathlib import Path

import bpy
from mathutils import Matrix

sys.path.insert(0, os.path.dirname(__file__))
from entity_hierarchy_fixture import exporter, failure


def flatten(matrix):
    return [matrix[row][column] for column in range(4) for row in range(4)]


def create_rig():
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)
    scene = bpy.context.scene
    scene.world = None
    scene.frame_start, scene.frame_end, scene.render.fps = 1, 9, 8
    armature = bpy.data.objects.new('Rig', bpy.data.armatures.new('Rig'))
    scene.collection.objects.link(armature)
    bpy.context.view_layer.objects.active = armature
    armature.select_set(True)
    bpy.ops.object.mode_set(mode='EDIT')
    for index in range(65):
        bone = armature.data.edit_bones.new(f'Bone{index:02}')
        bone.head = (index * 0.02, 0.2, 0.1)
        bone.tail = (index * 0.02 + 0.3, 1.0, 0.4)
        bone.roll = 0.3
        if index:
            bone.parent = armature.data.edit_bones['Bone00' if index != 64 else 'Bone01']
    bpy.ops.object.mode_set(mode='OBJECT')
    armature.location = (2, 3, 4)
    armature.rotation_euler = (0.2, -0.3, 0.1)
    target = bpy.data.objects.new('DrivenTarget', None)
    scene.collection.objects.link(target)
    target.driver_add('location', 0).driver.expression = '0.1*sin((frame-1)*pi/4)'
    constraint = armature.pose.bones['Bone00'].constraints.new('COPY_LOCATION')
    constraint.target = target
    constraint.target_space = 'LOCAL'
    constraint.owner_space = 'LOCAL'
    constraint.use_offset = True
    tip = armature.pose.bones['Bone64']
    tip.rotation_mode = 'XYZ'
    for frame, angle in [(1, 0), (5, 0.6), (9, 0)]:
        tip.rotation_euler.z = angle
        tip.keyframe_insert('rotation_euler', frame=frame)
        armature.location.x = 2 + angle
        armature.keyframe_insert('location', frame=frame)
    action = armature.animation_data.action
    slot = armature.animation_data.action_slot
    armature.animation_data.action = None
    strip = armature.animation_data.nla_tracks.new().strips.new('EvaluatedNLA', 1, action)
    strip.action_slot = slot
    vertices = [(0, 0, 0), (1, 0, 0), (0, 1, 0), (0, 0, 1), (0, 0, 0), (1, 1, 0)]
    meshes = []
    for name in ('SkinA', 'SkinB'):
        data = bpy.data.meshes.new(name)
        data.from_pydata(vertices, [], [(0, 1, 2), (1, 3, 2), (4, 5, 3)])
        data.uv_layers.new()
        for index, loop in enumerate(data.uv_layers.active.data):
            loop.uv = (index % 2, index / 9)
        for index in range(2):
            material = bpy.data.materials.new(f'{name}Material{index}')
            material.use_nodes = True
            data.materials.append(material)
        data.polygons[1].material_index = 1
        obj = bpy.data.objects.new(name, data)
        scene.collection.objects.link(obj)
        obj.parent = armature
        obj.location = (0.4, -0.2, 0.5)
        obj.rotation_euler = (0.3, 0.1, -0.2)
        groups = [obj.vertex_groups.new(name=bone.name) for bone in armature.data.bones]
        groups[64].add([0, 1, 5], 1, 'REPLACE')
        groups[1].add([4], 1, 'REPLACE')
        for index in range(6):
            groups[index].add([2], (index + 1) / 21, 'REPLACE')
        modifier = obj.modifiers.new('Skin', 'ARMATURE')
        modifier.object = armature
        meshes.append(obj)
    scene.frame_set(4, subframe=0.25)
    return armature, meshes


def record(output, meshes, is_looping):
    basis = Matrix(exporter.transformation_matrix).to_4x4()
    scene = bpy.context.scene
    records = []
    for obj in meshes:
        path = output / 'models' / (exporter.asset_filename(obj) + '.model.json')
        data = json.loads(path.read_text())
        skeleton = exporter.SkeletalExport(obj, bpy.context.evaluated_depsgraph_get())
        geometry = (path.parent / data['geometry']['uri']).read_bytes()
        entries = {}
        source_vertices = {}
        for vertex in obj.data.vertices:
            position = basis.to_3x3() @ vertex.co
            indices, weights = skeleton.influences(vertex)
            source_vertices.setdefault((struct.pack('<3f', *position), indices), []).append(vertex.index)
        restored_groups = []
        for vertex in obj.data.vertices:
            groups = [(group.group, group.weight) for group in vertex.groups]
            if len(groups) <= 4:
                continue
            indices, weights = skeleton.influences(vertex)
            restored_groups.append((vertex.index, groups))
            for group, _ in groups:
                obj.vertex_groups[group].remove([vertex.index])
            for index, weight in zip(indices, weights):
                if weight:
                    obj.vertex_groups[skeleton.bones[index].name].add([vertex.index], weight, 'REPLACE')
        for name, mesh in data['meshes'].items():
            descriptor = mesh['vertices']
            entries[name] = []
            for index, weight in enumerate(mesh['weights']):
                assert weight['vertex'] == index
                position = struct.unpack_from(
                    '<3f', geometry, descriptor['byteOffset'] + index * descriptor['byteStride']
                )
                candidates = source_vertices.get((struct.pack('<3f', *position), tuple(weight['indices'])), [])
                assert candidates, (name, index, position)
                entries[name].append(candidates[0])
        samples = []
        for frame in range(scene.frame_start, scene.frame_end + 1):
            scene.frame_set(frame)
            depsgraph = bpy.context.evaluated_depsgraph_get()
            evaluated = obj.evaluated_get(depsgraph)
            armature = skeleton.armature.evaluated_get(depsgraph)
            palette = []
            for bone in skeleton.bones:
                pose = skeleton.offset @ armature.pose.bones[bone.name].matrix
                bind = skeleton.offset @ bone.matrix_local
                palette.append(flatten(basis @ pose @ bind.inverted() @ basis.inverted()))
            mesh = evaluated.to_mesh()
            try:
                positions = {
                    name: [list(basis.to_3x3() @ mesh.vertices[index].co) for index in indices]
                    for name, indices in entries.items()
                }
            finally:
                evaluated.to_mesh_clear()
            samples.append(
                {
                    'bones': palette,
                    'vertices': positions,
                    'world': flatten(basis @ evaluated.matrix_world @ basis.inverted()),
                }
            )
        for vertex, groups in restored_groups:
            for group in obj.vertex_groups:
                group.remove([vertex])
            for index, weight in groups:
                obj.vertex_groups[index].add([vertex], weight, 'REPLACE')
        hierarchy = []
        ancestor = obj
        while ancestor:
            hierarchy.append(ancestor.name)
            ancestor = ancestor.parent
        records.append(
            {
                'path': str(path.resolve()),
                'object': obj.name,
                'entityPath': '/'.join(reversed(hierarchy)),
                'samples': samples,
            }
        )
    (output / 'skeletal-manifest.json').write_text(
        json.dumps(
            {
                'models': records,
                'sampleRate': scene.render.fps / scene.render.fps_base,
                'isLooping': is_looping,
                'scene': str((output / 'scenes' / 'skeletal.scene.json').resolve()),
                'entity': str((output / 'entities' / 'skeletal.entity.json').resolve()),
            }
        )
    )


def run(output, blend=None, exact=False):
    output.mkdir(parents=True, exist_ok=True)
    if blend:
        bpy.ops.wm.open_mainfile(filepath=str(Path(blend).resolve()))
        armature = next(obj for obj in bpy.context.scene.objects if obj.type == 'ARMATURE')
        meshes = [obj for obj in armature.children_recursive if obj.type == 'MESH']
        bpy.context.view_layer.objects.active = armature
    else:
        armature, meshes = create_rig()
    scene = bpy.context.scene
    tolerances = dict.fromkeys(('translation', 'rotation', 'scale'), 0.0) if exact else None
    frame, subframe = scene.frame_current, scene.frame_subframe
    path = output / 'entities' / 'skeletal.entity.json'

    def export():
        exporter.export_luz_entity(bpy.context, str(path), bake_animation=True, animation_tolerances=tolerances)

    export()
    assert (scene.frame_current, scene.frame_subframe) == (frame, subframe)
    assert all(obj.modifiers[0].show_viewport for obj in meshes)
    if not blend:
        before = {file: file.read_bytes() for file in output.rglob('*') if file.is_file()}
        modifier = meshes[0].modifiers[0]
        for property_name, value, message in [
            ('use_deform_preserve_volume', True, 'Preserve Volume'),
            ('use_bone_envelopes', True, 'envelope'),
            ('vertex_group', 'Bone00', 'mask'),
        ]:
            previous = getattr(modifier, property_name)
            setattr(modifier, property_name, value)
            try:
                failure(export, message)
            finally:
                setattr(modifier, property_name, previous)
        extra = meshes[0].modifiers.new('Second', 'ARMATURE')
        failure(export, 'multiple Armature')
        meshes[0].modifiers.remove(extra)
        extra = meshes[0].modifiers.new('Post', 'TRIANGULATE')
        failure(export, 'post-armature')
        meshes[0].modifiers.remove(extra)
        armature.data.bones[0].bbone_segments = 2
        failure(export, 'B-Bone')
        armature.data.bones[0].bbone_segments = 1
        meshes[0].shape_key_add(name='Basis')
        failure(export, 'shape keys')
        meshes[0].shape_key_clear()
        driver = meshes[0].driver_add('location', 0)
        driver.driver.expression = 'frame * 0.1'
        failure(export, 'mesh-to-armature offset')
        meshes[0].driver_remove('location', 0)
        meshes[0].location.x = 0.4
        scene.frame_set(frame, subframe=subframe)
        assert modifier.show_viewport
        assert (scene.frame_current, scene.frame_subframe) == (frame, subframe)
        for file, contents in before.items():
            assert file.read_bytes() == contents, file
        original = exporter.build_meshes_from_object

        def fail(*_args):
            raise RuntimeError('injected geometry failure')

        exporter.build_meshes_from_object = fail
        try:
            failure(export, 'injected geometry')
            assert modifier.show_viewport
        finally:
            exporter.build_meshes_from_object = original
        scene.frame_end = 5
        exporter.export_luz_entity(
            bpy.context,
            str(output / 'once' / 'entities' / 'skeletal.entity.json'),
            bake_animation=True,
        )
        scene.frame_end = 9
        exporter.export_luz_entity(bpy.context, str(output / 'static' / 'entities' / 'skeletal.entity.json'))
        for file in (output / 'static' / 'models').glob('*.json'):
            assert 'armatures' not in json.loads(file.read_text())
    if not blend:
        holder = bpy.data.objects.new('SecondPlacement', None)
        scene.collection.objects.link(holder)
        holder.location.y = 8
        second_armature = armature.copy()
        second_armature.data = armature.data.copy()
        second_armature.name = 'SecondRig'
        second_armature.parent = holder
        scene.collection.objects.link(second_armature)
        for obj in list(meshes):
            second_mesh = obj.copy()
            second_mesh.name = 'Second' + obj.name
            second_mesh.parent = second_armature
            second_mesh.modifiers[0].object = second_armature
            scene.collection.objects.link(second_mesh)
            meshes.append(second_mesh)
    exporter.export_luz_scene(
        bpy.context,
        str(output / 'scenes' / 'skeletal.scene.json'),
        bake_animation=True,
        animation_tolerances=tolerances,
    )
    record(output, meshes, False)
    print('PASS skeletal export, evaluated reference poses, and restoration:', output)


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    parser.add_argument('--blend')
    parser.add_argument('--exact', action='store_true')
    args = parser.parse_args(sys.argv[sys.argv.index('--') + 1 :])
    run(Path(args.output).resolve(), args.blend, args.exact)
