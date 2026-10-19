import type { TextureCompiler } from '../texture-compiler'
import type { Texture } from '../../types/texture'
import type { UniformValue } from '../../types/uniform'
import type { GraphSource } from './generate-source'

export interface GraphBindings {
  uniforms: Record<string, UniformValue>
  textures: Texture[]
}

export async function compileGraphBindings(source: GraphSource, compiler: TextureCompiler): Promise<GraphBindings> {
  const uniforms: Record<string, UniformValue> = Object.assign(Object.create(null), source.uniforms)
  const textures: Texture[] = []
  const results = await Promise.allSettled(
    Object.entries(source.textures).map(async ([name, surface]) => {
      const texture = await compiler.compile(surface, surface.colorSpace ?? 'linear')

      textures.push(texture)

      uniforms[name] = texture
    })
  )
  const failure = results.find((result) => result.status === 'rejected')

  if (failure?.status === 'rejected') {
    for (const texture of textures) {
      compiler.release(texture)
    }

    throw failure.reason
  }

  return { uniforms, textures }
}
