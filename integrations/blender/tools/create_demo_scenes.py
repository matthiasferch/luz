"""Create editable Blender sources for the rigid-body and skeletal animation showcases."""

import argparse
import math
import sys
from pathlib import Path

import bpy

sys.path.insert(0, str(Path(__file__).parent))
from create_light_chamber import (
    REPOSITORY,
    create_block,
    create_collection,
    create_material,
    create_metal,
    create_world,
    move_to_collection,
    to_blender,
)
from update_playground_uvs import update_box_texture_coordinates


def create_camera(position, target, collection):
    data = bpy.data.cameras.new('Camera')
    obj = bpy.data.objects.new('Camera', data)
    collection.objects.link(obj)
    obj.location = to_blender(position)
    obj.rotation_euler = (to_blender(target) - obj.location).to_track_quat('-Z', 'Y').to_euler()
    data.sensor_fit = 'VERTICAL'
    data.sensor_height = 24
    data.lens = 12 / math.tan(math.radians(24))
    data.clip_start, data.clip_end = 0.1, 80
    bpy.context.scene.camera = obj
    return obj


def create_point(name, position, color, intensity, distance, collection):
    data = bpy.data.lights.new(name, 'POINT')
    data.energy = intensity * 100
    data.color = color
    data.shadow_soft_size = 0.1
    obj = bpy.data.objects.new(name, data)
    collection.objects.link(obj)
    obj.location = to_blender(position)
    obj['luz_power_scale'] = 0.01
    obj['luz_range'] = distance
    obj['luz_clip_end'] = distance
    obj.id_properties_ui('luz_power_scale').update(description='Multiply Blender watts by this value for luz intensity')
    return obj


def create_body(obj, shape, *, is_static=False, is_animated=False, mass=1, friction=0.5, restitution=0):
    bpy.ops.object.select_all(action='DESELECT')
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.rigidbody.object_add()
    body = obj.rigid_body
    body.type = 'PASSIVE' if is_static else 'ACTIVE'
    body.kinematic = is_animated
    body.collision_shape = shape
    body.mass = mass
    body.friction = friction
    body.restitution = restitution
    body.use_margin = True
    body.collision_margin = 0.001
    obj['luz_continuous_collision'] = not is_static and not is_animated


def set_action_cycles(action, slot):
    for layer in action.layers:
        for strip in layer.strips:
            bag = strip.channelbag(slot)
            if bag:
                for curve in bag.fcurves:
                    if not any(modifier.type == 'CYCLES' for modifier in curve.modifiers):
                        curve.modifiers.new('CYCLES')


def create_playground(directory, stage, lighting, cameras):
    scene = bpy.context.scene
    scene.name = 'Rigid Body Playground'
    scene.frame_start, scene.frame_end = 1, 241
    floor_material, _ = create_material('Stage | blue slate', (0.15, 0.19, 0.24), 0.65)
    metal = create_metal(directory, 'galvanizedMetal')
    orange, _ = create_material('Ball | orange', (0.95, 0.3, 0.08), 0.25)
    floor = create_block('Floor', (0, -0.25, 0), (7, 0.25, 5), floor_material, stage)
    create_body(floor, 'BOX', is_static=True, friction=0.65)
    bodies = create_collection('02 Rigid bodies')
    platform = create_block('Platform', (-5.5, 0.6, -0.6), (1.3, 0.15, 1), floor_material, bodies)
    update_box_texture_coordinates(platform)
    create_body(platform, 'BOX', is_animated=True, friction=0.8)
    platform['luz_loop_animation'] = True
    for index in range(129):
        platform.location.x = -5.5 + (1 - math.cos(index * math.pi / 64)) * 5.5
        platform.keyframe_insert('location', frame=1 + index * 30 / 16)
    action = platform.animation_data.action
    action.name = 'Platform Motion'
    for layer in action.layers:
        for strip in layer.strips:
            for curve in strip.channelbag(platform.animation_data.action_slot).fcurves:
                for key in curve.keyframe_points:
                    key.interpolation = 'LINEAR'
    set_action_cycles(action, platform.animation_data.action_slot)
    for name, position, half_size, angle in [
        ('Cuboid', (-5.5, 1.35, -0.6), 0.6, 0),
        ('Block', (-5.5, 2.45, -0.6), 0.5, math.pi / 12),
    ]:
        obj = create_block(name, position, (half_size,) * 3, metal, bodies)
        obj.rotation_euler.z = angle
        update_box_texture_coordinates(obj)
        create_body(obj, 'BOX', friction=0.8, restitution=0.15)
    for name, position, radius in [('Sphere', (-0.2, 4.5, 1.7), 0.7), ('Small ball', (0.2, 2, 2), 0.55)]:
        bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=radius, location=to_blender(position))
        obj = bpy.context.object
        obj.name = name
        obj.data.materials.append(orange)
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        move_to_collection(obj, bodies)
        create_body(obj, 'SPHERE', mass=2, restitution=0.45)
    scene.rigidbody_world.substeps_per_frame = 8
    scene.rigidbody_world.solver_iterations = 30
    scene.rigidbody_world.point_cache.frame_start = 1
    scene.rigidbody_world.point_cache.frame_end = 241
    create_camera((0, 7, 15), (0, 1.5, 0), cameras)
    create_point('Fill', (4, 4, 3), (0.35, 0.65, 1), 22, 20, lighting)
    create_point('Rim', (-3, 3, -4), (1, 0.4, 0.2), 18, 16, lighting)
    return platform


def create_character(stage, lighting, cameras):
    source = REPOSITORY / 'apps/editor/local-assets/locomotion.blend'
    with bpy.data.libraries.load(str(source), link=False) as (available, loaded):
        names = ['Bot armature', 'Alpha_Joints', 'Alpha_Surface']
        if not set(names) <= set(available.objects):
            raise RuntimeError(f'Missing character objects in {source}')
        loaded.objects = names
    collection = create_collection('02 Character')
    for obj in loaded.objects:
        collection.objects.link(obj)
    rig, joints, surface = loaded.objects
    rig.name, joints.name, surface.name = 'Character', 'Joints', 'Surface'
    rig.show_in_front = True
    rig['luz_initial_animation'] = 'Walking'
    animation = rig.animation_data
    walking = None
    for track in animation.nla_tracks:
        track.mute = True
        for strip in track.strips:
            action = strip.action
            action.use_fake_user = True
            action['luz_loop_animation'] = action.name != 'Jump' and 'Turn' not in action.name
            if action['luz_loop_animation']:
                set_action_cycles(action, strip.action_slot)
            if action.name == 'Walking':
                walking = (action, strip.action_slot)
    if not walking:
        raise RuntimeError('Walking action is missing from the character source')
    animation.action, animation.action_slot = walking
    scene = bpy.context.scene
    scene.name = 'Skeletal Animation'
    scene.frame_start, scene.frame_end = map(int, walking[0].frame_range)
    floor_material, _ = create_material('Stage | blue slate', (0.15, 0.19, 0.24), 0.65)
    create_block('Floor', (0, -0.1, 0), (2.5, 0.1, 2.5), floor_material, stage)
    create_camera((0, 1.65, 4.5), (0, 0.95, 0), cameras)
    create_point('Fill', (4, 4, 3), (0.35, 0.65, 1), 3, 20, lighting)
    create_point('Rim', (-3, 3, -4), (1, 0.4, 0.2), 2, 16, lighting)
    notice = bpy.data.texts.new('Character provenance')
    notice.write((REPOSITORY / 'apps/editor/demo-assets/character/NOTICE.txt').read_text(encoding='utf-8'))
    return rig


def create_scene(kind, filepath):
    filepath = Path(filepath).resolve()
    if filepath.exists():
        raise FileExistsError(f'Refusing to overwrite an authored Blender scene: {filepath}')
    filepath.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = 'METRIC'
    scene.render.fps = 30
    scene.gravity = (0, 0, -9.81)
    scene['luz_environment_diffuse'] = True
    stage = create_collection('01 Stage')
    lighting = create_collection('03 Lighting')
    cameras = create_collection('04 Camera')
    if kind == 'rigidBody':
        selected = create_playground(filepath.parent, stage, lighting, cameras)
        filename = 'rigid-body-playground.scene.json'
        description = (
            'Native rigid bodies: a static floor, animated platform, two stacked boxes and two spheres.\n'
            'Platform Motion spans frames 1–241: eight seconds, four in each direction.\n'
            'Press Space to simulate in Blender. Return to frame 1 to reset physics.\n'
            'Edit body settings in Physics Properties; edit the platform action in the Dope Sheet.\n'
            'The metal textures are packed into this file.\n'
        )
    else:
        selected = create_character(stage, lighting, cameras)
        filename = 'sala-character.scene.json'
        description = (
            'The original character rig, skin weights, materials and twelve actions remain editable.\n'
            'Walking is active. Press Space to preview its loop.\n'
            'Select Character, then use the Action Editor to choose another action.\n'
            'Other clips are stored in muted NLA tracks; keep those tracks muted during preview.\n'
            'Set the timeline range to the selected action when previewing a different clip.\n'
            'Character > Custom Properties > luz_initial_animation selects the exported startup clip.\n'
            'Locomotion clips loop; Jump and turns play once. See Character provenance for asset details.\n'
        )
    create_world(is_diffuse_lighting_enabled=True)
    scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value = 0.5
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = 'AgX'
    scene.frame_set(scene.frame_start)
    bpy.ops.object.select_all(action='DESELECT')
    selected.select_set(True)
    bpy.context.view_layer.objects.active = selected
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                area.spaces.active.region_3d.view_perspective = 'CAMERA'
                area.spaces.active.overlay.show_extras = False
                area.spaces.active.shading.color_type = 'MATERIAL'
    notes = bpy.data.texts.new('START HERE')
    notes.write(
        f'{scene.name} — luz\n\n{description}\n'
        'Numpad 0 returns to the camera; F12 renders the Cycles preview.\n'
        'Blender light power is in watts; the exporter converts it by luz_power_scale.\n'
        'Install the luz extension, then use Scene Properties > luz Export > Export Again.\n'
        f'Destination: ../public/assets/scenes/{filename}\n'
        'Run npm run preview:local, open http://127.0.0.1:4173/, then load/reload this scene.\n'
        'The exporter preserves animation startup/loops, physics settings, textures and the black backdrop.\n'
    )
    export_settings = {
        'filepath': f'//../public/assets/scenes/{filename}',
        'only_visible': True,
        'apply_modifiers': True,
        'bake_animation': True,
        'animation_source': 'actions',
    }
    for name, value in export_settings.items():
        scene['luz_export_' + name] = value
    bpy.ops.wm.save_as_mainfile(filepath=str(filepath))
    print(f'Editable showcase saved: {filepath}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--scene', choices=['rigidBody', 'skeletalAnimation'], required=True)
    parser.add_argument('--output', required=True)
    arguments = parser.parse_args(sys.argv[sys.argv.index('--') + 1 :])
    create_scene(arguments.scene, arguments.output)
