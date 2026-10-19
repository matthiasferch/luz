import { Vector2 } from '@luz/math'

export class InputManager {
  readonly keys: Record<string, boolean> = {}
  readonly buttons: Record<number, boolean> = {}

  private readonly listeners = new AbortController()

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
  }

  destroy(): void {
    this.listeners.abort()

    if (document.pointerLockElement === this.canvas) {
      document.exitPointerLock?.()
    }

    for (const key of Object.keys(this.keys)) {
      delete this.keys[key]
    }

    for (const button of Object.keys(this.buttons)) {
      delete this.buttons[Number(button)]
    }

    this.mouseDelta.fill(0)
    this.lastMouseDelta.fill(0)

    this.wheelDelta = 0
    this.ownsPointerLock = false
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
