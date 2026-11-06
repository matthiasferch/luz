"""Create an editable, simplified Blender source for the Light Chamber showcase."""

import argparse
import math
import shutil
import sys
from pathlib import Path

import bpy
from mathutils import Quaternion, Vector

REPOSITORY = Path(__file__).resolve().parents[3]


def to_blender(position):
    x, y, z = position
    return Vector((x, -z, y))


def create_collection(name):
    collection = bpy.data.collections.new(name)
    bpy.context.scene.collection.children.link(collection)
    return collection


def move_to_collection(obj, collection):
    for previous in list(obj.users_collection):
        previous.objects.unlink(obj)
    collection.objects.link(obj)


def create_block(name, position, scale, material, collection):
    bpy.ops.mesh.primitive_cube_add(size=2, location=to_blender(position))
    obj = bpy.context.object
    obj.name = name
    obj.scale = (scale[0], scale[2], scale[1])
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj.data.materials.append(material)
    move_to_collection(obj, collection)
    return obj


def create_material(name, color, roughness):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    material.diffuse_color = (*color, 1)
    shader = material.node_tree.nodes.get('Principled BSDF')
    shader.inputs['Base Color'].default_value = (*color, 1)
    shader.inputs['Roughness'].default_value = roughness
    shader.location = (500, 40)
    material.node_tree.nodes.get('Material Output').location = (800, 40)
    return material, shader


def create_concrete():
    material, shader = create_material('Concrete | procedural mineral finish', (0.2, 0.21, 0.22), 0.85)
    nodes, links = material.node_tree.nodes, material.node_tree.links
    coordinates = nodes.new('ShaderNodeNewGeometry')
    coordinates.location = (-750, 20)
    mottling = nodes.new('ShaderNodeTexNoise')
    mottling.label = 'Broad pigment variation'
    mottling.location = (-500, 220)
    mottling.inputs['Scale'].default_value = 1.4
    mottling.inputs['Detail'].default_value = 2
    links.new(coordinates.outputs['Position'], mottling.inputs['Vector'])
    pigment = nodes.new('ShaderNodeMixRGB')
    pigment.label = 'Concrete tones'
    pigment.location = (-160, 220)
    pigment.inputs[1].default_value = (0.12, 0.13, 0.14, 1)
    pigment.inputs[2].default_value = (0.23, 0.24, 0.25, 1)
    links.new(mottling.outputs['Fac'], pigment.inputs[0])
    links.new(pigment.outputs['Color'], shader.inputs['Base Color'])
    grain = nodes.new('ShaderNodeTexNoise')
    grain.label = 'Fine pores'
    grain.location = (-500, -160)
    grain.inputs['Scale'].default_value = 9
    grain.inputs['Detail'].default_value = 2
    links.new(coordinates.outputs['Position'], grain.inputs['Vector'])
    relief = nodes.new('ShaderNodeBump')
    relief.label = 'Subtle surface relief'
    relief.location = (100, -100)
    relief.inputs['Strength'].default_value = 0.18
    relief.inputs['Distance'].default_value = 0.025
    links.new(grain.outputs['Fac'], relief.inputs['Height'])
    links.new(relief.outputs['Normal'], shader.inputs['Normal'])
    return material


def create_metal(directory, texture_folder='light-chamber'):
    material, shader = create_material('Galvanized metal | ambientCG Metal 038 CC0', (0.35, 0.38, 0.4), 0.3)
    shader.inputs['Metallic'].default_value = 1
    nodes, links = material.node_tree.nodes, material.node_tree.links
    texture_directory = directory / 'textures' / texture_folder
    texture_directory.mkdir(parents=True, exist_ok=True)
    source_directory = REPOSITORY / 'apps/editor/demo-assets/textures/galvanizedMetal'
    for index, (filename, socket) in enumerate(
        [('baseColor', 'Base Color'), ('roughness', 'Roughness'), ('metallic', 'Metallic'), ('normal', None)]
    ):
        destination = texture_directory / f'{filename}.jpg'
        if not destination.exists():
            shutil.copyfile(source_directory / destination.name, destination)
        image = bpy.data.images.load(str(destination), check_existing=True)
        image.colorspace_settings.name = 'sRGB' if filename == 'baseColor' else 'Non-Color'
        image.pack()
        image.filepath = f'//textures/{texture_folder}/{filename}.jpg'
        texture = nodes.new('ShaderNodeTexImage')
        texture.name = filename
        texture.label = filename
        texture.image = image
        texture.interpolation = 'Cubic'
        texture.location = (-500, 440 - index * 290)
        if socket:
            links.new(texture.outputs['Color'], shader.inputs[socket])
        else:
            normal = nodes.new('ShaderNodeNormalMap')
            normal.location = (100, -200)
            links.new(texture.outputs['Color'], normal.inputs['Color'])
            links.new(normal.outputs['Normal'], shader.inputs['Normal'])
    shutil.copyfile(source_directory / 'LICENSE.txt', texture_directory / 'LICENSE.txt')
    return material


def create_light(name, position, target, intensity, color, cone, falloff, distance, softness, collection):
    light = bpy.data.lights.new(name, 'SPOT')
    light.energy = intensity * 1000
    light.color = color
    light.spot_size = math.radians(cone)
    light.spot_blend = falloff / cone
    light.shadow_soft_size = 0.08
    obj = bpy.data.objects.new(name, light)
    collection.objects.link(obj)
    obj.location = to_blender(position)
    obj.rotation_mode = 'QUATERNION'
    obj.rotation_quaternion = (to_blender(target) - obj.location).to_track_quat('-Z', 'Y')
    obj['luz_power_scale'] = 0.001
    obj.id_properties_ui('luz_power_scale').update(description='Multiply Blender watts by this value for luz intensity')
    obj['luz_shadow_softness'] = softness
    obj['luz_range'] = distance
    obj['luz_cone_falloff'] = falloff
    obj['luz_clip_start'] = 0.15
    obj['luz_clip_end'] = distance + 2
    return obj


def set_volume(obj, intensity, density, anisotropy, noise_scale, noise_strength):
    for name, value in {
        'intensity': intensity,
        'density': density,
        'anisotropy': anisotropy,
        'noise_scale': noise_scale,
        'noise_speed': 0.08,
        'noise_strength': noise_strength,
    }.items():
        obj[f'luz_volumetric_{name}'] = value


def create_world(is_diffuse_lighting_enabled=False):
    world = bpy.data.worlds.new('Studio reflections | black backdrop')
    world.use_nodes = True
    nodes, links = world.node_tree.nodes, world.node_tree.links
    background = nodes.get('Background')
    background.location = (400, 0)
    environment = nodes.new('ShaderNodeTexEnvironment')
    environment.location = (-500, 150)
    environment.image = bpy.data.images.load(str(REPOSITORY / 'apps/editor/demo-assets/environments/studio/source.hdr'))
    environment.image.pack()
    rays = nodes.new('ShaderNodeLightPath')
    rays.location = (-500, -150)
    reflections = nodes.new('ShaderNodeMixRGB')
    reflections.label = (
        'HDR lighting | black camera backdrop' if is_diffuse_lighting_enabled else 'HDR for glossy reflections only'
    )
    reflections.location = (80, 0)
    if is_diffuse_lighting_enabled:
        reflections.inputs[2].default_value = (0, 0, 0, 1)
        links.new(rays.outputs['Is Camera Ray'], reflections.inputs[0])
        links.new(environment.outputs['Color'], reflections.inputs[1])
    else:
        reflections.inputs[1].default_value = (0, 0, 0, 1)
        links.new(rays.outputs['Is Glossy Ray'], reflections.inputs[0])
        links.new(environment.outputs['Color'], reflections.inputs[2])
    links.new(reflections.outputs['Color'], background.inputs['Color'])
    bpy.context.scene.world = world


def create_chamber(filepath):
    filepath = Path(filepath).resolve()
    if filepath.exists():
        raise FileExistsError(f'Refusing to overwrite an authored Blender scene: {filepath}')
    filepath.parent.mkdir(parents=True, exist_ok=True)
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.name = 'Light Chamber'
    scene.unit_settings.system = 'METRIC'
    scene.render.fps = 30
    scene.frame_start, scene.frame_end = 1, 481
    architecture = create_collection('01 Architecture')
    furniture = create_collection('02 Furniture and sculpture')
    lighting = create_collection('03 Lighting')
    cameras = create_collection('04 Camera')
    preview = create_collection('05 Blender preview atmosphere')
    concrete = create_concrete()
    charcoal, _ = create_material('Charcoal | matte painted metal', (0.025, 0.032, 0.04), 0.65)
    metal = create_metal(filepath.parent)
    create_block('Floor', (0, -0.15, 1), (5.2, 0.15, 6.2), concrete, architecture)
    for name, position, scale in [
        ('Back wall', (0, 2.5, -5.15), (5.2, 2.5, 0.15)),
        ('Left wall', (-5.15, 2.5, 0), (0.15, 2.5, 5)),
        ('Right wall', (5.15, 2.5, -1), (0.15, 2.5, 4)),
        ('Roof edge', (-4.85, 5.1, 0), (0.35, 0.15, 5.2)),
        ('Roof', (2, 5.1, 0), (3.2, 0.15, 5.2)),
        ('Roof rear', (-2.85, 5.1, -4.65), (1.65, 0.15, 0.55)),
        ('Roof front', (-2.85, 5.1, 3.65), (1.65, 0.15, 1.55)),
    ]:
        create_block(name, position, scale, concrete, architecture)
    for index in range(5):
        create_block(
            f'Skylight beam {index + 1:02}',
            (-2.85, 5.15, -3.9 + index * 1.45),
            (1.65, 0.22, 0.28),
            charcoal,
            architecture,
        )
    for name, position, scale, material in [
        ('Lower step', (1, 0.1, -1.6), (1.8, 0.1, 1.7), concrete),
        ('Upper step', (1, 0.27, -1.9), (1.5, 0.07, 1.4), concrete),
        ('Plinth', (1, 0.55, -1.9), (0.75, 0.21, 0.75), charcoal),
        ('Bench seat', (-2.8, 0.6, 2.6), (1.25, 0.09, 0.4), charcoal),
        ('Bench left leg', (-3.65, 0.25, 2.6), (0.12, 0.25, 0.32), charcoal),
        ('Bench right leg', (-1.95, 0.25, 2.6), (0.12, 0.25, 0.32), charcoal),
    ]:
        create_block(name, position, scale, material, furniture)
    for name, angle in [('Outer ring', 0), ('Crossing ring', 2 * math.pi / 3)]:
        bpy.ops.mesh.primitive_torus_add(major_segments=48, minor_segments=12, major_radius=0.95, minor_radius=0.13)
        ring = bpy.context.object
        ring.name = name
        ring.location = to_blender((1, 1.84, -1.9))
        ring.rotation_euler = (math.pi / 2, 0, angle)
        ring.data.materials.append(metal)
        for polygon in ring.data.polygons:
            polygon.use_smooth = True
        move_to_collection(ring, furniture)

    skylight = create_light('Skylight', (-6, 10, -4), (0, 0, 0), 6, (1, 0.8, 0.52), 55, 6, 20, 0.8, lighting)
    skylight['luz_clip_start'] = 0.2
    set_volume(skylight, 0.7, 0.045, 0.15, 0.65, 0.3)
    spotlight = create_light(
        'Sweeping spotlight', (3.3, 4.4, -3.8), (0.3, 1.3, -1.3), 5, (0.46, 0.68, 1), 28, 8, 12, 0.5, lighting
    )
    spotlight['luz_clip_end'] = 18
    spotlight['luz_loop_animation'] = True
    set_volume(spotlight, 0.22, 0.025, 0.2, 0.9, 0.25)
    base_rotation = spotlight.rotation_quaternion.copy()
    for index in range(65):
        angle = math.sin(index * math.pi / 32) * 0.3
        spotlight.rotation_quaternion = base_rotation @ Quaternion((0, 1, 0), -angle)
        spotlight.keyframe_insert('rotation_quaternion', frame=1 + index * 7.5)
    action = spotlight.animation_data.action
    action.name = 'Spotlight sweep'
    for layer in action.layers:
        for strip in layer.strips:
            for curve in strip.channelbag(spotlight.animation_data.action_slot).fcurves:
                for key in curve.keyframe_points:
                    key.interpolation = 'LINEAR'
                curve.modifiers.new('CYCLES')
    bounce = create_light(
        'Entrance bounce', (1, 3.7, 6), (0, 1, -2), 0.65, (0.55, 0.66, 0.85), 105, 25, 22, 2, lighting
    )
    bounce['luz_clip_start'], bounce['luz_clip_end'] = 0.1, 25

    camera_data = bpy.data.cameras.new('Camera')
    camera = bpy.data.objects.new('Camera', camera_data)
    cameras.objects.link(camera)
    camera.location = to_blender((3.9, 2.3, 4.5))
    camera.rotation_euler = (to_blender((0.7, 2, -1.9)) - camera.location).to_track_quat('-Z', 'Y').to_euler()
    camera_data.sensor_fit = 'VERTICAL'
    camera_data.sensor_height = 24
    camera_data.lens = 12 / math.tan(math.radians(32))
    camera_data.clip_start, camera_data.clip_end = 0.1, 50
    scene.camera = camera
    create_world()
    atmosphere = bpy.data.materials.new('Preview haze | not exported')
    atmosphere.use_nodes = True
    atmosphere.node_tree.nodes.clear()
    volume = atmosphere.node_tree.nodes.new('ShaderNodeVolumeScatter')
    volume.inputs['Density'].default_value = 0.025
    volume.inputs['Anisotropy'].default_value = 0.15
    output = atmosphere.node_tree.nodes.new('ShaderNodeOutputMaterial')
    atmosphere.node_tree.links.new(volume.outputs['Volume'], output.inputs['Volume'])
    fog = create_block('Preview atmosphere', (0, 2.5, 0), (4.99, 2.49, 5), atmosphere, preview)
    fog.display_type = 'WIRE'
    fog.hide_select = True
    fog['luz_preview_only'] = True
    scene.render.engine = 'CYCLES'
    scene.cycles.samples = 32
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = 1280, 720
    scene.render.resolution_percentage = 100
    scene.view_settings.view_transform = 'AgX'
    scene.frame_set(1)
    bpy.ops.object.select_all(action='DESELECT')
    spotlight.select_set(True)
    bpy.context.view_layer.objects.active = spotlight
    for screen in bpy.data.screens:
        for area in screen.areas:
            if area.type == 'VIEW_3D':
                area.spaces.active.region_3d.view_perspective = 'CAMERA'
                area.spaces.active.overlay.show_extras = False
                area.spaces.active.shading.color_type = 'MATERIAL'

    notes = bpy.data.texts.new('START HERE')
    notes.write(
        'LIGHT CHAMBER — luz\n\n'
        'Edit the floor, walls, beams, steps and rings as ordinary Blender objects.\n'
        'Concrete detail is procedural; metal image maps are packed into this file.\n'
        'The only object animation is Spotlight sweep (frames 1–481 at 30 fps).\n'
        'Press Space to play; Numpad 0 returns to the authored camera.\n'
        'F12 renders the Cycles preview. Blender and luz use different light models.\n'
        'Light power is editable in watts; the exporter converts it by luz_power_scale.\n'
        'luz volumetric settings are in each light object’s Custom Properties.\n'
        'The preview haze is excluded; the World exports lighting and reflections.\n\n'
        'Install the luz extension, then use Scene Properties > luz Export > Export Again.\n'
        'It uses the current luz extension and preserves the looping spotlight,\n'
        'black diffuse environment, metal reflections, and packaged texture paths.\n'
        'The export destination is ../public/assets/scenes/light-chamber.scene.json.\n'
        'Publishing the edited scene requires a separate demo asset import/build.\n'
    )
    export_settings = {
        'filepath': '//../public/assets/scenes/light-chamber.scene.json',
        'only_visible': True,
        'apply_modifiers': True,
        'bake_animation': True,
        'animation_source': 'actions',
    }
    for name, value in export_settings.items():
        scene['luz_export_' + name] = value
    bpy.ops.wm.save_as_mainfile(filepath=str(filepath))
    print(f'Editable light chamber saved: {filepath}')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--output', required=True)
    create_chamber(parser.parse_args(sys.argv[sys.argv.index('--') + 1 :]).output)
