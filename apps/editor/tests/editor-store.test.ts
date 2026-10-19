import { describe, expect, it, vi } from 'vitest'
import { createEditorStore } from '../src/editor/editor-store'
import type { EditorApi } from '../src/editor/editor-api'
import { makeRuntime, makeTelemetry } from './editor-fixture'

describe('editor store', () => {
  it('executes one runtime command and reflects the validated value', () => {
    const setRenderingSetting = vi.fn(() => false) as unknown as EditorApi['setRenderingSetting']
    const store = createEditorStore()

    store.attach(makeRuntime({ setRenderingSetting }))
    store.setRendering('shadows', 'isEnabled', true)
    expect(setRenderingSetting).toHaveBeenCalledOnce()
    expect(setRenderingSetting).toHaveBeenCalledWith('shadows', 'isEnabled', true)
    expect(store.settings.value?.rendering.shadows.isEnabled).toBe(false)
    store.dispose()
  })
  it('changes the anti-aliasing method with one runtime command', () => {
    const setAntialiasingMode = vi.fn(() => 'fxaa' as const)
    const store = createEditorStore()

    store.attach(makeRuntime({ setAntialiasingMode }))
    store.setAntialiasingMode('taa')
    expect(setAntialiasingMode).toHaveBeenCalledOnce()
    expect(setAntialiasingMode).toHaveBeenCalledWith('taa')
    expect(store.antialiasingMode.value).toBe('fxaa')
    expect(store.settings.value?.rendering.antialiasing.method).toBe('fxaa')
    store.dispose()
  })
  it('restores the last selected anti-aliasing method after disabling the feature', () => {
    const setAntialiasingMode = vi.fn((mode) => mode)
    const store = createEditorStore()

    store.attach(makeRuntime({ setAntialiasingMode }))
    store.setAntialiasingMode('fxaa')
    store.setAntialiasingEnabled(false)
    store.setAntialiasingEnabled(true)
    expect(setAntialiasingMode.mock.calls.map(([mode]) => mode)).toEqual(['fxaa', 'off', 'fxaa'])
    expect(store.antialiasingMode.value).toBe('fxaa')
    store.dispose()
  })
  it('polls read-only telemetry every 250 ms', () => {
    vi.useFakeTimers()

    let framesPerSecond = 30

    const collectEditorTelemetry = vi.fn(() => makeTelemetry(framesPerSecond))
    const store = createEditorStore()

    store.attach(makeRuntime({ collectEditorTelemetry }))

    framesPerSecond = 72

    vi.advanceTimersByTime(250)
    expect(store.telemetry.value.framesPerSecond).toBe(72)
    expect(collectEditorTelemetry).toHaveBeenCalledTimes(2)
    store.dispose()
    vi.useRealTimers()
  })
})
