"""Exercise the installed export workflow with synthetic Blender data."""

import importlib.util
import json
import tempfile
from pathlib import Path
from unittest.mock import patch

import bpy

specification = importlib.util.spec_from_file_location(
    'luz_pipeline_fixture', Path(__file__).resolve().parents[1] / 'luz_exporter/exporter.py'
)
exporter = importlib.util.module_from_spec(specification)
specification.loader.exec_module(exporter)


def create_world(directory):
    image = bpy.data.images.new('Packed environment', 8, 4, float_buffer=True)
    image.filepath_raw = str(directory / 'environment.exr')
    image.file_format = 'OPEN_EXR'
    image.pixels = [value for _ in range(32) for value in (0.5, 1.0, 2.0, 1.0)]
    image.save()
    image.pack()
    Path(image.filepath).unlink()
    world = bpy.data.worlds.new('World')
    world.use_nodes = True
    world['luz_environment_sky_size'] = 16
    world['luz_environment_radiance_size'] = 16
    world['luz_environment_irradiance_size'] = 8
    world['luz_environment_samples'] = 8
    tree = world.node_tree
    environment = tree.nodes.new('ShaderNodeTexEnvironment')
    environment.image = image
    rays = tree.nodes.new('ShaderNodeLightPath')
    mix = tree.nodes.new('ShaderNodeMixRGB')
    mix.inputs[2].default_value = (0, 0, 0, 1)
    tree.links.new(rays.outputs['Is Camera Ray'], mix.inputs[0])
    tree.links.new(environment.outputs['Color'], mix.inputs[1])
    tree.links.new(mix.outputs['Color'], tree.nodes['Background'].inputs['Color'])
    bpy.context.scene.world = world
    return world, rays, mix, environment


def collect_files(directory):
    return {path.relative_to(directory): path.read_bytes() for path in directory.rglob('*') if path.is_file()}


def run_fixture(directory):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    exporter.register()
    try:
        scene = bpy.context.scene
        scene.frame_end = 2
        scene.gravity = (0, 0, -4)
        world, rays, mix, environment = create_world(directory)
        bpy.ops.mesh.primitive_cube_add()
        cube = bpy.context.object
        cube.name = 'Platform'
        bpy.ops.rigidbody.object_add()
        cube.rigid_body.kinematic = True
        cube.rigid_body.restitution = 0.25
        cube['luz_continuous_collision'] = True
        cube['luz_loop_animation'] = True
        cube.location.x = -1
        cube.keyframe_insert('location', frame=1)
        cube.location.x = 1
        cube.keyframe_insert('location', frame=2)
        cube.animation_data.action.name = 'Move'
        bpy.ops.object.light_add(type='POINT')
        light = bpy.context.object
        light.data.energy = 200
        light['luz_power_scale'] = 0.01
        light['luz_shadow_softness'] = 0.4
        assert abs(light.luz.power_scale - 0.01) < 1e-6
        assert cube.luz.continuous_collision and cube.luz.loop_animation
        action = cube.animation_data.action
        assert action.luz.playback == 'inherit'
        action.luz.playback = 'once'
        assert action['luz_loop_animation'] is False
        action.luz.playback = 'inherit'
        assert 'luz_loop_animation' not in action
        scene.frame_set(2)
        original_world = scene.world
        blend = directory / 'source.blend'
        bpy.ops.wm.save_as_mainfile(filepath=str(blend))
        output = directory / 'assets/scenes/fixture.scene.json'
        published = []
        replace = exporter.os.replace

        def replace_file(source, target):
            if Path(target) == output:
                document = json.loads(Path(source).read_text())
                assert document['environment']['sky'].endswith('/black.ktx')
                for reference in document['environment'].values():
                    if isinstance(reference, str):
                        assert (output.parent / reference).is_file()
                for entity in document['entities'].values():
                    for component in entity['components'].values():
                        if isinstance(component, str):
                            model = output.parent / component
                            assert model.is_file()
                            assert (model.parent / json.loads(model.read_text())['geometry']['uri']).is_file()
                published.append(document)
            return replace(source, target)

        with patch.object(exporter.os, 'replace', side_effect=replace_file):
            assert bpy.ops.export_scene.luz_model(
                filepath=str(output), bake_animation=True, animation_source='actions', only_visible=True
            ) == {'FINISHED'}
        assert len(published) == 1
        document = published[0]
        assert document['gravity'] == [0, -4, 0]
        body = document['entities']['Platform']['components']['Body']
        assert body['isContinuousCollisionEnabled'] and body['motionType'] == 'kinematic'
        assert body['restitution'] == 0.25
        animation = document['entities']['Platform']['components']['Move']
        assert animation['isAutoplayEnabled'] and animation['playback'] == 'loop'
        exported_light = document['entities'][light.name]['components'][light.data.name]
        assert exported_light['intensity'] == 2 and exported_light['softness'] == 0.4
        assert scene.world == original_world and light.data.energy == 200 and scene.frame_current == 2
        assert scene.luz_export.filepath.startswith('//')
        assert scene.luz_export.bake_animation and scene.luz_export.animation_source == 'actions'
        assert not Path(exporter.export_status_path(str(output))).exists()
        before = collect_files(directory / 'assets')
        cube.scale.x = 1.5
        with patch.object(
            exporter, 'export_world_environment', side_effect=RuntimeError('injected environment failure')
        ):
            try:
                exporter.export_luz_scene(bpy.context, str(output), bake_animation=True, animation_source='actions')
            except RuntimeError as error:
                assert 'injected environment failure' in str(error)
            else:
                raise AssertionError('Failed preparation must not publish')
        assert collect_files(directory / 'assets') == before

        def reject_scene(source, target):
            if Path(target) == output:
                raise OSError('injected publication failure')
            return replace(source, target)

        with patch.object(exporter.os, 'replace', side_effect=reject_scene):
            try:
                exporter.export_luz_scene(bpy.context, str(output), bake_animation=True, animation_source='actions')
            except OSError as error:
                assert 'injected publication failure' in str(error)
            else:
                raise AssertionError('Failed publication must roll back dependencies')
        assert collect_files(directory / 'assets') == before
        assert not list((directory / 'assets').glob('.luz-*'))
        cube.scale.x = 1
        world.luz.background_mode = 'environment'
        world.luz.diffuse_mode = 'disabled'
        assert world['luz_background_mode'] == 'environment'
        assert bpy.ops.export_scene.luz_again() == {'FINISHED'}
        changed = json.loads(output.read_text())['environment']
        assert changed['sky'].endswith('/sky.ktx') and changed['irradiance'].endswith('/black.ktx')
        world.luz.background_mode = 'auto'
        world.luz.diffuse_mode = 'auto'
        tree = world.node_tree
        tree.links.new(rays.outputs['Is Glossy Ray'], mix.inputs[0])
        tree.links.remove(mix.inputs[1].links[0])
        mix.inputs[1].default_value = (0, 0, 0, 1)
        tree.links.new(environment.outputs['Color'], mix.inputs[2])
        assert bpy.ops.export_scene.luz_again() == {'FINISHED'}
        changed = json.loads(output.read_text())['environment']
        assert changed['sky'].endswith('/black.ktx') and changed['irradiance'].endswith('/black.ktx')
        bpy.ops.wm.save_as_mainfile(filepath=str(blend))
        bpy.ops.wm.open_mainfile(filepath=str(blend))
        assert bpy.context.scene.luz_export.animation_source == 'actions'
        assert bpy.ops.export_scene.luz_again() == {'FINISHED'}
        assert not [text for text in bpy.data.texts if text.name.endswith('.py')]
        print(
            'Export pipeline passed: single publication, rollback, packed World, native settings, saved export and repeat export'
        )
    finally:
        exporter.unregister()


if __name__ == '__main__':
    with tempfile.TemporaryDirectory(prefix='luz-export-pipeline-') as directory:
        run_fixture(Path(directory).resolve())
