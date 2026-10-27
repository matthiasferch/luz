import { Vector2 } from '@luz/math'

export interface NavigationDelta {
  rotationDelta: Vector2
  panDelta: Vector2
  dollyDelta: number
}

const REFERENCE_SIZE = 600
const PINCH_SCALE = 2000
const MINIMUM_DISTANCE = 8

export class TouchNavigation {
  private readonly pointers = new Map<number, Vector2>()
  private readonly pendingDelta: NavigationDelta = {
    rotationDelta: new Vector2(),
    panDelta: new Vector2(),
    dollyDelta: 0
  }
  private readonly capturedDelta: NavigationDelta = {
    rotationDelta: new Vector2(),
    panDelta: new Vector2(),
    dollyDelta: 0
  }

  getPointerIds(): number[] {
    return [...this.pointers.keys()]
  }

  hasPointers(): boolean {
    return this.pointers.size > 0
  }

  start(pointerId: number, x: number, y: number): void {
    this.pointers.set(pointerId, new Vector2([x, y]))

    if (this.pointers.size > 2) {
      this.capture()
    }
  }

  move(pointerId: number, x: number, y: number, width: number, height: number): void {
    const pointer = this.pointers.get(pointerId)

    if (!pointer) {
      return
    }

    const scale = REFERENCE_SIZE / Math.max(1, Math.min(width, height))
    const deltaX = x - pointer.x
    const deltaY = y - pointer.y

    if (this.pointers.size === 1) {
      this.pendingDelta.rotationDelta.x += deltaX * scale
      this.pendingDelta.rotationDelta.y += deltaY * scale
    } else if (this.pointers.size === 2) {
      const [firstPointer, secondPointer] = this.pointers.values()
      const previousDistance = Math.hypot(firstPointer.x - secondPointer.x, firstPointer.y - secondPointer.y)

      pointer.set([x, y])

      const distance = Math.hypot(firstPointer.x - secondPointer.x, firstPointer.y - secondPointer.y)

      this.pendingDelta.panDelta.x += (deltaX * scale) / 2
      this.pendingDelta.panDelta.y += (deltaY * scale) / 2

      if (previousDistance >= MINIMUM_DISTANCE && distance >= MINIMUM_DISTANCE) {
        this.pendingDelta.dollyDelta -= Math.log(distance / previousDistance) * PINCH_SCALE
      }
    }

    pointer.set([x, y])
  }

  end(pointerId: number): void {
    this.pointers.delete(pointerId)
  }

  capture(): NavigationDelta {
    this.pendingDelta.rotationDelta.copyTo(this.capturedDelta.rotationDelta)
    this.pendingDelta.panDelta.copyTo(this.capturedDelta.panDelta)

    this.capturedDelta.dollyDelta = this.pendingDelta.dollyDelta

    this.pendingDelta.rotationDelta.reset()
    this.pendingDelta.panDelta.reset()

    this.pendingDelta.dollyDelta = 0

    return this.capturedDelta
  }

  reset(): void {
    this.pointers.clear()
    this.pendingDelta.rotationDelta.reset()
    this.pendingDelta.panDelta.reset()

    this.pendingDelta.dollyDelta = 0

    this.capture()
  }
}
