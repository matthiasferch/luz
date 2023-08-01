import { Texture } from './texture'

export type Sampler = WebGLSampler & {
  filtering: Texture.Filtering
  tiling: Texture.Tiling
}