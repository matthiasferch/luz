"""Map playground box faces at a consistent physical texture scale."""

import math

import bpy


def update_box_texture_coordinates(obj, meters_per_tile=1.0):
    if obj.type != 'MESH' or obj.mode != 'OBJECT':
        raise RuntimeError(f"'{obj.name}' must be a mesh in Object Mode")
    if not math.isfinite(meters_per_tile) or meters_per_tile <= 0:
        raise ValueError('Meters per texture tile must be positive and finite')
    matrix = obj.matrix_world.to_3x3()
    coordinates = {}
    for face in obj.data.polygons:
        positions = [matrix @ obj.data.vertices[index].co for index in face.vertices]
        origin = positions[0]
        edges = [position - origin for position in positions[1:]]
        horizontal = next((edge.normalized() for edge in edges if edge.length > 1e-8), None)
        if horizontal is None:
            raise RuntimeError(f"'{obj.name}' has a degenerate face")
        normal = next(
            (horizontal.cross(edge).normalized() for edge in edges if horizontal.cross(edge).length > 1e-8), None
        )
        if normal is None:
            raise RuntimeError(f"'{obj.name}' has a degenerate face")
        if any(abs((position - origin).dot(normal)) > 1e-5 for position in positions):
            raise RuntimeError(f"'{obj.name}' has a nonplanar face; triangulate it before mapping")
        vertical = normal.cross(horizontal)
        for loop, position in zip(face.loop_indices, positions):
            offset = (position - origin) / meters_per_tile
            coordinates[loop] = (offset.dot(horizontal), offset.dot(vertical))
    if obj.data.users > 1:
        obj.data = obj.data.copy()
    layer = next((layer for layer in obj.data.uv_layers if layer.active_render), None)
    if layer is None:
        layer = obj.data.uv_layers.active or obj.data.uv_layers.new(name='UVMap')
    for loop, coordinate in coordinates.items():
        layer.data[loop].uv = coordinate
    obj.data.update()


def update_playground_uvs():
    objects = [bpy.context.scene.objects.get(name) for name in ('Platform', 'Cuboid', 'Block')]
    if any(obj is None or obj.type != 'MESH' or obj.mode != 'OBJECT' for obj in objects):
        raise RuntimeError('Open the playground and switch Platform, Cuboid and Block to Object Mode')
    bpy.context.view_layer.update()
    for obj in objects:
        update_box_texture_coordinates(obj)
    print('Updated Platform, Cuboid and Block UVs: one texture tile per meter')


if __name__ == '__main__':
    update_playground_uvs()
