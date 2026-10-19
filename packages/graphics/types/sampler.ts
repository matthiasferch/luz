import type { TextureTiling, TextureFiltering } from '@luz/formats'

export type Sampler = WebGLSampler & {
  filtering: TextureFiltering
  tiling: TextureTiling
}
