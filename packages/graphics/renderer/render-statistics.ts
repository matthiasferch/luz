export class RenderStatistics {
  frameId: number = 0
  submittedPrimitiveCount: number = 0
  renderedPrimitiveCount: number = 0
  stateChanges = {
    cullModeChangeCount: 0,
    frontFaceChangeCount: 0,
    blendModeChangeCount: 0,
    depthTestChangeCount: 0,
    colorMaskChangeCount: 0,
    depthMaskChangeCount: 0
  }

  reset() {
    this.frameId += 1
    this.submittedPrimitiveCount = 0
    this.renderedPrimitiveCount = 0
    this.stateChanges.cullModeChangeCount = 0
    this.stateChanges.frontFaceChangeCount = 0
    this.stateChanges.blendModeChangeCount = 0
    this.stateChanges.depthTestChangeCount = 0
    this.stateChanges.colorMaskChangeCount = 0
    this.stateChanges.depthMaskChangeCount = 0
  }
}
