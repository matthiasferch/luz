export class State {
  private activeCullMode: State.CullMode = 'none'
  private activeBlendMode: State.BlendMode = 'none'
  private activeDepthTest: State.DepthTest = 'none'

  constructor(private gl: WebGL2RenderingContext) {}

  set cullMode(cullMode: State.CullMode) {
    if (cullMode === this.activeCullMode) {
      return
    }

    if (cullMode === 'none') {
      this.gl.disable(this.gl.CULL_FACE)
    } else {
      this.gl.enable(this.gl.CULL_FACE)

      switch (cullMode) {
        case 'front':
          this.gl.cullFace(this.gl.FRONT)
          break

        case 'back':
          this.gl.cullFace(this.gl.BACK)
          break
      }
    }

    this.activeCullMode = cullMode
  }

  set blendMode(blendMode: State.BlendMode) {
    if (blendMode === this.activeBlendMode) {
      return
    }

    if (blendMode === 'none') {
      this.gl.disable(this.gl.BLEND)
    } else {
      this.gl.enable(this.gl.BLEND)

      switch (blendMode) {
        case 'additive':
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE)
          break

        case 'transparent':
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
          break
      }
    }

    this.activeBlendMode = blendMode
  }

  set depthTest(depthTest: State.DepthTest) {
    if (depthTest === this.activeDepthTest) {
      return
    }

    if (depthTest === 'none') {
      this.gl.disable(this.gl.DEPTH_TEST)
    } else {
      this.gl.enable(this.gl.DEPTH_TEST)

      switch (depthTest) {
        case 'never':
          this.gl.depthFunc(this.gl.NEVER)
          break

        case 'always':
          this.gl.depthFunc(this.gl.ALWAYS)
          break

        case 'equal':
          this.gl.depthFunc(this.gl.EQUAL)
          break

        case 'notEqual':
          this.gl.depthFunc(this.gl.NOTEQUAL)
          break

        case 'less':
          this.gl.depthFunc(this.gl.LESS)
          break

        case 'lessEqual':
          this.gl.depthFunc(this.gl.LEQUAL)
          break

        case 'greater':
          this.gl.depthFunc(this.gl.GREATER)
          break

        case 'greaterEqual':
          this.gl.depthFunc(this.gl.GEQUAL)
          break
      }
    }

    this.activeDepthTest = depthTest
  }
}

export namespace State {
  export type CullMode = 'none' | 'front' | 'back'

  export type BlendMode = 'none' | 'additive' | 'transparent'

  export type DepthTest =
    | 'none'
    | 'never'
    | 'always'
    | 'equal'
    | 'notEqual'
    | 'less'
    | 'lessEqual'
    | 'greater'
    | 'greaterEqual'
}
