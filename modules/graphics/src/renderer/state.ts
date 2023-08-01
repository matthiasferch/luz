export class State {

  #cullMode = State.CullMode.None
  #blendMode = State.BlendMode.None
  #depthTest = State.DepthTest.None

  constructor(private gl: WebGL2RenderingContext) {}

  set cullMode(cullMode: State.CullMode) {
    if (cullMode === this.#cullMode) {
      return
    }

    if (cullMode === State.CullMode.None) {
      this.gl.disable(this.gl.CULL_FACE)
    } else {
      this.gl.enable(this.gl.CULL_FACE)

      switch (cullMode) {
        case State.CullMode.Front:
          this.gl.cullFace(this.gl.FRONT)
          break

        case State.CullMode.Back:
          this.gl.cullFace(this.gl.BACK)
          break
      }
    }

    this.#cullMode = cullMode
  }

  set blendMode(blendMode: State.BlendMode) {
    if (blendMode === this.#blendMode) {
      return
    }

    if (blendMode === State.BlendMode.None) {
      this.gl.disable(this.gl.BLEND)
    } else {
      this.gl.enable(this.gl.BLEND)

      switch (blendMode) {
        case State.BlendMode.Additive:
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE)
          break

        case State.BlendMode.Transparent:
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
          break
      }
    }

    this.#blendMode = blendMode
  }

  set depthTest(depthTest: State.DepthTest) {
    if (depthTest === this.#depthTest) {
      return
    }

    if (depthTest === State.DepthTest.None) {
      this.gl.disable(this.gl.DEPTH_TEST)
    } else {
      this.gl.enable(this.gl.DEPTH_TEST)

      switch (depthTest) {
        case State.DepthTest.Never:
          this.gl.depthFunc(this.gl.NEVER)
          break

        case State.DepthTest.Always:
          this.gl.depthFunc(this.gl.ALWAYS)
          break

        case State.DepthTest.Equal:
          this.gl.depthFunc(this.gl.EQUAL)
          break

        case State.DepthTest.NotEqual:
          this.gl.depthFunc(this.gl.NOTEQUAL)
          break

        case State.DepthTest.Less:
          this.gl.depthFunc(this.gl.LESS)
          break

        case State.DepthTest.LessEqual:
          this.gl.depthFunc(this.gl.LEQUAL)
          break

        case State.DepthTest.Greater:
          this.gl.depthFunc(this.gl.GREATER)
          break

        case State.DepthTest.GreaterEqual:
          this.gl.depthFunc(this.gl.GEQUAL)
          break
      }
    }

    this.#depthTest = depthTest
  }

}

export declare module State {
  export enum CullMode {
    None,
  
    Front,
    Back
  }

  export enum BlendMode {
    None,
  
    Additive,
    Transparent
  }

  export enum DepthTest {
    None,
  
    Never,
    Always,
  
    Equal,
    NotEqual,
  
    Less,
    LessEqual,
  
    Greater,
    GreaterEqual
  }
}
