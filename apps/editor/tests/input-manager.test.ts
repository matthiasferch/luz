import { describe, expect, it, vi } from 'vitest'
import { InputManager } from '../src/runtime/input-manager'

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
