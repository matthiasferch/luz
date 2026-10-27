import { Vector2 } from '@luz/math'
import { TouchNavigation } from './touch-navigation'
import type { NavigationDelta } from './touch-navigation'

export class InputManager {
  readonly keys: Record<string, boolean> = {}
  readonly buttons: Record<number, boolean> = {}

  private readonly listeners = new AbortController()
  private readonly touchNavigation = new TouchNavigation()

  private mouseDelta = new Vector2()
  private lastMouseDelta = new Vector2()
  private wheelDelta = 0
  private ownsPointerLock = false

  constructor(private canvas: HTMLCanvasElement) {
    const options = { signal: this.listeners.signal }

    window.addEventListener(
      'keydown',
      (event) => {
        if (InputManager.isEditorTarget(event.target)) {
          return
        }

        this.keys[event.key] = true
      },
      options
    )
    window.addEventListener(
      'keyup',
      (event) => {
        this.keys[event.key] = false
      },
      options
    )
    window.addEventListener(
      'mouseup',
      (event) => {
        this.buttons[event.button] = false

        if (!Object.values(this.buttons).some(Boolean) && document.pointerLockElement === this.canvas) {
          document.exitPointerLock?.()
        }
      },
      options
    )
    window.addEventListener(
      'mouseleave',
      () => {
        for (const button in this.buttons) {
          this.buttons[button] = false
        }
      },
      options
    )
    window.addEventListener(
      'mousemove',
      (event) => {
        this.mouseDelta.x += event.movementX
        this.mouseDelta.y += event.movementY
      },
      options
    )
    this.canvas.addEventListener(
      'mousedown',
      (event) => {
        if (this.touchNavigation.hasPointers()) {
          return
        }

        this.buttons[event.button] = true

        if (event.button === 0 && document.pointerLockElement !== this.canvas) {
          const pointerLockRequest = this.canvas.requestPointerLock?.()

          pointerLockRequest
            ?.then(() => {
              if (this.listeners.signal.aborted && document.pointerLockElement === this.canvas) {
                document.exitPointerLock?.()
              }
            })
            .catch(() => {
              // Pointer lock can be denied by the browser; edge-limited dragging remains available as a fallback.
            })
        }
      },
      options
    )
    document.addEventListener(
      'pointerlockchange',
      () => {
        const ownsPointerLock = document.pointerLockElement === this.canvas

        if (this.ownsPointerLock && !ownsPointerLock) {
          for (const button in this.buttons) {
            this.buttons[button] = false
          }
        }

        this.ownsPointerLock = ownsPointerLock
      },
      options
    )
    this.canvas.addEventListener(
      'wheel',
      (event) => {
        this.wheelDelta += event.deltaY
      },
      options
    )
    this.canvas.addEventListener(
      'contextmenu',
      (event) => {
        event.preventDefault()
      },
      options
    )
    this.canvas.addEventListener('pointerdown', this.onTouchStart, { ...options, passive: false })
    this.canvas.addEventListener('pointermove', this.onTouchMove, options)
    this.canvas.addEventListener('pointerup', this.onTouchEnd, options)
    this.canvas.addEventListener('pointercancel', this.onTouchCancel, options)
    this.canvas.addEventListener('lostpointercapture', this.onTouchCancel, options)
    window.addEventListener('blur', this.onBlur, options)
    window.addEventListener('pagehide', this.onBlur, options)
    window.addEventListener('resize', this.onResize, options)
    document.addEventListener('visibilitychange', this.onVisibilityChange, options)
  }

  private onTouchStart = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') {
      return
    }

    event.preventDefault()

    if (document.pointerLockElement) {
      this.resetNavigation()

      return
    }

    if (!this.touchNavigation.hasPointers()) {
      this.resetNavigation()
    }

    this.touchNavigation.start(event.pointerId, event.clientX, event.clientY)
    this.canvas.setPointerCapture(event.pointerId)
  }
  private onTouchMove = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') {
      return
    }

    const rectangle = this.canvas.getBoundingClientRect()

    this.touchNavigation.move(event.pointerId, event.clientX, event.clientY, rectangle.width, rectangle.height)
  }
  private onTouchEnd = (event: PointerEvent): void => {
    if (event.pointerType !== 'touch') {
      return
    }

    this.touchNavigation.end(event.pointerId)

    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId)
    }
  }
  private onTouchCancel = (event: PointerEvent): void => {
    if (this.touchNavigation.getPointerIds().includes(event.pointerId)) {
      this.resetNavigation()
    }
  }
  private onResize = (): void => this.resetNavigation()
  private onBlur = (): void => {
    this.resetNavigation()

    for (const key of Object.keys(this.keys)) {
      delete this.keys[key]
    }
  }
  private onVisibilityChange = (): void => {
    if (document.hidden) {
      this.onBlur()
    }
  }

  resetNavigation(): void {
    const pointerIds = this.touchNavigation.getPointerIds()

    this.touchNavigation.reset()

    for (const pointerId of pointerIds) {
      if (this.canvas.hasPointerCapture(pointerId)) {
        this.canvas.releasePointerCapture(pointerId)
      }
    }

    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock?.()
    }

    for (const button of Object.keys(this.buttons)) {
      delete this.buttons[Number(button)]
    }

    this.mouseDelta.fill(0)
    this.lastMouseDelta.fill(0)

    this.wheelDelta = 0
    this.ownsPointerLock = false
  }

  destroy(): void {
    this.listeners.abort()
    this.onBlur()
  }

  captureNavigation(): NavigationDelta {
    const navigation = this.touchNavigation.capture()
    const mouseDelta = this.captureMouseDelta()

    if (!this.touchNavigation.hasPointers()) {
      if (this.buttons[0]) {
        navigation.rotationDelta.add(mouseDelta)
      } else if (this.buttons[1] || this.buttons[2]) {
        navigation.panDelta.add(mouseDelta)
      }
    }

    navigation.dollyDelta += this.captureWheelDelta()

    return navigation
  }

  private static isEditorTarget(target: EventTarget | null): boolean {
    if (!(target instanceof Element)) {
      return false
    }

    return Boolean(
      target.closest('[data-editor-interactive], input, select, textarea, button, [contenteditable="true"]')
    )
  }

  captureMouseDelta(): Vector2 {
    this.mouseDelta.copyTo(this.lastMouseDelta)

    this.mouseDelta.x = 0
    this.mouseDelta.y = 0

    return this.lastMouseDelta
  }

  captureWheelDelta(): number {
    const delta = this.wheelDelta

    this.wheelDelta = 0

    return delta
  }
}
