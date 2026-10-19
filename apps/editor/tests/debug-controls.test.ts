import { mount } from '@vue/test-utils'
import { NSelect } from 'naive-ui'
import { describe, expect, it, vi } from 'vitest'
import DebugPanel from '../src/editor/components/DebugPanel.vue'
import SettingSlider from '../src/editor/components/SettingSlider.vue'
import SettingCheckbox from '../src/editor/components/SettingCheckbox.vue'
import { createEditorStore, editorStoreKey } from '../src/editor/editor-store'
import { OVERLAY_STYLES } from '../src/rendering/overlay-style'
import { Editor } from '../src/runtime/editor-runtime'
import { normalizeSceneSettings, type OverlayDepthMode } from '../src/settings'
import { makeRuntime } from './editor-fixture'
import { debugOverlayCheckboxes } from '../src/editor/control-catalog'

describe('Geometry debug controls', () => {
  it('applies each depth selection through the real runtime setter and persists the accepted value', async () => {
    const settings = normalizeSceneSettings({})
    const persistSettings = vi.fn(() => JSON.stringify(settings))
    const runtime = Object.create(Editor.prototype) as Editor

    Object.assign(runtime, {
      renderingSettings: settings.rendering,
      invalidateTemporalHistory: vi.fn(),
      persistSettings
    })

    const store = createEditorStore()

    store.attach(makeRuntime({ setRenderingSetting: runtime.setRenderingSetting.bind(runtime) }))

    const wrapper = mount(DebugPanel, {
      global: { provide: { [editorStoreKey as symbol]: store }, stubs: { teleport: true } }
    })
    const select = wrapper.findComponent(NSelect)

    for (const mode of ['visible', 'always', 'occluded'] as const) {
      select.vm.$emit('update:value', mode)

      await wrapper.vm.$nextTick()
      expect(settings.rendering.debug.overlayDepthMode).toBe(mode)
      expect(select.props('value')).toBe(mode)

      const persistedSettings = JSON.parse(persistSettings.mock.results.at(-1)!.value)

      expect(normalizeSceneSettings(persistedSettings).rendering.debug.overlayDepthMode).toBe(mode)
    }

    expect(persistSettings).toHaveBeenCalledTimes(3)
    expect(runtime.setRenderingSetting('debug', 'overlayDepthMode', 'invalid' as OverlayDepthMode)).toBe('occluded')
    expect(runtime.setRenderingSetting('debug', 'overlayLineWidth', 99)).toBe(5)
    expect(runtime.setRenderingSetting('debug', 'overlayOpacity', 0)).toBe(0.1)
    store.setRendering('debug', 'areModelBoundingBoxesVisible', true)

    const master = wrapper.findAllComponents(SettingCheckbox)[0]

    expect(master.props('label')).toBe('Enable overlay')
    master.vm.$emit('change', false)

    await wrapper.vm.$nextTick()
    expect(settings.rendering.debug.areGeometryOverlaysVisible).toBe(false)
    expect(settings.rendering.debug.areModelBoundingBoxesVisible).toBe(true)
    expect(settings.rendering.debug.areOverlaysVisible).toBe(true)
    expect(select.props('disabled')).toBe(true)
    expect(
      wrapper
        .findAllComponents(SettingCheckbox)
        .slice(1)
        .every((checkbox) => checkbox.props('isDisabled'))
    ).toBe(true)
    expect(wrapper.findAllComponents(SettingSlider).every((slider) => slider.props('isDisabled'))).toBe(true)
    expect(wrapper.findAllComponents(NSelect)[1].props('disabled')).toBeFalsy()
    expect(
      normalizeSceneSettings(JSON.parse(persistSettings.mock.results.at(-1)!.value)).rendering.debug
        .areGeometryOverlaysVisible
    ).toBe(false)
    master.vm.$emit('change', true)

    await wrapper.vm.$nextTick()
    expect(select.props('disabled')).toBe(false)
    expect(store.settings.value!.rendering.debug.areModelBoundingBoxesVisible).toBe(true)
    wrapper.unmount()
    store.dispose()
  })
  it('colors category checkboxes from the shared palette without a separate legend', () => {
    const store = createEditorStore()
    const setRenderingSetting = vi.fn((_section, _key, value) => value)

    store.attach(makeRuntime({ setRenderingSetting }))

    const wrapper = mount(DebugPanel, {
      global: { provide: { [editorStoreKey as symbol]: store }, stubs: { teleport: true } }
    })

    wrapper.findAllComponents(NSelect)[0].vm.$emit('update:value', 'visible')
    wrapper.findAllComponents(SettingSlider)[0].vm.$emit('change', 3)
    wrapper.findAllComponents(SettingSlider)[1].vm.$emit('change', 50)
    wrapper
      .findAllComponents(SettingCheckbox)
      .find((checkbox) => checkbox.props('label') === 'Model bounding boxes')!
      .vm.$emit('change', true)
    expect(setRenderingSetting).toHaveBeenCalledWith('debug', 'overlayDepthMode', 'visible')
    expect(setRenderingSetting).toHaveBeenCalledWith('debug', 'overlayLineWidth', 3)
    expect(setRenderingSetting).toHaveBeenCalledWith('debug', 'overlayOpacity', 0.5)
    expect(setRenderingSetting).toHaveBeenCalledWith('debug', 'areModelBoundingBoxesVisible', true)
    expect(wrapper.text()).toContain('Body bounding boxes')
    expect(wrapper.text()).toContain('Camera frustums')
    expect(wrapper.text()).toContain('Light frustums')
    expect(wrapper.find('.overlay-legend').exists()).toBe(false)

    for (const definition of debugOverlayCheckboxes) {
      const checkbox = wrapper
        .findAllComponents(SettingCheckbox)
        .find((candidate) => candidate.props('label') === definition.label)!

      expect(checkbox.props('color')).toBe(OVERLAY_STYLES[definition.style].color)
      expect(checkbox.classes()).toContain('is-colored')
      expect(checkbox.attributes('style')).toContain(OVERLAY_STYLES[definition.style].color)
    }

    wrapper.unmount()
    store.dispose()
  })
})
