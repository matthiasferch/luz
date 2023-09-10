import { Shader } from '../types/shader'

export class Shaders {

  private shaders: Shader[] = []

  constructor(private gl: WebGL2RenderingContext) { }

  create(stage: Shader.Stage, source: string, headers?: string[]): Shader | null {
    let type: number

    switch (stage) {
      case Shader.Stage.VertexShader:
        type = this.gl.VERTEX_SHADER
        break

      case Shader.Stage.FragmentShader:
        type = this.gl.FRAGMENT_SHADER
        break
    }

    if (headers?.length > 0) {
      headers.reverse().forEach((header) => {
        source = `${header}\n\n${source}`
      })
    }

    let shader = this.gl.createShader(type) as Shader

    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    shader.compiled = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)

    if (!shader.compiled || !this.gl.isShader(shader)) {
      // tslint:disable-next-line: no-console
      console.error(this.gl.getShaderInfoLog(shader))

      this.gl.deleteShader(shader)

      return null
    }

    this.shaders.push(shader)

    return shader
  }

}