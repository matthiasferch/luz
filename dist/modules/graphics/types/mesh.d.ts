import { Material } from '../renderer/material';
import { VertexArray } from '../types/vertex-array';
export type Mesh = {
    vertexArray: VertexArray;
    material: Material;
};
