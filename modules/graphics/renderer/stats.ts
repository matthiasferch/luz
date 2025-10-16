export class RenderStats {
  frame: number = 0
  submissions: number = 0
  draws: number = 0
  pipelineBinds: number = 0
  stateChanges = {
    cullMode: 0,
    blendMode: 0,
    depthTest: 0,
    maskColor: 0,
    maskDepth: 0
  }

  reset() {
    this.frame += 1
    this.submissions = 0
    this.draws = 0
    this.pipelineBinds = 0
    this.stateChanges.cullMode = 0
    this.stateChanges.blendMode = 0
    this.stateChanges.depthTest = 0
    this.stateChanges.maskColor = 0
    this.stateChanges.maskDepth = 0
  }
}

