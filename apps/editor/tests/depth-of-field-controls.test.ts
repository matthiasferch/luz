import { mount } from '@vue/test-utils'
import { NSelect } from 'naive-ui'
import { describe, expect, it, vi } from 'vitest'
import RenderSettingsPanel from '../src/editor/components/RenderSettingsPanel.vue'
import SettingSlider from '../src/editor/components/SettingSlider.vue'
import { createEditorStore, editorStoreKey } from '../src/editor/editor-store'
import { depthOfFieldPresets, getDepthOfFieldPreset } from '../src/editor/depth-of-field-presets'
import { normalizeSceneSettings } from '../src/settings'
import { makeRuntime } from './editor-fixture'

describe('depth-of-field controls', () => {
  it('applies presets through the runtime, enables overrides, and reflects manual adjustments', async () => {
    const store = createEditorStore()
    const setRenderingSetting = vi.fn((_section, _key, value) => value)

    store.attach(makeRuntime({ setRenderingSetting }))

    const wrapper = mount(RenderSettingsPanel, {
      global: {
        provide: { [editorStoreKey as symbol]: store },
        stubs: { teleport: true }
      }
    })

    await wrapper
      .findAll('.n-collapse-item__header-main')
      .find((header) => header.text().includes('Depth of field'))!
      .trigger('click')

    const select = wrapper
      .findAllComponents(NSelect)
      .find((component) => component.props('options')?.some((option) => option.value === 'foreground'))!
    const focusSlider = wrapper
      .findAllComponents(SettingSlider)
      .find((component) => component.props('label') === 'Focus distance')!

    try {
      expect(select.props('value')).toBe('camera')
      expect(focusSlider.props('isDisabled')).toBe(true)

      for (const preset of depthOfFieldPresets) {
        select.vm.$emit('update:value', preset.value)

        await wrapper.vm.$nextTick()
        expect(store.settings.value!.rendering.depthOfField).toEqual({
          ...preset.settings,
          isEnabled: true,
          isCameraOverridden: true
        })
        expect(select.props('value')).toBe(preset.value)
        expect(focusSlider.props('isDisabled')).toBe(false)

        const restoredSettings = normalizeSceneSettings(JSON.parse(JSON.stringify(store.settings.value)))

        expect(getDepthOfFieldPreset(restoredSettings.rendering.depthOfField)).toBe(preset.value)
      }

      focusSlider.vm.$emit('change', 2.47)

      await wrapper.vm.$nextTick()
      expect(setRenderingSetting).toHaveBeenCalledWith('depthOfField', 'focusDistance', 2.47)
      expect(select.props('value')).toBe('custom')
      expect(focusSlider.props('value')).toBe(2.47)
      expect(focusSlider.props('step')).toBe(0.01)
      expect(wrapper.find('input[type="number"]').exists()).toBe(false)
      select.vm.$emit('update:value', 'camera')

      await wrapper.vm.$nextTick()
      expect(select.props('value')).toBe('camera')
      expect(focusSlider.props('isDisabled')).toBe(true)
      expect(store.settings.value!.rendering.depthOfField.focusDistance).toBe(2.47)
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('recognizes restored presets without changing custom optics or out-of-range slider values', () => {
    const preset = depthOfFieldPresets.find((candidate) => candidate.value === 'foreground')!
    const settings = normalizeSceneSettings({
      rendering: { depthOfField: { ...preset.settings, isCameraOverridden: true, isEnabled: false } }
    }).rendering.depthOfField

    expect(getDepthOfFieldPreset(settings)).toBe('foreground')

    settings.focusDistance = 50
    settings.fStop = 16

    expect(getDepthOfFieldPreset(settings)).toBe('custom')
    expect(settings.focusDistance).toBe(50)
    expect(settings.fStop).toBe(16)
  })
})
