import { afterEach, describe, expect, it, vi } from 'vitest'
import { InputManager } from '../src/runtime/input-manager'

const activeManagers: InputManager[] = []

afterEach(() => {
  activeManagers.splice(0).forEach((manager) => manager.destroy())
})

const createTouchFixture = () => {
  document.body.innerHTML = '<canvas></canvas><div data-editor-interactive><button>Panel</button></div>'

  const canvas = document.querySelector('canvas')!
  const panel = document.querySelector('button')!
  const pointerIds = new Set<number>()
  const requestPointerLock = vi.fn()
  const releasePointerCapture = vi.fn((pointerId: number) => {
    pointerIds.delete(pointerId)
    canvas.dispatchEvent(new PointerEvent('lostpointercapture', { pointerId, pointerType: 'touch' }))
  })

  Object.assign(canvas, {
    requestPointerLock,
    setPointerCapture: (pointerId: number) => pointerIds.add(pointerId),

    hasPointerCapture: (pointerId: number) => pointerIds.has(pointerId),

    releasePointerCapture,
    getBoundingClientRect: () => new DOMRect(0, 0, 600, 800)
  })

  const manager = new InputManager(canvas)

  activeManagers.push(manager)

  const dispatchTouch = (type: string, pointerId: number, x: number, y: number, target: Element = canvas) => {
    const event = new PointerEvent(type, {
      pointerType: 'touch',
      pointerId,
      clientX: x,
      clientY: y,
      isPrimary: pointerId === 1,
      bubbles: true,
      cancelable: true
    })

    target.dispatchEvent(event)

    return event
  }

  return { canvas, panel, manager, dispatchTouch, requestPointerLock, releasePointerCapture }
}

describe('canvas touch input', () => {
  it('owns only canvas gestures, prevents compatibility mouse input, and captures both fingers', () => {
    const { canvas, panel, manager, dispatchTouch, requestPointerLock, releasePointerCapture } = createTouchFixture()

    expect(dispatchTouch('pointerdown', 1, 100, 100, panel).defaultPrevented).toBe(false)
    dispatchTouch('pointermove', 1, 200, 100)
    expect([...manager.captureNavigation().rotationDelta]).toEqual([0, 0])
    expect(dispatchTouch('pointerdown', 1, 100, 100).defaultPrevented).toBe(true)
    dispatchTouch('pointerdown', 2, 200, 100)
    canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))
    dispatchTouch('pointermove', 1, 80, 130)
    dispatchTouch('pointermove', 2, 280, 130)

    const navigation = manager.captureNavigation()

    expect([...navigation.panDelta]).toEqual([30, 30])
    expect(navigation.dollyDelta).toBeLessThan(0)
    expect(requestPointerLock).not.toHaveBeenCalled()
    expect(manager.buttons[0]).toBeUndefined()
    dispatchTouch('pointerup', 2, 280, 130)
    dispatchTouch('pointermove', 1, 90, 135)
    dispatchTouch('pointerup', 1, 90, 135)
    expect([...manager.captureNavigation().rotationDelta]).toEqual([10, 5])
    expect(releasePointerCapture).toHaveBeenCalledWith(1)
    expect(releasePointerCapture).toHaveBeenCalledWith(2)
  })
  it.each([
    'pointercancel',
    'lostpointercapture',
    'blur',
    'pagehide',
    'resize',
    'visibilitychange',
    'reset',
    'destroy'
  ])('discards interrupted movement on %s', (eventType) => {
    const { manager, dispatchTouch, releasePointerCapture } = createTouchFixture()

    dispatchTouch('pointerdown', 1, 100, 100)
    dispatchTouch('pointermove', 1, 200, 200)

    if (eventType === 'reset') {
      manager.resetNavigation()
    } else if (eventType === 'destroy') {
      manager.destroy()
    } else if (eventType === 'visibilitychange') {
      vi.spyOn(document, 'hidden', 'get').mockReturnValue(true)
      document.dispatchEvent(new Event(eventType))
    } else if (eventType === 'pointercancel' || eventType === 'lostpointercapture') {
      dispatchTouch(eventType, 1, 200, 200)
    } else {
      window.dispatchEvent(new Event(eventType))
    }

    dispatchTouch('pointermove', 1, 300, 300)
    expect([...manager.captureNavigation().rotationDelta]).toEqual([0, 0])
    expect(releasePointerCapture).toHaveBeenCalledWith(1)
  })
  it('retains mouse rotation, pan, and wheel input and consumes them once per frame', () => {
    const { canvas, manager, requestPointerLock } = createTouchFixture()

    canvas.dispatchEvent(new MouseEvent('mousedown', { button: 0 }))

    const movement = new MouseEvent('mousemove')

    Object.defineProperties(movement, { movementX: { value: 5 }, movementY: { value: 7 } })
    window.dispatchEvent(movement)
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 100 }))

    const navigation = manager.captureNavigation()

    expect([...navigation.rotationDelta]).toEqual([5, 7])
    expect(navigation.dollyDelta).toBe(100)
    expect(requestPointerLock).toHaveBeenCalledOnce()
    expect([...manager.captureNavigation().rotationDelta]).toEqual([0, 0])
    window.dispatchEvent(new MouseEvent('mouseup', { button: 0 }))
    canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))
    window.dispatchEvent(movement)
    expect([...manager.captureNavigation().panDelta]).toEqual([5, 7])
  })
})
describe('editor input isolation', () => {
  it('does not turn focused editor keystrokes into camera controls', () => {
    document.body.innerHTML = '<canvas></canvas><div data-editor-interactive><input /></div>'

    const canvas = document.querySelector('canvas')!
    const input = document.querySelector('input')!
    const requestPointerLock = vi.fn()

    Object.defineProperty(canvas, 'requestPointerLock', { value: requestPointerLock })

    const manager = new InputManager(canvas)

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'w', bubbles: true }))
    input.dispatchEvent(new MouseEvent('mousedown', { button: 0, bubbles: true }))
    expect(manager.keys.w).toBeUndefined()
    expect(requestPointerLock).not.toHaveBeenCalled()
    manager.destroy()
  })
  it('suppresses the browser context menu on the rendering canvas only', () => {
    document.body.innerHTML = '<canvas></canvas><div></div>'

    const canvas = document.querySelector('canvas')!
    const otherElement = document.querySelector('div')!

    const manager = new InputManager(canvas)

    const canvasEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })
    const otherEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true })

    canvas.dispatchEvent(canvasEvent)
    otherElement.dispatchEvent(otherEvent)
    expect(canvasEvent.defaultPrevented).toBe(true)
    expect(otherEvent.defaultPrevented).toBe(false)
    manager.destroy()
  })
  it('removes listeners and clears captured state when destroyed', () => {
    document.body.innerHTML = '<canvas></canvas>'

    const canvas = document.querySelector('canvas')!
    const manager = new InputManager(canvas)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }))
    canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 10 }))
    expect(manager.keys.w).toBe(true)
    expect(manager.buttons[2]).toBe(true)

    const movement = new MouseEvent('mousemove')

    Object.defineProperties(movement, { movementX: { value: 5 }, movementY: { value: 7 } })
    window.dispatchEvent(movement)
    expect(Array.from(manager.captureMouseDelta())).toEqual([5, 7])
    manager.destroy()
    manager.destroy()
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))
    canvas.dispatchEvent(new MouseEvent('mousedown', { button: 2 }))
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 20 }))

    const event = new MouseEvent('contextmenu', { cancelable: true })

    canvas.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(manager.keys).toEqual({})
    expect(manager.buttons).toEqual({})
    expect(manager.captureWheelDelta()).toBe(0)
    expect(Array.from(manager.captureMouseDelta())).toEqual([0, 0])
  })
})
