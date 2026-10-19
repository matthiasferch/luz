import type { RenderBackend } from '../renderer/render-backend'
import type { Buffer } from '../types/buffer'
import type { DrawPrimitive } from '../types/primitive'
import type { Texture } from '../types/texture'

function trackResources<Manager extends object, Resource extends object>(
  manager: Manager,
  allocations: Set<Resource>,
  createNames: readonly string[]
): Manager {
  return new Proxy(manager, {
    get(target, key) {
      const value: unknown = Reflect.get(target, key, target)

      if (typeof value !== 'function') {
        return value
      }

      return (...parameters: unknown[]) => {
        if (key === 'destroy' && !allocations.has(parameters[0] as Resource)) {
          return
        }

        const result: unknown = Reflect.apply(value, target, parameters)

        if (typeof key === 'string' && createNames.includes(key) && result && typeof result === 'object') {
          allocations.add(result as Resource)
        }

        if (key === 'destroy') {
          allocations.delete(parameters[0] as Resource)
        }

        return result
      }
    }
  })
}
export class ResourceScope {
  readonly backend: RenderBackend

  private readonly textures = new Set<Texture>()
  private readonly buffers = new Set<Buffer>()
  private readonly primitives = new Set<DrawPrimitive>()
  constructor(private readonly owner: RenderBackend) {
    const managers = {
      textures: trackResources(owner.textures, this.textures, ['create', 'create2DFromKTX', 'createCubeFromKTX']),
      buffers: trackResources(owner.buffers, this.buffers, ['create']),
      primitives: trackResources(owner.primitives, this.primitives, ['create'])
    }

    this.backend = new Proxy(owner, {
      get(target, key) {
        if (key === 'textures' || key === 'buffers' || key === 'primitives') {
          return managers[key]
        }

        const value: unknown = Reflect.get(target, key, target)

        return typeof value === 'function' ? value.bind(target) : value
      },

      set(target, key, value: unknown) {
        return Reflect.set(target, key, value, target)
      }
    })
  }

  destroy(): void {
    for (const primitive of this.primitives) {
      this.owner.primitives.destroy(primitive)
    }

    for (const buffer of this.buffers) {
      this.owner.buffers.destroy(buffer)
    }

    for (const texture of this.textures) {
      this.owner.textures.destroy(texture)
    }

    this.primitives.clear()
    this.buffers.clear()
    this.textures.clear()
  }
}
