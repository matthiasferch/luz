import type { Scene } from '@luz/scene'
import { Vector3 } from '@luz/math'

import type { SceneSettings } from '../settings'

export class SimulationController {
  private timeScaleValue: number
  private isRunningValue = false

  private readonly importedGravity = new Vector3([0, -9.81, 0])

  constructor(private readonly settings: SceneSettings['simulation']) {
    this.timeScaleValue = Math.max(0, Math.min(1, settings.timeScale))
    settings.timeScale = this.timeScaleValue
  }

  get timeScale(): number {
    return this.timeScaleValue
  }

  get isRunning(): boolean {
    return this.isRunningValue
  }

  setTimeScale(value: number): number {
    if (!Number.isFinite(value)) {
      return this.timeScaleValue
    }

    this.timeScaleValue = Math.max(0, Math.min(1, value))
    this.settings.timeScale = this.timeScaleValue

    return this.timeScaleValue
  }

  setRunning(isRunning: boolean): boolean {
    this.isRunningValue = isRunning

    return this.isRunningValue
  }

  applyImportedState(scene: Scene): void {
    scene.gravity.copyTo(this.importedGravity)

    if (this.settings.gravity !== null) {
      scene.gravity.y = this.settings.gravity
    }
  }

  reset(scene: Scene): void {
    this.isRunningValue = false
    this.timeScaleValue = 1
    this.settings.timeScale = this.timeScaleValue
    this.settings.gravity = null

    scene.gravity.set(this.importedGravity)
    scene.resetSimulation()
  }
}
