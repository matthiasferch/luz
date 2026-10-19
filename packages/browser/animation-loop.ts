export type AnimationCallback = (time: number, elapsedTime: number) => void

export class AnimationLoop {
  private animationFrame?: number
  private previousTime?: number
  private isActive = false

  constructor(private readonly render: AnimationCallback) {}

  get isRunning(): boolean {
    return this.isActive
  }

  start(): void {
    if (this.isActive) {
      return
    }

    this.isActive = true

    try {
      this.animationFrame = requestAnimationFrame(this.onFrame)
    } catch (error) {
      this.stop()
      throw error
    }
  }

  stop(): void {
    this.isActive = false
    this.previousTime = undefined

    if (this.animationFrame !== undefined) {
      cancelAnimationFrame(this.animationFrame)

      this.animationFrame = undefined
    }
  }

  private readonly onFrame = (timestamp: number): void => {
    this.animationFrame = undefined

    if (!this.isActive) {
      return
    }

    const time = timestamp / 1000
    const elapsedTime = this.previousTime === undefined ? 0 : time - this.previousTime

    this.previousTime = time

    try {
      this.render(time, elapsedTime)

      if (this.isActive && this.animationFrame === undefined) {
        this.animationFrame = requestAnimationFrame(this.onFrame)
      }
    } catch (error) {
      this.stop()
      throw error
    }
  }
}
