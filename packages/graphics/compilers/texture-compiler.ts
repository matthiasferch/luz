import { getImageDimensions } from '../types/texture-source'
import type { ColorSpace, Tuple4 } from '@luz/formats'
import { Surface } from '../renderer/surface'
import type { RenderBackend } from '../renderer/render-backend'
import type { Texture } from '../types/texture'

export type SurfaceResolver = (path: string) => Promise<TexImageSource>

interface TextureAllocation {
  referenceCount: number
  key?: string
}

interface TextureRequest {
  promise: Promise<Texture>
  texture?: Texture
}

export class TextureCompiler {
  private readonly compiledSurfaces = new Map<string, TextureRequest>()
  private readonly allocations = new Map<Texture, TextureAllocation>()

  private generation = 0

  constructor(
    private readonly backend: RenderBackend,
    private readonly resolveSurface: SurfaceResolver
  ) {}

  async compile(surface: Surface, defaultColorSpace: ColorSpace = 'linear'): Promise<Texture> {
    const generation = this.generation
    const resolvedSurface = new Surface(surface)

    resolvedSurface.colorSpace ??= defaultColorSpace

    let texture: Texture

    if (resolvedSurface.path) {
      const key = JSON.stringify({
        path: resolvedSurface.path,
        format: resolvedSurface.format,
        colorSpace: resolvedSurface.colorSpace,
        precision: resolvedSurface.precision,
        tiling: resolvedSurface.tiling,
        filtering: resolvedSurface.filtering,
        areMipmapsEnabled: resolvedSurface.areMipmapsEnabled
      })

      let request = this.compiledSurfaces.get(key)

      if (!request) {
        const promise = this.compileSurface(resolvedSurface, generation, key)
        const newRequest: TextureRequest = { promise }

        request = newRequest

        this.compiledSurfaces.set(key, newRequest)
        promise.then(
          (texture) => {
            newRequest.texture = texture
          },
          () => {
            if (this.compiledSurfaces.get(key) === newRequest) {
              this.compiledSurfaces.delete(key)
            }
          }
        )
      }

      texture = await request.promise
    } else {
      texture = await this.compileSurface(resolvedSurface, generation)
    }

    if (generation !== this.generation) {
      if (this.allocations.get(texture)?.referenceCount === 0) {
        this.release(texture)
      }

      throw new Error('Texture compilation was invalidated')
    }

    this.allocations.get(texture)!.referenceCount += 1

    return texture
  }

  private async compileSurface(surface: Surface, generation: number, key?: string): Promise<Texture> {
    if (surface.path) {
      const image = await this.resolveSurface(surface.path)
      const [width, height] = getImageDimensions(image)

      surface.data = image
      surface.width = width
      surface.height = height
    }

    if (generation !== this.generation) {
      throw new Error('Texture compilation was invalidated')
    }

    const texture = this.backend.textures.create(surface)

    this.allocations.set(texture, { referenceCount: 0, key })

    return texture
  }

  compileSolid(rgba: Tuple4): Texture {
    const texture = this.backend.textures.create({
      width: 1,
      height: 1,
      filtering: 'linear',
      precision: 8
    })

    try {
      this.backend.textures.update(texture, new Uint8Array(rgba), 0, 0, 1, 1)
      this.allocations.set(texture, { referenceCount: 1 })

      return texture
    } catch (error) {
      this.backend.textures.destroy(texture)

      throw error
    }
  }

  release(texture: Texture): void {
    const allocation = this.allocations.get(texture)

    if (!allocation) {
      return
    }

    allocation.referenceCount -= 1

    if (allocation.referenceCount > 0) {
      return
    }

    if (allocation.key && this.compiledSurfaces.get(allocation.key)?.texture === texture) {
      this.compiledSurfaces.delete(allocation.key)
    }

    this.allocations.delete(texture)
    this.backend.textures.destroy(texture)
  }

  beginReload(): void {
    this.generation += 1

    this.compiledSurfaces.clear()
  }

  clear(): void {
    this.beginReload()

    for (const texture of this.allocations.keys()) {
      this.backend.textures.destroy(texture)
    }

    this.allocations.clear()
  }
}
