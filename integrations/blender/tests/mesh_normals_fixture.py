"""Run with Blender --background --factory-startup --python-exit-code 1 --python this_file."""

import importlib.util
import math
import struct
import tempfile
import unittest
from pathlib import Path

import bpy
from mathutils import Vector

specification = importlib.util.spec_from_file_location(
    'luz_normals_fixture', Path(__file__).resolve().parents[1] / 'luz_exporter' / 'exporter.py'
)
exporter = importlib.util.module_from_spec(specification)
specification.loader.exec_module(exporter)


class MeshNormalsTests(unittest.TestCase):
    def setUp(self):
        bpy.ops.wm.read_factory_settings(use_empty=True)

    def create_cube(self):
        bpy.ops.mesh.primitive_cube_add()
        return bpy.context.object

    def assert_export_matches(self, obj, apply_modifiers=True):
        bpy.context.view_layer.update()
        dependencies = bpy.context.evaluated_depsgraph_get()
        source = obj.evaluated_get(dependencies).data if apply_modifiers else obj.data
        source.calc_loop_triangles()
        expected = {}

        for triangle in source.loop_triangles:
            polygon = source.polygons[triangle.polygon_index]
            material = source.materials[polygon.material_index] if source.materials else None
            key = material.name if material else f'{obj.name}_mat{polygon.material_index}'
            corners = expected.setdefault(key, [])
            for loop_index in triangle.loops:
                vertex = source.vertices[source.loops[loop_index].vertex_index]
                normal = source.corner_normals[loop_index].vector
                coordinates = source.uv_layers.active.data[loop_index].uv if source.uv_layers.active else (0, 0)
                corners.append((*vertex.co, *normal, *coordinates))

        original_face_count = len(obj.data.polygons)
        model = {'meshes': exporter.build_meshes_from_object(obj, dependencies, apply_modifiers)}
        with tempfile.TemporaryDirectory(prefix='luz-normals-fixture-') as directory:
            path = Path(directory) / 'fixture.model.json'
            exporter.write_geometry_file(str(path), model)
            geometry = (path.parent / model['geometry']['uri']).read_bytes()
            self.assertEqual(set(model['meshes']), set(expected))

            for name, mesh in model['meshes'].items():
                vertices, indices = mesh['vertices'], mesh['indices']
                index_format = '<H' if indices['format'] == 'uint16' else '<I'
                index_size = struct.calcsize(index_format)
                self.assertEqual(indices['count'], len(expected[name]))
                expected_normals = {}
                actual_normals = {}
                for corner in expected[name]:
                    expected_normals.setdefault((*corner[:3], *corner[6:]), []).append(corner[3:6])
                for index in range(indices['count']):
                    vertex_index = struct.unpack_from(
                        index_format, geometry, indices['byteOffset'] + index * index_size
                    )[0]
                    values = struct.unpack_from(
                        '<8f', geometry, vertices['byteOffset'] + vertex_index * vertices['byteStride']
                    )
                    position = (values[0], -values[2], values[1])
                    normal = (values[3], -values[5], values[4])
                    actual_normals.setdefault((*position, *values[6:]), []).append(normal)
                    self.assertAlmostEqual(math.hypot(*normal), 1, places=5)
                self.assertEqual(set(actual_normals), set(expected_normals))
                for key, normals in expected_normals.items():
                    for references, samples in ((normals, actual_normals[key]), (actual_normals[key], normals)):
                        for normal in samples:
                            error = min(
                                max(abs(value - expected) for value, expected in zip(normal, reference))
                                for reference in references
                            )
                            self.assertLess(error, 2e-5, f'{obj.name} corner {key} normal {normal}')

        self.assertEqual(len(obj.data.polygons), original_face_count)

    def test_flat_and_smooth_faces(self):
        obj = self.create_cube()
        self.assert_export_matches(obj)
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        self.assert_export_matches(obj)
        obj.data.polygons[0].use_smooth = False
        self.assert_export_matches(obj)

    def test_sharp_edges_split_smooth_vertex_normals(self):
        obj = self.create_cube()
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        for edge in obj.data.edges:
            edge.use_edge_sharp = True
        self.assert_export_matches(obj)

    def test_custom_ngon_corner_normals_keep_uv_and_material_seams(self):
        mesh = bpy.data.meshes.new('Custom corners')
        mesh.from_pydata(
            [(-1, -1, 0), (1, -1, 0), (1, 1, 0), (0, 2, 0), (-1, 1, 0), (0, -1, 1)],
            [],
            [(0, 1, 2, 3, 4), (1, 0, 5)],
        )
        obj = bpy.data.objects.new('Custom corners', mesh)
        bpy.context.scene.collection.objects.link(obj)
        for name in ('Top', 'Side'):
            mesh.materials.append(bpy.data.materials.new(name))
        mesh.polygons[1].material_index = 1
        mesh.uv_layers.new()
        for index, coordinate in enumerate(mesh.uv_layers.active.data):
            coordinate.uv = (index / 10, 1 - index / 10)
        for polygon in mesh.polygons:
            polygon.use_smooth = True
        mesh.normals_split_custom_set(
            [Vector((0.1 + index * 0.03, 0.2, 1)).normalized() for index in range(len(mesh.loops))]
        )
        self.assertTrue(mesh.has_custom_normals)
        self.assert_export_matches(obj)

    def create_beveled_cube(self):
        obj = self.create_cube()
        for polygon in obj.data.polygons:
            polygon.use_smooth = True
        bevel = obj.modifiers.new('Rounded edges', 'BEVEL')
        bevel.width = 0.15
        bevel.segments = 3
        bevel.harden_normals = True
        return obj

    def test_hardened_bevel_normals(self):
        obj = self.create_beveled_cube()
        self.assert_export_matches(obj)
        self.assert_export_matches(obj, apply_modifiers=False)

    def test_weighted_normals_after_bevel(self):
        obj = self.create_beveled_cube()
        weighted = obj.modifiers.new('Face normals', 'WEIGHTED_NORMAL')
        weighted.keep_sharp = True
        self.assert_export_matches(obj)


if __name__ == '__main__':
    result = unittest.TextTestRunner(verbosity=2).run(
        unittest.defaultTestLoader.loadTestsFromTestCase(MeshNormalsTests)
    )
    if not result.wasSuccessful():
        raise SystemExit(1)
