import contextlib
import importlib.util
import io
import json
import os
import struct
import tempfile

import bpy

EXPORTER_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'luz_exporter', 'exporter.py'))
spec = importlib.util.spec_from_file_location('luz_exporter_fixture', EXPORTER_PATH)
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


def make_material(name):
    material = bpy.data.materials.new(name)
    material.use_nodes = True
    nodes = material.node_tree.nodes
    nodes.clear()
    output = nodes.new('ShaderNodeOutputMaterial')
    output.is_active_output = True
    principled = nodes.new('ShaderNodeBsdfPrincipled')
    material.node_tree.links.new(principled.outputs['BSDF'], output.inputs['Surface'])
    return material, principled


def build_group(material, principled):
    group_tree = bpy.data.node_groups.new('FixtureGroup', 'ShaderNodeTree')
    group_tree.interface.new_socket(name='Tint', in_out='INPUT', socket_type='NodeSocketColor')
    group_tree.interface.new_socket(name='Color', in_out='OUTPUT', socket_type='NodeSocketColor')
    group_input = group_tree.nodes.new('NodeGroupInput')
    group_output = group_tree.nodes.new('NodeGroupOutput')
    reroute = group_tree.nodes.new('NodeReroute')
    frame = group_tree.nodes.new('NodeFrame')
    reroute.parent = frame
    group_tree.links.new(group_input.outputs['Tint'], reroute.inputs[0])
    group_tree.links.new(reroute.outputs[0], group_output.inputs['Color'])

    group = material.node_tree.nodes.new('ShaderNodeGroup')
    group.node_tree = group_tree
    group.inputs['Tint'].default_value = (0.2, 0.4, 0.6, 1.0)
    material.node_tree.links.new(group.outputs['Color'], principled.inputs['Base Color'])


def test_obsolete_model_cleanup(asset_dir):
    cleanup_root = os.path.join(asset_dir, 'cleanup')
    scenes_dir = os.path.join(cleanup_root, 'scenes')
    entities_dir = os.path.join(cleanup_root, 'entities')
    models_dir = os.path.join(cleanup_root, 'models')
    os.makedirs(scenes_dir)
    os.makedirs(entities_dir)
    os.makedirs(models_dir)

    live_scene = 'scene-model-0123456789ab'
    live_entity = 'entity-model-abcdef012345'
    stale = 'stale-model-fedcba987654'
    malformed_guard = 'guarded-model-111111111111'
    legacy = 'legacy-model'
    for stem in (live_scene, live_entity, stale, malformed_guard, legacy):
        for suffix in ('.model.json', '.geometry'):
            with open(os.path.join(models_dir, stem + suffix), 'wb') as asset_file:
                asset_file.write(b'{}' if suffix.endswith('json') else b'LUZG')

    with open(os.path.join(scenes_dir, 'fixture.scene.json'), 'w', encoding='utf-8') as scene_file:
        json.dump({'model': f'../models/{live_scene}.model.json'}, scene_file)
    with open(os.path.join(entities_dir, 'fixture.entity.json'), 'w', encoding='utf-8') as entity_file:
        json.dump({'model': f'../models/{live_entity}.model.json'}, entity_file)

    removed = {os.path.basename(path) for path in exporter.cleanup_obsolete_model_exports(cleanup_root)}
    assert removed == {
        stale + '.model.json',
        stale + '.geometry',
        malformed_guard + '.model.json',
        malformed_guard + '.geometry',
    }
    for stem in (live_scene, live_entity, legacy):
        assert os.path.exists(os.path.join(models_dir, stem + '.model.json'))
        assert os.path.exists(os.path.join(models_dir, stem + '.geometry'))

    guarded_path = os.path.join(models_dir, malformed_guard + '.model.json')
    with open(guarded_path, 'w', encoding='utf-8') as guarded_file:
        guarded_file.write('{}')
    with open(os.path.join(scenes_dir, 'invalid.scene.json'), 'w', encoding='utf-8') as invalid_file:
        invalid_file.write('{')
    assert exporter.cleanup_obsolete_model_exports(cleanup_root) == []
    assert os.path.exists(guarded_path)


def main():
    with tempfile.TemporaryDirectory(prefix='luz-material-graph-') as asset_dir:
        test_obsolete_model_cleanup(asset_dir)
        status_scene_path = os.path.join(asset_dir, 'scenes', 'pier.scene.json')
        assert exporter.export_status_path(status_scene_path).endswith(os.path.join('scenes', 'pier.export.json'))
        exporter.write_export_status(status_scene_path, 'Exporting models from Blender', 2, 5)
        with open(exporter.export_status_path(status_scene_path), encoding='utf-8') as status_file:
            assert json.load(status_file) == {
                'status': 'exporting',
                'scene': 'pier.scene.json',
                'stage': 'Exporting models from Blender',
                'completed': 2,
                'total': 5,
            }

        existing_case_path = os.path.join(asset_dir, 'existing.model.json')
        with open(existing_case_path, 'w', encoding='utf-8') as existing_case_file:
            existing_case_file.write('{}\n')
        resolved_case_path = exporter.preserve_existing_filename_case(os.path.join(asset_dir, 'Existing.model.json'))
        assert os.path.basename(resolved_case_path) == 'existing.model.json'

        invalid_json_path = os.path.join(asset_dir, 'invalid.model.json')
        try:
            exporter.write_model_file(invalid_json_path, {'invalid': float('inf')})
            raise AssertionError('Expected non-finite model JSON to fail')
        except RuntimeError as error:
            assert 'contains a non-finite JSON value' in str(error)
        assert not os.path.exists(invalid_json_path)

        image = bpy.data.images.new('fixture_ao.png', 1, 1)
        image.filepath_raw = os.path.join(asset_dir, 'fixture_ao.png')
        image.file_format = 'PNG'
        image.save()

        material, principled = make_material('Fixture')
        build_group(material, principled)
        ao = material.node_tree.nodes.new('ShaderNodeTexImage')
        ao.name = 'Ambient Occlusion'
        ao.image = image
        opacity = material.node_tree.nodes.new('ShaderNodeTexImage')
        opacity.name = 'Opacity'
        opacity.image = image
        opacity.extension = 'MIRROR'
        opacity.interpolation = 'Closest'
        normal_image = bpy.data.images.new('fixture_normal.exr', 2, 2)
        normal_image.colorspace_settings.name = 'Non-Color'
        normal_image.filepath_raw = os.path.join(asset_dir, 'fixture_normal.exr')
        normal_image.file_format = 'OPEN_EXR'
        normal_image.pixels = [0.5, 0.5, 1.0, 1.0] * 4
        normal_image.save()
        normal_texture = material.node_tree.nodes.new('ShaderNodeTexImage')
        normal_texture.image = normal_image
        uv_map = material.node_tree.nodes.new('ShaderNodeUVMap')
        uv_map.uv_map = 'UVMap'
        mapping = material.node_tree.nodes.new('ShaderNodeMapping')
        mapping.vector_type = 'TEXTURE'
        mapping.inputs['Scale'].default_value = (1.0, 1.0, float('inf'))
        material.node_tree.links.new(uv_map.outputs['UV'], mapping.inputs['Vector'])
        material.node_tree.links.new(mapping.outputs['Vector'], normal_texture.inputs['Vector'])
        normal_map = material.node_tree.nodes.new('ShaderNodeNormalMap')
        normal_map.space = 'OBJECT'
        material.node_tree.links.new(normal_texture.outputs['Color'], normal_map.inputs['Color'])
        material.node_tree.links.new(normal_map.outputs['Normal'], principled.inputs['Normal'])
        coordinates = material.node_tree.nodes.new('ShaderNodeTexCoord')
        vector_math = material.node_tree.nodes.new('ShaderNodeVectorMath')
        vector_math.operation = 'SCALE'
        vector_math.inputs['Scale'].default_value = 0.005
        material.node_tree.links.new(coordinates.outputs['UV'], vector_math.inputs[0])
        material.node_tree.links.new(vector_math.outputs['Vector'], opacity.inputs['Vector'])
        material.node_tree.links.new(opacity.outputs['Alpha'], principled.inputs['Alpha'])
        noise = material.node_tree.nodes.new('ShaderNodeTexNoise')
        noise.noise_dimensions = '4D'
        noise.inputs['W'].default_value = 0.25
        noise_factor = noise.outputs.get('Factor') or noise.outputs.get('Fac')
        material.node_tree.links.new(noise_factor, principled.inputs['Roughness'])
        wave = material.node_tree.nodes.new('ShaderNodeTexWave')
        wave.wave_type = 'RINGS'
        wave.rings_direction = 'SPHERICAL'
        wave.inputs['Scale'].default_value = 1.6
        wave.inputs['Distortion'].default_value = 14.6
        material.node_tree.links.new(coordinates.outputs['Generated'], wave.inputs['Vector'])
        material.node_tree.links.new(wave.outputs['Factor'], principled.inputs['Metallic'])
        gradient = material.node_tree.nodes.new('ShaderNodeTexGradient')
        gradient.gradient_type = 'LINEAR'
        material.node_tree.links.new(coordinates.outputs['Generated'], gradient.inputs['Vector'])
        material.node_tree.links.new(gradient.outputs['Factor'], principled.inputs['Emission Strength'])
        ambient_occlusion = material.node_tree.nodes.new('ShaderNodeAmbientOcclusion')
        material.node_tree.links.new(ambient_occlusion.outputs['AO'], principled.inputs['IOR'])
        color_ramp = material.node_tree.nodes.new('ShaderNodeValToRGB')
        color_ramp.color_ramp.interpolation = 'LINEAR'
        color_ramp.color_ramp.elements[0].position = 0.2
        color_ramp.color_ramp.elements[0].color = (1.0, 0.5, 0.25, 0.75)
        color_ramp.color_ramp.elements[1].position = 0.7
        color_ramp.color_ramp.elements[1].color = (0.0, 0.1, 0.2, 0.5)
        material.node_tree.links.new(noise_factor, color_ramp.inputs['Fac'])
        emission_input = principled.inputs.get('Emission Color') or principled.inputs.get('Emission')
        material.node_tree.links.new(color_ramp.outputs['Color'], emission_input)

        subsurface_source = material.node_tree.nodes.new('ShaderNodeValue')
        subsurface_source.outputs['Value'].default_value = 0.35
        subsurface_weight = principled.inputs.get('Subsurface Weight')
        if subsurface_weight is not None:
            material.node_tree.links.new(subsurface_source.outputs['Value'], subsurface_weight)

        subsurface_scale_source = material.node_tree.nodes.new('ShaderNodeValue')
        subsurface_scale_source.outputs['Value'].default_value = 0.0075
        subsurface_scale = principled.inputs.get('Subsurface Scale')
        if subsurface_scale is not None:
            material.node_tree.links.new(subsurface_scale_source.outputs['Value'], subsurface_scale)

        specular_source = material.node_tree.nodes.new('ShaderNodeValue')
        specular_source.outputs['Value'].default_value = 0.8
        specular_level = principled.inputs.get('Specular IOR Level') or principled.inputs.get('Specular')
        if specular_level is not None:
            material.node_tree.links.new(specular_source.outputs['Value'], specular_level)

        material_output = next(node for node in material.node_tree.nodes if node.type == 'OUTPUT_MATERIAL')
        absorption = material.node_tree.nodes.new('ShaderNodeVolumeAbsorption')
        absorption.inputs['Color'].default_value = (0.2, 0.6, 0.8, 1.0)
        absorption.inputs['Density'].default_value = 0.4
        volume_reroute = material.node_tree.nodes.new('NodeReroute')
        material.node_tree.links.new(absorption.outputs['Volume'], volume_reroute.inputs[0])
        material.node_tree.links.new(volume_reroute.outputs[0], material_output.inputs['Volume'])

        warning_source = material.node_tree.nodes.new('ShaderNodeValue')
        unsupported_subsurface = principled.inputs.get('Subsurface IOR')
        if unsupported_subsurface is not None:
            material.node_tree.links.new(warning_source.outputs['Value'], unsupported_subsurface)

        warning_output = io.StringIO()
        with contextlib.redirect_stdout(warning_output):
            first = exporter.extract_material(material, asset_dir)
            second = exporter.extract_material(material, asset_dir)

        assert json.dumps(first, sort_keys=True) == json.dumps(second, sort_keys=True)
        assert first['graph']['version'] == 1
        assert 'isDoubleSided' not in first
        assert first['alphaMode'] == 'mask'
        assert any(node['type'] == 'imageTexture' for node in first['graph']['nodes'].values())
        assert first['graph']['outputs']['occlusion']['node']
        opacity_node = first['graph']['nodes'][first['graph']['outputs']['alpha']['node']]
        vector_math_node = first['graph']['nodes'][opacity_node['inputs']['vector']['node']]
        coordinate_node = first['graph']['nodes'][vector_math_node['inputs']['vector1']['node']]
        assert opacity_node['type'] == 'imageTexture'
        assert vector_math_node['type'] == 'vectorMath'
        assert vector_math_node['properties']['operation'] == 'SCALE'
        assert abs(vector_math_node['inputs']['scale']['value'] - 0.005) < 1e-6
        assert coordinate_node['type'] == 'textureCoordinate'
        roughness_output = first['graph']['outputs']['roughness']
        assert roughness_output['output'] == 'Factor'
        noise_node = first['graph']['nodes'][roughness_output['node']]
        assert noise_node['properties'] == {'dimensions': '4D'}
        assert abs(noise_node['inputs']['w']['value'] - 0.25) < 1e-6
        wave_output = first['graph']['outputs']['metallic']
        wave_node = first['graph']['nodes'][wave_output['node']]
        assert wave_node['type'] == 'waveTexture'
        assert wave_node['properties']['waveType'] == 'RINGS'
        assert wave_node['properties']['ringsDirection'] == 'SPHERICAL'
        assert wave_output['output'] == 'Factor'
        gradient_output = first['graph']['outputs']['emissionStrength']
        assert first['graph']['nodes'][gradient_output['node']]['type'] == 'gradientTexture'
        assert gradient_output['output'] == 'Factor'
        ao_output = first['graph']['outputs']['indexOfRefraction']
        assert first['graph']['nodes'][ao_output['node']]['type'] == 'ambientOcclusion'
        assert ao_output['output'] == 'AO'
        ramp_output = first['graph']['outputs']['emissionColor']
        ramp_node = first['graph']['nodes'][ramp_output['node']]
        assert ramp_node['type'] == 'colorRamp'
        assert ramp_node['properties'] == {'interpolation': 'LINEAR', 'elementCount': 2}
        assert abs(ramp_node['inputs']['position0']['value'] - 0.2) < 1e-6
        assert abs(ramp_node['inputs']['position1']['value'] - 0.7) < 1e-6
        assert ramp_node['inputs']['factor']['output'] == 'Factor'
        if subsurface_weight is not None:
            subsurface_output = first['graph']['outputs']['subsurfaceWeight']
            assert first['graph']['nodes'][subsurface_output['node']]['type'] == 'value'
        if subsurface_scale is not None:
            subsurface_output = first['graph']['outputs']['subsurfaceScale']
            assert first['graph']['nodes'][subsurface_output['node']]['type'] == 'value'
        if specular_level is not None:
            specular_output = first['graph']['outputs']['specularLevel']
            assert first['graph']['nodes'][specular_output['node']]['type'] == 'value'
        exported_volume = first['graph']['volume']
        assert exported_volume['type'] == 'absorption'
        assert all(
            abs(actual - expected) < 1e-6
            for actual, expected in zip(exported_volume['color']['value'], [0.2, 0.6, 0.8, 1.0])
        )
        assert abs(exported_volume['density']['value'] - 0.4) < 1e-6
        assert opacity_node['surface']['path'] == 'fixture_ao.png'
        assert opacity_node['surface']['tiling'] == 'mirror'
        assert opacity_node['surface']['filtering'] == 'none'
        normal_output = first['graph']['outputs']['normal']
        normal_node = first['graph']['nodes'][normal_output['node']]
        normal_texture_node = first['graph']['nodes'][normal_node['inputs']['color']['node']]
        mapping_node = first['graph']['nodes'][normal_texture_node['inputs']['vector']['node']]
        uv_map_node = first['graph']['nodes'][mapping_node['inputs']['vector']['node']]
        assert normal_node['type'] == 'normalMap'
        assert normal_node['properties'] == {'space': 'OBJECT'}
        assert mapping_node['type'] == 'mapping'
        assert mapping_node['inputs']['scale']['value'] == [1.0, 1.0, exporter.FLOAT32_MAX]
        assert uv_map_node['type'] == 'textureCoordinate'
        assert uv_map_node['properties']['uvMap'] == 'UVMap'
        assert normal_texture_node['surface']['path'] == 'fixture_normal.luz.png'
        assert normal_texture_node['surface']['colorSpace'] == 'linear'
        assert os.path.isfile(os.path.join(asset_dir, 'fixture_normal.luz.png'))
        assert first['graph']['outputs']['baseColor']['value'][:3] == [
            0.20000000298023224,
            0.4000000059604645,
            0.6000000238418579,
        ]
        if unsupported_subsurface is not None:
            assert 'Subsurface IOR' in warning_output.getvalue()
        assert 'uses Ambient Occlusion node' in warning_output.getvalue()

        material['luz_double_sided'] = True
        assert exporter.extract_material(material, asset_dir)['isDoubleSided'] is True
        material['luz_double_sided'] = False
        assert 'isDoubleSided' not in exporter.extract_material(material, asset_dir)
        material['luz_double_sided'] = 'true'
        try:
            exporter.extract_material(material, asset_dir)
            raise AssertionError('Non-boolean luz_double_sided values must fail export')
        except RuntimeError as error:
            assert "property 'luz_double_sided' must be a boolean" in str(error)
        finally:
            del material['luz_double_sided']

        mesh = bpy.data.meshes.new('FixtureMesh')
        mesh.from_pydata([(0, 0, 0), (1, 0, 0), (0, 1, 0)], [], [(0, 1, 2)])
        mesh.uv_layers.new(name='UVMap')
        mesh.materials.append(material)
        obj = bpy.data.objects.new('FixtureObject', mesh)
        bpy.context.scene.collection.objects.link(obj)
        obj['luz_planar_reflector'] = True
        reflector = exporter.reflector_component_from_object(obj, bpy.context.evaluated_depsgraph_get(), False)
        assert reflector['type'] == 'reflector'
        assert reflector['clipBias'] == 0.001
        assert reflector['normal'] == [0.0, 1.0, 0.0]
        model_path = os.path.join(asset_dir, 'fixture.model.json')
        model_data = exporter.build_model_from_object(obj, bpy.context.evaluated_depsgraph_get(), False, asset_dir)
        exporter.write_geometry_file(model_path, model_data)
        exporter.write_model_file(model_path, model_data)
        with open(model_path, encoding='utf-8') as model_file:
            exported = json.load(model_file)
        with open(os.path.join(asset_dir, 'fixture.geometry'), 'rb') as geometry_file:
            assert geometry_file.read(4) == b'LUZG'
        assert exported['materials']['Fixture']['graph'] == first['graph']
        assert exported['meshes']['Fixture']['vertices']['count'] == 3

        bpy.context.view_layer.objects.active = obj
        obj.select_set(True)
        assert 'FINISHED' in bpy.ops.rigidbody.object_add()
        obj.rigid_body.type = 'PASSIVE'
        obj.rigid_body.collision_shape = 'BOX'
        obj.rigid_body.friction = 0.73
        fixture_transform = exporter.convert_transform(obj.matrix_world)
        passive_body = exporter.build_body_from_object(
            obj, bpy.context.evaluated_depsgraph_get(), False, fixture_transform
        )
        assert passive_body['mass'] == 0.0
        assert passive_body['friction'] == 0.73
        assert passive_body['volume']['extents'][1] == 0.0
        assert exporter.should_export_passive_body_as_colliders(obj, passive_body)
        passive_colliders = exporter.build_colliders_from_object(
            obj, bpy.context.evaluated_depsgraph_get(), False, include_all_faces=True
        )
        assert passive_colliders == [[[0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [0.0, 0.0, -1.0]]]

        obj.rigid_body.collision_shape = 'MESH'
        assert exporter.should_export_passive_body_as_colliders(obj, passive_body)
        obj.rigid_body.type = 'ACTIVE'
        assert not exporter.should_export_passive_body_as_colliders(obj, passive_body)

        uv_map.uv_map = 'MissingUV'
        try:
            exporter.build_model_from_object(obj, bpy.context.evaluated_depsgraph_get(), False, asset_dir)
            raise AssertionError('Expected a non-active UV map to fail export')
        except RuntimeError as error:
            assert "UV map 'MissingUV' is not the active exported UV map 'UVMap'" in str(error)
        finally:
            uv_map.uv_map = 'UVMap'

        unsupported, unsupported_principled = make_material('UnsupportedFixture')
        unsupported_node = unsupported.node_tree.nodes.new('ShaderNodeTexMagic')
        unsupported.node_tree.links.new(unsupported_node.outputs['Color'], unsupported_principled.inputs['Roughness'])
        try:
            exporter.extract_material(unsupported, asset_dir)
            raise AssertionError('Unsupported contributing nodes must fail export')
        except RuntimeError as error:
            message = str(error)
            assert 'UnsupportedFixture' in message and unsupported_node.name in message and 'Color' in message

        achromatic_hsl, achromatic_principled = make_material('AchromaticHSLRampFixture')
        achromatic_ramp = achromatic_hsl.node_tree.nodes.new('ShaderNodeValToRGB')
        achromatic_ramp.color_ramp.color_mode = 'HSL'
        achromatic_ramp.color_ramp.hue_interpolation = 'NEAR'
        achromatic_ramp.color_ramp.elements[0].color = (0.15, 0.15, 0.15, 1.0)
        achromatic_ramp.color_ramp.elements[1].color = (0.9, 0.9, 0.9, 0.5)
        achromatic_hsl.node_tree.links.new(achromatic_ramp.outputs['Color'], achromatic_principled.inputs['Base Color'])
        achromatic_export = exporter.extract_material(achromatic_hsl, asset_dir)
        achromatic_output = achromatic_export['graph']['outputs']['baseColor']
        achromatic_node = achromatic_export['graph']['nodes'][achromatic_output['node']]
        assert achromatic_node['type'] == 'colorRamp'
        assert achromatic_node['properties'] == {'interpolation': 'LINEAR', 'elementCount': 2}

        colored_hsl, colored_principled = make_material('ColoredHSLRampFixture')
        colored_ramp = colored_hsl.node_tree.nodes.new('ShaderNodeValToRGB')
        colored_ramp.color_ramp.color_mode = 'HSL'
        colored_ramp.color_ramp.elements[0].color = (1.0, 0.0, 0.0, 1.0)
        colored_ramp.color_ramp.elements[1].color = (0.0, 1.0, 0.0, 1.0)
        colored_hsl.node_tree.links.new(colored_ramp.outputs['Color'], colored_principled.inputs['Base Color'])
        try:
            exporter.extract_material(colored_hsl, asset_dir)
            raise AssertionError('Colored HSL ramps must not silently change interpolation semantics')
        except RuntimeError as error:
            message = str(error)
            assert 'ColoredHSLRampFixture' in message and "ColorRamp color mode 'HSL' is unsupported" in message

        minkowski_material, minkowski_principled = make_material('MinkowskiVoronoiFixture')
        minkowski = minkowski_material.node_tree.nodes.new('ShaderNodeTexVoronoi')
        minkowski.voronoi_dimensions = '3D'
        minkowski.feature = 'F1'
        minkowski.distance = 'MINKOWSKI'
        minkowski.inputs['Exponent'].default_value = 3.5
        minkowski_material.node_tree.links.new(minkowski.outputs['Color'], minkowski_principled.inputs['Base Color'])
        minkowski_export = exporter.extract_material(minkowski_material, asset_dir)
        minkowski_output = minkowski_export['graph']['outputs']['baseColor']
        minkowski_node = minkowski_export['graph']['nodes'][minkowski_output['node']]
        assert minkowski_node['type'] == 'voronoiTexture'
        assert minkowski_node['properties']['distance'] == 'MINKOWSKI'
        assert abs(minkowski_node['inputs']['exponent']['value'] - 3.5) < 1e-6

        voronoi_edge_material, voronoi_edge_principled = make_material('Voronoi3DEdgeFixture')
        voronoi_edge = voronoi_edge_material.node_tree.nodes.new('ShaderNodeTexVoronoi')
        voronoi_edge.voronoi_dimensions = '3D'
        voronoi_edge.feature = 'DISTANCE_TO_EDGE'
        voronoi_edge.distance = 'EUCLIDEAN'
        voronoi_edge_material.node_tree.links.new(
            voronoi_edge.outputs['Distance'], voronoi_edge_principled.inputs['Roughness']
        )
        voronoi_edge_export = exporter.extract_material(voronoi_edge_material, asset_dir)
        voronoi_edge_output = voronoi_edge_export['graph']['outputs']['roughness']
        voronoi_edge_node = voronoi_edge_export['graph']['nodes'][voronoi_edge_output['node']]
        assert voronoi_edge_node['type'] == 'voronoiTexture'
        assert voronoi_edge_node['properties']['dimensions'] == '3D'
        assert voronoi_edge_node['properties']['feature'] == 'DISTANCE_TO_EDGE'

        voronoi_4d_material, voronoi_4d_principled = make_material('Voronoi4DFixture')
        voronoi_4d = voronoi_4d_material.node_tree.nodes.new('ShaderNodeTexVoronoi')
        voronoi_4d.voronoi_dimensions = '4D'
        voronoi_4d.feature = 'F1'
        voronoi_4d.distance = 'EUCLIDEAN'
        voronoi_4d.inputs['W'].default_value = 0.4
        voronoi_4d_material.node_tree.links.new(
            voronoi_4d.outputs['Distance'], voronoi_4d_principled.inputs['Roughness']
        )
        voronoi_4d_export = exporter.extract_material(voronoi_4d_material, asset_dir)
        voronoi_4d_output = voronoi_4d_export['graph']['outputs']['roughness']
        voronoi_4d_node = voronoi_4d_export['graph']['nodes'][voronoi_4d_output['node']]
        assert voronoi_4d_node['properties']['dimensions'] == '4D'
        assert voronoi_4d_node['properties']['feature'] == 'F1'
        assert abs(voronoi_4d_node['inputs']['w']['value'] - 0.4) < 1e-6

        unsupported_volume, _ = make_material('UnsupportedVolumeFixture')
        unsupported_volume_output = next(
            node for node in unsupported_volume.node_tree.nodes if node.type == 'OUTPUT_MATERIAL'
        )
        principled_volume = unsupported_volume.node_tree.nodes.new('ShaderNodeVolumePrincipled')
        unsupported_volume.node_tree.links.new(
            principled_volume.outputs['Volume'], unsupported_volume_output.inputs['Volume']
        )
        try:
            exporter.extract_material(unsupported_volume, asset_dir)
            raise AssertionError('Unsupported contributing volume closures must fail export')
        except RuntimeError as error:
            message = str(error)
            assert 'UnsupportedVolumeFixture' in message and 'unsupported contributing volume closure' in message

        missing_attribute, attribute_principled = make_material('MissingAttributeFixture')
        attribute_node = missing_attribute.node_tree.nodes.new('ShaderNodeAttribute')
        attribute_node.attribute_name = 'wave_crests'
        missing_attribute.node_tree.links.new(
            attribute_node.outputs['Factor'], attribute_principled.inputs['Roughness']
        )
        attribute_warning = io.StringIO()
        with contextlib.redirect_stdout(attribute_warning):
            missing_attribute_export = exporter.extract_material(missing_attribute, asset_dir, set())
        assert missing_attribute_export['graph']['outputs']['roughness'] == {'value': 0.0}
        assert "missing geometry attribute 'wave_crests'" in attribute_warning.getvalue()
        try:
            exporter.extract_material(missing_attribute, asset_dir, {'wave_crests'})
            raise AssertionError('Present custom geometry attributes must fail export')
        except RuntimeError as error:
            message = str(error)
            assert 'wave_crests' in message and 'luz v1 vertex format' in message

        mixed, mixed_principled = make_material('MixedSurfaceFixture')
        mixed_output = next(node for node in mixed.node_tree.nodes if node.type == 'OUTPUT_MATERIAL')
        mixed.node_tree.links.remove(mixed_output.inputs['Surface'].links[0])
        glossy = mixed.node_tree.nodes.new('ShaderNodeBsdfGlossy')
        fresnel = mixed.node_tree.nodes.new('ShaderNodeFresnel')
        rgb_curves = mixed.node_tree.nodes.new('ShaderNodeRGBCurve')
        rgb_curves.mapping.curves[3].points.new(0.5, 0.33)
        mixed.node_tree.links.new(fresnel.outputs['Fac'], rgb_curves.inputs['Color'])
        mixed.node_tree.links.new(rgb_curves.outputs['Color'], glossy.inputs['Color'])
        mix_shader = mixed.node_tree.nodes.new('ShaderNodeMixShader')
        mix_shader.inputs[0].default_value = 0.35
        mixed.node_tree.links.new(mixed_principled.outputs['BSDF'], mix_shader.inputs[1])
        mixed.node_tree.links.new(glossy.outputs[0], mix_shader.inputs[2])
        mixed.node_tree.links.new(mix_shader.outputs[0], mixed_output.inputs['Surface'])
        mixed_export = exporter.extract_material(mixed, asset_dir)
        assert mixed_export['graph']['outputs']['baseColor'] == {
            'value': list(mixed_principled.inputs['Base Color'].default_value)
        }
        mixed_surface = mixed_export['graph']['surface']
        assert mixed_surface['type'] == 'mix'
        assert abs(mixed_surface['factor']['value'] - 0.35) < 1e-6
        assert mixed_surface['firstClosure'] == {'type': 'principled'}
        assert mixed_surface['secondClosure']['type'] == 'glossy'
        glossy_color = mixed_surface['secondClosure']['color']
        curves_export = mixed_export['graph']['nodes'][glossy_color['node']]
        assert curves_export['type'] == 'rgbCurves'
        assert curves_export['properties']['pointCount'] == 3
        assert mixed_export['graph']['nodes'][curves_export['inputs']['color']['node']]['type'] == 'fresnel'
        assert mixed_surface['secondClosure']['roughness'] == {'value': float(glossy.inputs['Roughness'].default_value)}

        nested, nested_principled = make_material('NestedMixedSurfaceFixture')
        nested_output = next(node for node in nested.node_tree.nodes if node.type == 'OUTPUT_MATERIAL')
        nested.node_tree.links.remove(nested_output.inputs['Surface'].links[0])
        nested_glossy = nested.node_tree.nodes.new('ShaderNodeBsdfGlossy')
        inner_mix = nested.node_tree.nodes.new('ShaderNodeMixShader')
        inner_mix.inputs[0].default_value = 0.2
        nested.node_tree.links.new(nested_principled.outputs['BSDF'], inner_mix.inputs[1])
        nested.node_tree.links.new(nested_glossy.outputs[0], inner_mix.inputs[2])
        second_nested_principled = nested.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        second_nested_principled.inputs['Base Color'].default_value = (0.1, 0.3, 0.8, 1.0)
        outer_mix = nested.node_tree.nodes.new('ShaderNodeMixShader')
        outer_mix.inputs[0].default_value = 0.6
        nested.node_tree.links.new(inner_mix.outputs[0], outer_mix.inputs[1])
        nested.node_tree.links.new(second_nested_principled.outputs['BSDF'], outer_mix.inputs[2])
        nested.node_tree.links.new(outer_mix.outputs[0], nested_output.inputs['Surface'])
        nested_export = exporter.extract_material(nested, asset_dir)
        assert nested_export['graph']['surface']['type'] == 'mix'
        assert nested_export['graph']['surface']['firstClosure']['type'] == 'mix'
        nested_base_color = nested_export['graph']['outputs']['baseColor']
        assert nested_export['graph']['nodes'][nested_base_color['node']]['type'] == 'mix'

        metadata_only, metadata_principled = make_material('TransmissionMetadataFixture')
        metadata_only['luz_transmission_depth'] = 0.2
        metadata_only['luz_transmission_edge_fade'] = 0.05
        metadata_warning = io.StringIO()
        with contextlib.redirect_stdout(metadata_warning):
            metadata_export = exporter.extract_material(metadata_only, asset_dir)
        assert metadata_export['graph']['outputs']['transmission'] == {'value': 0.0}
        assert 'blendMode' not in metadata_export
        assert metadata_export['transmissionDepth'] == 0.2
        assert metadata_export['transmissionEdgeFade'] == 0.05
        assert 'has transmission metadata but its exported transmission is zero' in metadata_warning.getvalue()

        ambiguous, first_principled = make_material('AmbiguousSurfaceFixture')
        ambiguous_output = next(node for node in ambiguous.node_tree.nodes if node.type == 'OUTPUT_MATERIAL')
        ambiguous.node_tree.links.remove(ambiguous_output.inputs['Surface'].links[0])
        second_principled = ambiguous.node_tree.nodes.new('ShaderNodeBsdfPrincipled')
        ambiguous_mix = ambiguous.node_tree.nodes.new('ShaderNodeMixShader')
        ambiguous_factor = ambiguous.node_tree.nodes.new('ShaderNodeValue')
        ambiguous_factor.outputs['Value'].default_value = 0.25
        ambiguous['luz_transmission_edge_fade'] = 0.2
        first_principled.inputs['Base Color'].default_value = (1.0, 0.0, 0.0, 1.0)
        second_principled.inputs['Base Color'].default_value = (0.0, 0.0, 1.0, 1.0)
        second_principled.inputs['Transmission Weight'].default_value = 1.0
        second_principled.inputs['IOR'].default_value = 1.333
        ambiguous.node_tree.links.new(ambiguous_factor.outputs['Value'], ambiguous_mix.inputs[0])
        ambiguous.node_tree.links.new(first_principled.outputs['BSDF'], ambiguous_mix.inputs[1])
        ambiguous.node_tree.links.new(second_principled.outputs['BSDF'], ambiguous_mix.inputs[2])
        ambiguous.node_tree.links.new(ambiguous_mix.outputs[0], ambiguous_output.inputs['Surface'])
        ambiguous_warning = io.StringIO()
        with contextlib.redirect_stdout(ambiguous_warning):
            first_ambiguous_export = exporter.extract_material(ambiguous, asset_dir)
            ambiguous_export = exporter.extract_material(ambiguous, asset_dir)
        assert json.dumps(first_ambiguous_export, sort_keys=True) == json.dumps(ambiguous_export, sort_keys=True)
        assert ambiguous_export['graph']['surface'] == {'type': 'principled'}
        assert ambiguous_export['blendMode'] == 'transmissive'
        assert ambiguous_export['transmissionEdgeFade'] == 0.2
        assert 'flattens 2 mixed Principled BSDF closures' in ambiguous_warning.getvalue()
        base_color_mix = ambiguous_export['graph']['nodes'][ambiguous_export['graph']['outputs']['baseColor']['node']]
        assert base_color_mix['type'] == 'mix'
        assert base_color_mix['properties']['dataType'] == 'RGBA'
        factor_link = base_color_mix['inputs']['factor']
        assert ambiguous_export['graph']['nodes'][factor_link['node']]['type'] == 'value'
        assert ambiguous_export['graph']['nodes'][factor_link['node']]['inputs']['value'] == {'value': 0.25}
        assert base_color_mix['inputs']['a'] == {'value': [1.0, 0.0, 0.0, 1.0]}
        assert base_color_mix['inputs']['b'] == {'value': [0.0, 0.0, 1.0, 1.0]}

        menu_material, menu_principled = make_material('ShaderMenuSwitchFixture')
        menu_output = next(node for node in menu_material.node_tree.nodes if node.type == 'OUTPUT_MATERIAL')
        menu_material.node_tree.links.remove(menu_output.inputs['Surface'].links[0])
        unsupported_branch = menu_material.node_tree.nodes.new('ShaderNodeBsdfTranslucent')
        menu_switch = menu_material.node_tree.nodes.new('GeometryNodeMenuSwitch')
        menu_switch.data_type = 'SHADER'
        menu_switch.inputs['Menu'].default_value = 'A'
        menu_material.node_tree.links.new(menu_principled.outputs['BSDF'], menu_switch.inputs['A'])
        menu_material.node_tree.links.new(unsupported_branch.outputs[0], menu_switch.inputs['B'])
        menu_material.node_tree.links.new(menu_switch.outputs['Output'], menu_output.inputs['Surface'])
        menu_export = exporter.extract_material(menu_material, asset_dir)
        assert menu_export['graph']['surface'] == {'type': 'principled'}

        raycast_material, raycast_principled = make_material('RaycastFallbackFixture')
        raycast = raycast_material.node_tree.nodes.new('ShaderNodeRaycast')
        raycast.inputs['Length'].default_value = 0.75
        raycast_material.node_tree.links.new(raycast.outputs['Hit Distance'], raycast_principled.inputs['Roughness'])
        raycast_warning = io.StringIO()
        with contextlib.redirect_stdout(raycast_warning):
            raycast_export = exporter.extract_material(raycast_material, asset_dir)
        assert raycast_export['graph']['outputs']['roughness'] == {'value': 0.75}
        assert "exporting Blender's no-hit result" in raycast_warning.getvalue()

        glass_material, unused_glass_principled = make_material('GlassClosureFixture')
        glass_output = next(node for node in glass_material.node_tree.nodes if node.type == 'OUTPUT_MATERIAL')
        glass_material.node_tree.links.remove(glass_output.inputs['Surface'].links[0])
        glass_material.node_tree.nodes.remove(unused_glass_principled)
        glass = glass_material.node_tree.nodes.new('ShaderNodeBsdfGlass')
        glass.inputs['Color'].default_value = (0.15, 0.55, 0.8, 1.0)
        glass.inputs['Roughness'].default_value = 0.18
        glass.inputs['IOR'].default_value = 1.333
        glass_bump = glass_material.node_tree.nodes.new('ShaderNodeBump')
        glass_bump.inputs['Height'].default_value = 0.65
        glass_material.node_tree.links.new(glass_bump.outputs['Normal'], glass.inputs['Normal'])
        glass_material.node_tree.links.new(glass.outputs['BSDF'], glass_output.inputs['Surface'])
        glass_export = exporter.extract_material(glass_material, asset_dir)
        assert glass_export['blendMode'] == 'transmissive'
        assert glass_export['graph']['surface'] == {'type': 'principled'}
        assert glass_export['graph']['outputs']['transmission'] == {'value': 1.0}
        assert abs(glass_export['graph']['outputs']['roughness']['value'] - 0.18) < 1e-6
        assert abs(glass_export['graph']['outputs']['indexOfRefraction']['value'] - 1.333) < 1e-6
        assert glass_export['graph']['nodes'][glass_export['graph']['outputs']['normal']['node']]['type'] == 'bump'

        light_data = bpy.data.lights.new('ClipPlaneFixture', 'SPOT')
        light_object = bpy.data.objects.new('ClipPlaneFixture', light_data)
        assert exporter.light_component_from_object(light_object)['clipPlanes'][0] == 0.1
        light_data['luz_clip_start'] = 0.2
        light_data['luz_clip_end'] = 75.0
        assert exporter.light_component_from_object(light_object)['clipPlanes'] == [0.2, 75.0]
        light_object['luz_clip_start'] = 0.3
        light_object['luz_clip_end'] = 60.0
        assert exporter.light_component_from_object(light_object)['clipPlanes'] == [0.3, 60.0]
        light_object['luz_clip_end'] = 0.1
        try:
            exporter.light_component_from_object(light_object)
            raise AssertionError('Invalid light clip planes must fail export')
        except RuntimeError as error:
            assert 'luz_clip_end' in str(error) and 'luz_clip_start' in str(error)

        camera_data = bpy.data.cameras.new('DepthOfFieldFixture')
        camera_object = bpy.data.objects.new('DepthOfFieldFixture', camera_data)
        focus_object = bpy.data.objects.new('DepthOfFieldFocus', None)
        camera_object.matrix_world.translation = (0.0, 0.0, 0.0)
        focus_object.matrix_world.translation = (0.0, 0.0, -7.0)
        camera_data.lens = 85.0
        camera_data.dof.use_dof = True
        camera_data.dof.focus_object = focus_object
        camera_data.dof.aperture_fstop = 1.8
        camera_export = exporter.camera_component_from_object(camera_object, bpy.context.scene)
        assert camera_export['isDepthOfFieldEnabled'] is True
        assert abs(camera_export['focusDistance'] - 7.0) < 1e-6
        assert abs(camera_export['focalLength'] - 85.0) < 1e-6
        assert camera_export['sensorHeight'] > 0.0
        assert abs(camera_export['fStop'] - 1.8) < 1e-6

        camera_data.dof.focus_object = None
        camera_data.dof.focus_distance = 3.25
        camera_export = exporter.camera_component_from_object(camera_object, bpy.context.scene)
        assert abs(camera_export['focusDistance'] - 3.25) < 1e-6

        glow, unused_principled = make_material('TransparentEmissionFixture')
        glow_output = next(node for node in glow.node_tree.nodes if node.type == 'OUTPUT_MATERIAL')
        glow.node_tree.links.remove(glow_output.inputs['Surface'].links[0])
        glow.node_tree.nodes.remove(unused_principled)
        transparent = glow.node_tree.nodes.new('ShaderNodeBsdfTransparent')
        emission = glow.node_tree.nodes.new('ShaderNodeEmission')
        emission.inputs['Color'].default_value = (1.0, 0.0, 0.02, 1.0)
        factor = glow.node_tree.nodes.new('ShaderNodeValue')
        factor.outputs['Value'].default_value = 0.6
        glow_mix = glow.node_tree.nodes.new('ShaderNodeMixShader')
        glow.node_tree.links.new(factor.outputs['Value'], glow_mix.inputs[0])
        glow.node_tree.links.new(transparent.outputs[0], glow_mix.inputs[1])
        glow.node_tree.links.new(emission.outputs[0], glow_mix.inputs[2])
        glow.node_tree.links.new(glow_mix.outputs[0], glow_output.inputs['Surface'])
        glow_export = exporter.extract_material(glow, asset_dir)
        assert glow_export['alphaMode'] == 'blend'
        assert glow_export['graph']['surface']['type'] == 'mix'
        assert glow_export['graph']['surface']['firstClosure']['type'] == 'transparent'
        assert glow_export['graph']['surface']['secondClosure']['type'] == 'emission'
        assert glow_export['graph']['surface']['factor'] == {
            'node': next(node_id for node_id, node in glow_export['graph']['nodes'].items() if node['type'] == 'value'),
            'output': 'Value',
        }

        added, unused_added_principled = make_material('AddedSurfaceFixture')
        added_output = next(node for node in added.node_tree.nodes if node.type == 'OUTPUT_MATERIAL')
        added.node_tree.links.remove(added_output.inputs['Surface'].links[0])
        added.node_tree.nodes.remove(unused_added_principled)
        added_emission = added.node_tree.nodes.new('ShaderNodeEmission')
        added_emission.inputs['Color'].default_value = (0.1, 1.0, 0.2, 1.0)
        added_glossy = added.node_tree.nodes.new('ShaderNodeBsdfGlossy')
        add_shader = added.node_tree.nodes.new('ShaderNodeAddShader')
        added.node_tree.links.new(added_emission.outputs[0], add_shader.inputs[0])
        added.node_tree.links.new(added_glossy.outputs[0], add_shader.inputs[1])
        added.node_tree.links.new(add_shader.outputs[0], added_output.inputs['Surface'])
        added_export = exporter.extract_material(added, asset_dir)
        assert added_export['graph']['surface']['type'] == 'add'
        assert added_export['graph']['surface']['firstClosure']['type'] == 'emission'
        assert added_export['graph']['surface']['secondClosure']['type'] == 'glossy'

        environment_image = bpy.data.images.new('FixtureEnvironment', 8, 4, float_buffer=True)
        environment_image.filepath_raw = os.path.join(asset_dir, 'fixture-environment.exr')
        environment_image.file_format = 'OPEN_EXR'
        environment_image.pixels = [
            component for y in range(4) for x in range(8) for component in (x / 7.0, y / 3.0, 0.25, 1.0)
        ]
        environment_image.save()

        world = bpy.data.worlds.new('Fixture World')
        world.use_nodes = True
        world.node_tree.nodes.clear()
        world_output = world.node_tree.nodes.new('ShaderNodeOutputWorld')
        world_output.is_active_output = True
        background = world.node_tree.nodes.new('ShaderNodeBackground')
        background.inputs['Strength'].default_value = 1.5
        environment_texture = world.node_tree.nodes.new('ShaderNodeTexEnvironment')
        environment_texture.image = environment_image
        mapping = world.node_tree.nodes.new('ShaderNodeMapping')
        mapping.inputs['Rotation'].default_value[2] = 0.25
        texture_coordinates = world.node_tree.nodes.new('ShaderNodeTexCoord')
        world.node_tree.links.new(texture_coordinates.outputs['Generated'], mapping.inputs['Vector'])
        world.node_tree.links.new(mapping.outputs['Vector'], environment_texture.inputs['Vector'])
        world.node_tree.links.new(environment_texture.outputs['Color'], background.inputs['Color'])
        world.node_tree.links.new(background.outputs['Background'], world_output.inputs['Surface'])
        world['luz_environment_sky_size'] = 16
        world['luz_environment_radiance_size'] = 16
        world['luz_environment_irradiance_size'] = 8
        world['luz_environment_samples'] = 8

        scene_path = os.path.join(asset_dir, 'scenes', 'fixture.scene.json')
        environment_export = exporter.export_world_environment(world, scene_path)
        assert environment_export['sky'] == '../environments/Fixture_World/sky.ktx'
        assert environment_export['radiance'] == '../environments/Fixture_World/radiance.ktx'
        assert environment_export['irradiance'] == '../environments/Fixture_World/irradiance.ktx'
        assert abs(environment_export['rotation'] + 0.25) < 1e-6

        environment_dir = os.path.join(asset_dir, 'environments', 'Fixture_World')

        def read_ktx_header(filename):
            with open(os.path.join(environment_dir, filename), 'rb') as ktx_file:
                identifier = ktx_file.read(12)
                header = struct.unpack('<13I', ktx_file.read(13 * 4))
            assert identifier == b'\xabKTX 11\xbb\r\n\x1a\n'
            assert header[1:6] == (0x140B, 2, 0x1908, 0x881A, 0x1908)
            assert header[10] == 6
            return header

        assert read_ktx_header('sky.ktx')[6:12] == (16, 16, 0, 0, 6, 1)
        assert read_ktx_header('radiance.ktx')[6:12] == (16, 16, 0, 0, 6, 5)
        assert read_ktx_header('irradiance.ktx')[6:12] == (8, 8, 0, 0, 6, 1)

        radiance_path = os.path.join(environment_dir, 'radiance.ktx')
        radiance_modified = os.stat(radiance_path).st_mtime_ns
        assert exporter.export_world_environment(world, scene_path) == environment_export
        assert os.stat(radiance_path).st_mtime_ns == radiance_modified

        unsupported_world = bpy.data.worlds.new('Unsupported World')
        unsupported_world.use_nodes = True
        unsupported_world.node_tree.nodes.clear()
        unsupported_output = unsupported_world.node_tree.nodes.new('ShaderNodeOutputWorld')
        unsupported_output.is_active_output = True
        unsupported_background = unsupported_world.node_tree.nodes.new('ShaderNodeBackground')
        unsupported_noise = unsupported_world.node_tree.nodes.new('ShaderNodeTexNoise')
        unsupported_world.node_tree.links.new(
            unsupported_noise.outputs['Color'], unsupported_background.inputs['Color']
        )
        unsupported_world.node_tree.links.new(
            unsupported_background.outputs['Background'], unsupported_output.inputs['Surface']
        )
        try:
            exporter.environment_world_source(unsupported_world)
            raise AssertionError('Unsupported contributing World nodes must fail export')
        except RuntimeError as error:
            message = str(error)
            assert 'Unsupported World' in message
            assert unsupported_noise.name in message
            assert 'bake the contributing World color graph' in message

    print('luz material graph exporter fixture passed')


main()
