import type { TextureTiling, TextureFiltering } from '@luz/formats'
import type { SamplerManager } from '../../render-backend'
import type { Sampler } from '../../../types/sampler'

export class WebGL2SamplerManager implements SamplerManager {
  private readonly samplers = new Set<Sampler>()

  private boundSamplers: { [index: number]: Sampler } = {}

  constructor(private gl: WebGL2RenderingContext) {}

  create(filtering: TextureFiltering = 'none', tiling: TextureTiling = 'none'): Sampler {
    const sampler = this.gl.createSampler() as Sampler | null

    if (!sampler) {
      throw new Error('Unable to allocate sampler')
    }

    this.samplers.add(sampler)

    try {
      this.update(sampler, filtering, tiling)

      return sampler
    } catch (error) {
      this.destroy(sampler)
      throw error
    }
  }

  update(sampler: Sampler, filtering: TextureFiltering, tiling: TextureTiling) {
    switch (filtering) {
      case 'none':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)

        break

      case 'linear':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST)

        break

      case 'bilinear':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST)

        break

      case 'trilinear':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR)

        break
    }

    switch (tiling) {
      case 'repeat':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)

        break

      case 'mirror':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT)

        break

      default:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

        break
    }

    sampler.filtering = filtering
    sampler.tiling = tiling
  }

  bind(sampler: Sampler, unit: number) {
    if (this.boundSamplers[unit] === sampler) {
      return
    }

    this.gl.bindSampler(unit, sampler)

    this.boundSamplers[unit] = sampler
  }

  destroy(sampler: Sampler): void {
    if (!this.samplers.delete(sampler)) {
      return
    }

    for (const [unit, boundSampler] of Object.entries(this.boundSamplers)) {
      if (boundSampler === sampler) {
        this.gl.bindSampler(Number(unit), null)
        delete this.boundSamplers[Number(unit)]
      }
    }

    this.gl.deleteSampler(sampler)
  }

  destroyAll(): void {
    for (const sampler of this.samplers) {
      this.destroy(sampler)
    }
  }
}
