import type { Mesh } from '../renderer/mesh'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderMaterial } from '../renderer/render-material'
import type { Primitive } from '../types/primitive'

export class MeshCompiler {
  constructor(private readonly backend: RenderBackend) {}

  compile(mesh: Mesh, material: RenderMaterial): Primitive {
    return this.backend.primitives.create(mesh, material)
  }
}
