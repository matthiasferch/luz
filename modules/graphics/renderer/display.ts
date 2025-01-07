import { vec4 } from '@luz/vectors'

export class Display {

  constructor(private gl: WebGL2RenderingContext) {}

  set viewport(viewport: vec4) {
    const [x, y, z, w] = viewport
    this.gl.viewport(x, y, z, w)
  }

  clear(color: vec4, depth: number, stencil?: number) {
    let clearMask = 0

    if (color != null) {
      this.gl.clearColor(color.x, color.y, color.z, color.w)

      clearMask |= this.gl.COLOR_BUFFER_BIT
    }

    if (depth != null) {
      this.gl.clearDepth(depth)

      clearMask |= this.gl.DEPTH_BUFFER_BIT
    }

    if (stencil != null) {
      this.gl.clearStencil(stencil)

      clearMask |= this.gl.STENCIL_BUFFER_BIT
    }

    this.gl.clear(clearMask)
  }

}
