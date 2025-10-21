import { SamplerManager } from '../renderer/renderer'
import { Sampler } from '../types/sampler'
import { Texture } from '../types/texture'

export class WebGLSamplerManager implements SamplerManager {
  private samplers: Sampler[] = []

  private boundSamplers: { [index: number]: Sampler } = {}

  constructor(private gl: WebGL2RenderingContext) { }

  create(filtering: Texture.Filtering = 'None', tiling: Texture.Tiling = 'None'): Sampler {
    let sampler = this.gl.createSampler() as Sampler

    this.update(sampler, filtering, tiling)

    this.samplers.push(sampler)

    return sampler
  }

  update(sampler: Sampler, filtering: Texture.Filtering, tiling: Texture.Tiling) {
    switch (filtering) {
      case 'None':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)

        break

      case 'Linear':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST)

        break

      case 'Bilinear':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST)

        break

      case 'Trilinear':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR)

        break
    }

    switch (tiling) {
      case 'Repeat':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)

        break

      case 'Mirror':
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.MIRRORED_REPEAT)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.MIRRORED_REPEAT)

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

    this.gl.bindSampler(this.gl.TEXTURE0 + unit, sampler)

    this.boundSamplers[unit] = sampler
  }
}
