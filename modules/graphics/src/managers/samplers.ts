import { Sampler } from '../types/sampler'
import { Texture } from '../types/texture'

export class Samplers {

  private samplers: Sampler[] = []

  private boundSamplers: { [index: number]: Sampler } = {}

  constructor(private gl: WebGL2RenderingContext) {}

  create(): Sampler {
    let sampler = this.gl.createSampler() as Sampler

    this.update(sampler, Texture.Filtering.None, Texture.Tiling.None)

    this.samplers.push(sampler)

    return sampler
  }

  update(sampler: Sampler, filtering: Texture.Filtering, tiling: Texture.Tiling) {
    switch (filtering) {
      case Texture.Filtering.None:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)

        break

      case Texture.Filtering.Linear:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST)

        break

      case Texture.Filtering.Bilinear:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_NEAREST)

        break

      case Texture.Filtering.Trilinear:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR_MIPMAP_LINEAR)

        break
    }

    switch (tiling) {
      case Texture.Tiling.None:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

        break

      case Texture.Tiling.Both:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)

        break

      case Texture.Tiling.Horizontal:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

        break

      case Texture.Tiling.Vertical:
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.samplerParameteri(sampler, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)

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