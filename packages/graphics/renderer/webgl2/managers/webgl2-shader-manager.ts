import type { ShaderManager } from '../../render-backend'
import type { Shader, ShaderStage } from '../../../types/shader'

export class WebGL2ShaderManager implements ShaderManager {
  private readonly shaders = new Set<Shader>()

  constructor(private gl: WebGL2RenderingContext) {}

  create(stage: ShaderStage, source: string, headers?: string[]): Shader | null {
    let type: number

    switch (stage) {
      case 'vertex':
        type = this.gl.VERTEX_SHADER
        break

      case 'fragment':
        type = this.gl.FRAGMENT_SHADER
        break
    }

    if (headers && headers.length > 0) {
      headers
        .slice()
        .reverse()
        .forEach((header) => {
          source = `${header}\n${source}`
        })
    }

    const shader = this.gl.createShader(type) as Shader | null

    if (!shader) {
      return null
    }

    this.shaders.add(shader)

    try {
      this.gl.shaderSource(shader, source)
      this.gl.compileShader(shader)

      shader.isCompiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)

      if (!shader.isCompiled || !this.gl.isShader(shader)) {
        source.split('\n').forEach((line, index) => {
          console.log(`${index + 1}\t${line}`)
        })
        console.error(this.gl.getShaderInfoLog(shader))
        this.destroy(shader)

        return null
      }

      return shader
    } catch (error) {
      this.destroy(shader)
      throw error
    }
  }

  destroy(shader: Shader): void {
    if (!this.shaders.delete(shader)) {
      return
    }

    this.gl.deleteShader(shader)
  }

  destroyAll(): void {
    for (const shader of this.shaders) {
      this.destroy(shader)
    }
  }
}
