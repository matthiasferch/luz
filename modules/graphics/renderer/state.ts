import { RenderStats } from './stats'

export class State {
  private activeCullMode: State.CullMode = 'None'
  private activeBlendMode: State.BlendMode = 'None'
  private activeDepthTest: State.DepthTest = 'None'

  stats?: RenderStats

  constructor(private gl: WebGL2RenderingContext) { }

  set cullMode(cullMode: State.CullMode) {
    if (cullMode === this.activeCullMode) {
      return
    }

    if (cullMode === 'None') {
      this.gl.disable(this.gl.CULL_FACE)
    } else {
      this.gl.enable(this.gl.CULL_FACE)

      switch (cullMode) {
        case 'Front':
          this.gl.cullFace(this.gl.FRONT)
          break

        case 'Back':
          this.gl.cullFace(this.gl.BACK)
          break
      }
    }

    this.activeCullMode = cullMode
    if (this.stats) this.stats.stateChanges.cullMode += 1
  }

  set blendMode(blendMode: State.BlendMode) {
    if (blendMode === this.activeBlendMode) {
      return
    }

    if (blendMode === 'None') {
      this.gl.disable(this.gl.BLEND)
    } else {
      this.gl.enable(this.gl.BLEND)

      switch (blendMode) {
        case 'Additive':
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE)
          break

        case 'Transparent':
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
          break
      }
    }

    this.activeBlendMode = blendMode
    if (this.stats) this.stats.stateChanges.blendMode += 1
  }

  set depthTest(depthTest: State.DepthTest) {
    if (depthTest === this.activeDepthTest) {
      return
    }

    if (depthTest === 'None') {
      this.gl.disable(this.gl.DEPTH_TEST)
    } else {
      this.gl.enable(this.gl.DEPTH_TEST)

      switch (depthTest) {
        case 'Never':
          this.gl.depthFunc(this.gl.NEVER)
          break

        case 'Always':
          this.gl.depthFunc(this.gl.ALWAYS)
          break

        case 'Equal':
          this.gl.depthFunc(this.gl.EQUAL)
          break

        case 'NotEqual':
          this.gl.depthFunc(this.gl.NOTEQUAL)
          break

        case 'Less':
          this.gl.depthFunc(this.gl.LESS)
          break

        case 'LessEqual':
          this.gl.depthFunc(this.gl.LEQUAL)
          break

        case 'Greater':
          this.gl.depthFunc(this.gl.GREATER)
          break

        case 'GreaterEqual':
          this.gl.depthFunc(this.gl.GEQUAL)
          break
      }
    }

    this.activeDepthTest = depthTest
    if (this.stats) this.stats.stateChanges.depthTest += 1
  }
}

export namespace State {
  export type CullMode = 'None' | 'Front' | 'Back'

  export type BlendMode = 'None' | 'Additive' | 'Transparent'

  export type DepthTest =
    | 'None'
    | 'Never'
    | 'Always'
    | 'Equal'
    | 'NotEqual'
    | 'Less'
    | 'LessEqual'
    | 'Greater'
    | 'GreaterEqual'
}
