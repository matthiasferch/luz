import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import FloatingPanel from '../src/editor/components/FloatingPanel.vue'
import { createDefaultPanelLayout } from '../src/editor/panel-layout'

enableAutoUnmount(afterEach)

const createPanel = () => {
  const wrapper = mount(FloatingPanel, {
    props: { id: 'entities', title: 'Entities', panel: createDefaultPanelLayout(1200, 800).entities }
  })

  vi.spyOn(wrapper.element, 'getBoundingClientRect').mockReturnValue(new DOMRect(10, 58, 340, 220))

  return wrapper
}

const capturePointers = (element: Element) => {
  const pointerIds = new Set<number>()
  const setPointerCapture = vi.fn((pointerId: number) => pointerIds.add(pointerId))
  const hasPointerCapture = (pointerId: number) => pointerIds.has(pointerId)
  const releasePointerCapture = vi.fn((pointerId: number) => pointerIds.delete(pointerId))

  Object.assign(element, { setPointerCapture, hasPointerCapture, releasePointerCapture })

  return { setPointerCapture, releasePointerCapture }
}

const dispatchPointerEvent = (element: Element, type: string, options: PointerEventInit = {}) => {
  const event = new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    pointerType: 'touch',
    pointerId: 1,
    isPrimary: true,
    button: 0,
    clientX: 40,
    clientY: 80,
    ...options
  })

  element.dispatchEvent(event)

  return event
}

describe('floating panel gestures', () => {
  it.each(['touch', 'mouse', 'pen'])('drags with a primary %s pointer and releases capture', (pointerType) => {
    const wrapper = createPanel()
    const header = wrapper.get('.panel-header').element
    const capture = capturePointers(header)
    const startEvent = dispatchPointerEvent(header, 'pointerdown', { pointerType })

    dispatchPointerEvent(header, 'pointermove', { pointerType, clientX: 70, clientY: 180 })
    expect(startEvent.defaultPrevented).toBe(true)
    expect(capture.setPointerCapture).toHaveBeenCalledWith(1)
    expect(wrapper.emitted('move')).toEqual([['entities', 40, 158, 220]])
    dispatchPointerEvent(header, 'pointerup', { pointerType })
    dispatchPointerEvent(header, 'pointermove', { pointerType, clientX: 90 })
    expect(capture.releasePointerCapture).toHaveBeenCalledWith(1)
    expect(wrapper.emitted('move')).toHaveLength(1)
  })
  it('keeps a second finger and a competing resize from replacing the active drag', () => {
    const wrapper = createPanel()
    const header = wrapper.get('.panel-header').element
    const handle = wrapper.get('.panel-resize-handle.corner').element
    const capture = capturePointers(header)
    const resizeCapture = capturePointers(handle)

    dispatchPointerEvent(header, 'pointerdown')
    dispatchPointerEvent(header, 'pointerdown', { pointerId: 2, isPrimary: false, clientX: 100 })
    dispatchPointerEvent(handle, 'pointerdown', { pointerId: 3, pointerType: 'pen' })
    dispatchPointerEvent(header, 'pointermove', { pointerId: 2, clientX: 200 })
    dispatchPointerEvent(header, 'pointerup', { pointerId: 2 })
    dispatchPointerEvent(header, 'pointermove', { clientX: 60 })
    expect(capture.setPointerCapture).toHaveBeenCalledTimes(1)
    expect(resizeCapture.setPointerCapture).not.toHaveBeenCalled()
    expect(wrapper.emitted('move')).toEqual([['entities', 30, 58, 220]])
  })
  it.each(['pointercancel', 'lostpointercapture'])('ends dragging after %s and allows another gesture', (eventType) => {
    const wrapper = createPanel()
    const header = wrapper.get('.panel-header').element

    capturePointers(header)
    dispatchPointerEvent(header, 'pointerdown')
    dispatchPointerEvent(header, eventType)
    dispatchPointerEvent(header, 'pointermove', { clientX: 80 })
    expect(wrapper.emitted('move')).toBeUndefined()
    dispatchPointerEvent(header, 'pointerdown', { pointerId: 2 })
    dispatchPointerEvent(header, 'pointermove', { pointerId: 2, clientY: 100 })
    expect(wrapper.emitted('move')).toEqual([['entities', 10, 78, 220]])
  })
  it('does not drag from header buttons, secondary pointers, or secondary mouse buttons', async () => {
    const wrapper = createPanel()
    const header = wrapper.get('.panel-header').element
    const capture = capturePointers(header)
    const collapseButton = wrapper.get('button[aria-label="Collapse Entities"]')
    const closeButton = wrapper.get('button[aria-label="Hide Entities"]')

    dispatchPointerEvent(collapseButton.element, 'pointerdown')
    dispatchPointerEvent(closeButton.element, 'pointerdown')
    dispatchPointerEvent(header, 'pointerdown', { isPrimary: false })
    dispatchPointerEvent(header, 'pointerdown', { pointerType: 'mouse', button: 2 })
    dispatchPointerEvent(header, 'pointermove', { clientX: 80 })
    expect(capture.setPointerCapture).not.toHaveBeenCalled()
    expect(wrapper.emitted('move')).toBeUndefined()

    await collapseButton.trigger('click')

    await closeButton.trigger('click')
    expect(wrapper.emitted('collapse')).toEqual([['entities']])
    expect(wrapper.emitted('close')).toEqual([['entities']])
  })
  it.each(['pointerup', 'pointercancel', 'lostpointercapture'])('ends a touch resize after %s', (eventType) => {
    const wrapper = createPanel()
    const handle = wrapper.get('.panel-resize-handle.corner').element
    const header = wrapper.get('.panel-header').element
    const capture = capturePointers(handle)
    const dragCapture = capturePointers(header)

    dispatchPointerEvent(handle, 'pointerdown')
    dispatchPointerEvent(handle, 'pointerdown', { pointerId: 2, isPrimary: false })
    dispatchPointerEvent(header, 'pointerdown', { pointerId: 3, pointerType: 'pen' })
    dispatchPointerEvent(handle, 'pointermove', { clientX: 70, clientY: 130 })
    expect(wrapper.emitted('resize')).toEqual([['entities', 370, 270, true]])
    expect(dragCapture.setPointerCapture).not.toHaveBeenCalled()
    expect(capture.setPointerCapture).toHaveBeenCalledTimes(1)
    dispatchPointerEvent(handle, eventType)
    dispatchPointerEvent(handle, 'pointermove', { clientX: 90 })
    expect(wrapper.emitted('resize')).toHaveLength(1)
    expect(capture.releasePointerCapture).toHaveBeenCalledWith(1)
  })
  it('releases pointer capture when an active panel is removed', () => {
    const wrapper = createPanel()
    const header = wrapper.get('.panel-header').element
    const capture = capturePointers(header)

    dispatchPointerEvent(header, 'pointerdown')
    wrapper.unmount()
    expect(capture.releasePointerCapture).toHaveBeenCalledWith(1)
  })
})
