import { mount } from '@vue/test-utils'
import { NCheckbox, NCollapse, NPopover } from 'naive-ui'
import { nextTick } from 'vue'
import { Sun, LampDesk, Lightbulb } from '@lucide/vue'
import { describe, expect, it, vi } from 'vitest'
import App from '../src/editor/App.vue'
import DebugPanel from '../src/editor/components/DebugPanel.vue'
import DiagnosticsPanel from '../src/editor/components/DiagnosticsPanel.vue'
import RenderSettingsPanel from '../src/editor/components/RenderSettingsPanel.vue'
import EntitiesPanel from '../src/editor/components/EntitiesPanel.vue'
import EnvironmentPanel from '../src/editor/components/EnvironmentPanel.vue'
import SimulationPanel from '../src/editor/components/SimulationPanel.vue'
import SettingCheckbox from '../src/editor/components/SettingCheckbox.vue'
import SettingSlider from '../src/editor/components/SettingSlider.vue'
import { createEditorStore, editorStoreKey } from '../src/editor/editor-store'
import type { AnimationGroup } from '../src/editor/editor-api'
import type { SceneDescriptor } from '../src/editor/scene-catalog'
import { makeRuntime } from './editor-fixture'

const provideStore = (store: ReturnType<typeof createEditorStore>) => ({
  global: {
    provide: { [editorStoreKey as symbol]: store },
    stubs: { teleport: true }
  }
})

const availableScenes: SceneDescriptor[] = [
  {
    id: 'editor.scene.json',
    label: 'Editor',
    url: './assets/scenes/editor.scene.json',
    byteLength: 2048,
    isValid: true,
    entities: 12,
    models: 8,
    lights: 2,
    cameras: 1,
    hasEnvironment: true
  },
  {
    id: 'nested/studio.scene.json',
    label: 'Studio',
    url: './assets/scenes/nested/studio.scene.json',
    byteLength: 1024,
    isValid: true,
    entities: 4,
    models: 2,
    lights: 1,
    cameras: 1,
    hasEnvironment: false
  },
  {
    id: 'broken.scene.json',
    label: 'Broken',
    url: './assets/scenes/broken.scene.json',
    byteLength: 12,
    isValid: false,
    entities: 0,
    models: 0,
    lights: 0,
    cameras: 0,
    hasEnvironment: false,
    error: 'Unexpected token'
  }
]

describe('Vue editor interface', () => {
  it('resets the camera without changing panels or simulation', async () => {
    const resetCamera = vi.fn(() => ({ position: null, rotation: null }))
    const resetSimulation = vi.fn()
    const store = createEditorStore()

    store.attach(makeRuntime({ resetCamera, resetSimulation }))

    const wrapper = mount(App, provideStore(store))
    const panelCount = wrapper.findAll('.floating-panel').length

    await wrapper.findAll('.toolbar-item')[1].trigger('click')

    await wrapper
      .findAll('.view-command')
      .find((button) => button.text() === 'Reset camera')!
      .trigger('click')
    expect(resetCamera).toHaveBeenCalledOnce()
    expect(resetSimulation).not.toHaveBeenCalled()
    expect(wrapper.findAll('.floating-panel')).toHaveLength(panelCount)
    resetCamera.mockImplementation(() => {
      throw new Error('Stop the camera animation before resetting the camera.')
    })
    store.resetCamera()

    await nextTick()
    expect(wrapper.get('.operation-error').text()).toContain('Stop the camera animation')
    wrapper.unmount()
  })
  it('shows loading and initialization errors', async () => {
    const store = createEditorStore()
    const wrapper = mount(App, provideStore(store))

    expect(wrapper.text()).toContain('Loading scene')
    expect(wrapper.text()).toContain('Preparing renderer')
    expect(wrapper.find('.editor-toolbar').exists()).toBe(false)
    expect(wrapper.find('.animation-controls').exists()).toBe(false)
    store.setLoadingProgress({ stage: 'Loading models', completed: 12, total: 28 })

    await nextTick()
    expect(wrapper.text()).toContain('Loading models (12/28)')
    store.fail(new Error('WebGL unavailable'))

    await nextTick()
    expect(wrapper.text()).toContain('Scene initialization failed')
    expect(wrapper.text()).toContain('WebGL unavailable')
    expect(wrapper.find('.editor-toolbar').exists()).toBe(false)
    expect(wrapper.find('.animation-controls').exists()).toBe(false)
    wrapper.unmount()
  })
  it('shows only Scene and View in the toolbar', async () => {
    const store = createEditorStore()

    store.attach(makeRuntime())

    const wrapper = mount(App, provideStore(store))
    const labels = wrapper.findAll('.toolbar-item').map((button) => button.text())

    expect(wrapper.findAll('.floating-panel')).toHaveLength(4)
    expect(wrapper.find('.animation-controls').exists()).toBe(false)
    expect(wrapper.get('.floating-panel[aria-label="Entities"]').classes()).not.toContain('auto-height')
    expect(wrapper.findAll('.floating-panel.auto-height')).toHaveLength(3)
    expect(
      wrapper
        .findAll('.floating-panel.auto-height')
        .every((panel) => panel.attributes('style')?.includes('max-height: calc(100vh'))
    ).toBe(true)
    expect(wrapper.findAll('.panel-resize-handle.bottom')).toHaveLength(4)
    expect(wrapper.findAll('.panel-resize-handle.corner')).toHaveLength(4)
    expect(wrapper.find('.brand').text()).toContain('luz')
    expect(labels).toEqual(['Scene', 'View'])

    await wrapper.findAll('.toolbar-item')[1].trigger('click')

    await nextTick()
    expect(wrapper.find('.view-menu').text()).toContain('Entities')
    expect(wrapper.find('.view-menu').text()).toContain('Environment')
    expect(wrapper.find('.view-menu').text()).toContain('Simulation')
    expect(wrapper.find('.view-menu').text()).toContain('Settings')
    expect(wrapper.find('.view-menu').text()).toContain('Debug')
    expect(wrapper.find('.view-menu').text()).toContain('Diagnostics')
    expect(wrapper.find('.view-menu').text()).toContain('Reset layout')
    Object.defineProperty(wrapper.get('.floating-panel[aria-label="Entities"]').element, 'offsetHeight', {
      configurable: true,
      value: 200
    })

    await wrapper.find('.reset-layout').trigger('click')

    await nextTick()

    await nextTick()
    expect(wrapper.findAllComponents(NPopover)[1].props('show')).toBe(false)
    expect(wrapper.get('.floating-panel[aria-label="Environment"]').attributes('style')).toContain('top: 274px')
    expect(wrapper.get('.floating-panel[aria-label="Simulation"]').attributes('style')).toContain('top: 528px')
    wrapper.unmount()
  })
  it('shows a non-blocking indication while the active scene reloads', async () => {
    const store = createEditorStore()

    store.attach(makeRuntime())

    const wrapper = mount(App, provideStore(store))

    expect(wrapper.find('.scene-reload-status').exists()).toBe(false)
    store.setSceneExportProgress({
      status: 'exporting',
      scene: 'pier.scene.json',
      stage: 'Exporting models from Blender',
      completed: 4,
      total: 10
    })

    await nextTick()
    expect(wrapper.get('.scene-reload-status').text()).toBe('Exporting models from Blender (4/10)')
    store.setSceneReloading(true)

    await nextTick()
    expect(wrapper.get('.scene-reload-status').text()).toBe('Reloading scene')
    expect(wrapper.get('.scene-reload-status').attributes('role')).toBe('status')
    store.setSceneReloading(false)
    store.setSceneExportProgress(null)

    await nextTick()
    expect(wrapper.find('.scene-reload-status').exists()).toBe(false)
    wrapper.unmount()
  })
  it('controls all animations independently of physics while the Animations panel is hidden', async () => {
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(390)
    localStorage.removeItem('luz.editor.layout.mobile')

    const store = createEditorStore()
    const setSimulationRunning = vi.fn((isRunning: boolean) => isRunning)
    const resetSimulation = vi.fn(() => ({ isRunning: false, timeScale: 1, gravity: -9.81 }))
    const groups: AnimationGroup[] = ['Character', 'Platform'].map((key) => ({
      key,
      label: key,
      isPaused: false,
      speed: 1,
      clips: [{ name: 'Walking', duration: 2, playback: 'loop', weight: 1, time: 0.5, isPlaying: true }]
    }))
    const controlAnimation = vi.fn((key: string, action: 'pause' | 'resume' | 'stop') => {
      const group = groups.find((group) => group.key === key)!

      group.isPaused = action === 'pause'

      for (const clip of group.clips) {
        clip.isPlaying = action === 'resume'
      }
    })
    const setAnimationPlayback = vi.fn((key: string, name: string, playback: 'loop' | 'once') => {
      groups.find((group) => group.key === key)!.clips.find((clip) => clip.name === name)!.playback = playback
    })
    const state = makeRuntime().captureEditorState()

    state.isSimulationRunning = true

    store.attach(
      makeRuntime({
        captureEditorState: () => state,

        collectAnimationGroups: () => structuredClone(groups),
        controlAnimation,
        setAnimationPlayback,
        setSimulationRunning,
        resetSimulation
      })
    )

    const wrapper = mount(App, provideStore(store))

    expect(wrapper.findAll('.floating-panel')).toHaveLength(0)

    const playButton = wrapper.get('button[aria-label="Play animations"]')
    const pauseButton = wrapper.get('button[aria-label="Pause animations"]')

    expect(playButton.attributes('disabled')).toBeDefined()
    expect(pauseButton.attributes('disabled')).toBeUndefined()
    expect(wrapper.findAll('.animation-control[title]')).toHaveLength(0)

    await playButton.trigger('click')
    expect(controlAnimation).not.toHaveBeenCalled()

    await pauseButton.trigger('click')
    expect(controlAnimation.mock.calls).toEqual([
      ['Character', 'pause'],
      ['Platform', 'pause']
    ])
    expect(playButton.attributes('disabled')).toBeUndefined()
    expect(pauseButton.attributes('disabled')).toBeDefined()

    await playButton.trigger('click')
    expect(controlAnimation.mock.calls.slice(-2)).toEqual([
      ['Character', 'resume'],
      ['Platform', 'resume']
    ])

    await wrapper.get('button[aria-label="Loop animations"]').trigger('click')
    expect(setAnimationPlayback.mock.calls).toEqual([
      ['Character', 'Walking', 'once'],
      ['Platform', 'Walking', 'once']
    ])
    expect(playButton.attributes('disabled')).toBeDefined()
    expect(pauseButton.attributes('disabled')).toBeUndefined()
    expect(wrapper.get('button[aria-label="Previous animation"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Next animation"]').attributes('disabled')).toBeDefined()

    await wrapper.findAll('.toolbar-item')[1].trigger('click')

    const simulationToggle = wrapper.findAllComponents(NCheckbox).find((checkbox) => checkbox.text() === 'Simulation')!

    simulationToggle.vm.$emit('update:checked', true)

    await nextTick()
    expect(wrapper.findAll('.floating-panel')).toHaveLength(1)
    expect(wrapper.find('.floating-panel[aria-label="Simulation"]').exists()).toBe(true)
    expect(wrapper.find('.animation-controls').exists()).toBe(true)
    expect(wrapper.get('.simulation-actions button').text()).toBe('Stop')

    const animationsToggle = wrapper.findAllComponents(NCheckbox).find((checkbox) => checkbox.text() === 'Animations')!

    animationsToggle.vm.$emit('update:checked', true)

    await nextTick()
    expect(wrapper.find('.animation-controls').exists()).toBe(false)

    await wrapper.get('button[aria-label="Hide Animations"]').trigger('click')
    expect(wrapper.get('button[aria-label="Pause animations"]').attributes('disabled')).toBeUndefined()
    expect(store.isSimulationRunning.value).toBe(true)
    expect(setSimulationRunning).not.toHaveBeenCalled()
    expect(resetSimulation).not.toHaveBeenCalled()

    await wrapper.find('.reset-layout').trigger('click')

    await nextTick()
    expect(wrapper.findAll('.floating-panel')).toHaveLength(0)
    expect(wrapper.find('.editor-toolbar').exists()).toBe(true)
    expect(wrapper.find('.animation-controls').exists()).toBe(true)

    store.animationGroups.value = []

    await nextTick()
    expect(wrapper.find('.animation-controls').exists()).toBe(false)
    wrapper.unmount()
  })
  it('selects a valid scene explicitly and prevents loading malformed scenes', async () => {
    const activate = vi.fn()
    const refresh = vi.fn(async () => availableScenes)
    const store = createEditorStore()

    store.configureScenes(availableScenes, 'editor.scene.json', refresh, activate)
    expect(store.activateScene('editor.scene.json')).toBe(true)
    expect(activate).not.toHaveBeenCalled()
    store.attach(makeRuntime())

    const wrapper = mount(App, provideStore(store))

    await wrapper.findAll('.toolbar-item')[0].trigger('click')

    await nextTick()
    expect(wrapper.find('.scene-menu').text()).toContain('Load scene…')
    expect(wrapper.find('.scene-menu').text()).not.toContain('Scene settings')

    await wrapper.find('.scene-menu button').trigger('click')

    await nextTick()

    await nextTick()
    expect(refresh).toHaveBeenCalledOnce()
    expect(wrapper.find('.scene-browser').text()).toContain('2.0 KB')
    expect(wrapper.find('.scene-browser').text()).toContain('12 entities')
    expect(wrapper.find('.scene-browser').text()).toContain('1 light')
    expect(wrapper.find('.scene-browser').text()).not.toContain('cameras')
    expect(wrapper.find('.scene-browser').text()).not.toContain('Environment')
    expect(wrapper.find('.scene-browser').text()).toContain('Current')
    expect(wrapper.findAll('.scene-preview').length).toBe(3)
    expect(wrapper.find('.scene-preview-placeholder').text()).toBe('No preview')
    expect(wrapper.find('.scene-browser').text()).toContain('Invalid JSON: Unexpected token')
    expect(wrapper.find('.scene-browser .dialog-close-button').exists()).toBe(true)
    expect(wrapper.find('.scene-browser .scene-actions').exists()).toBe(false)

    const rows = wrapper.findAll('.scene-row')

    expect(rows[2].attributes('disabled')).toBeDefined()

    await rows.find((row) => row.text().includes('Studio'))!.trigger('click')

    await nextTick()
    expect(activate).toHaveBeenCalledOnce()
    expect(activate).toHaveBeenCalledWith('nested/studio.scene.json')
    wrapper.unmount()
  })
  it('offers scene recovery when initialization fails', async () => {
    const store = createEditorStore()

    store.configureScenes(availableScenes, 'editor.scene.json', async () => availableScenes, vi.fn())
    store.fail(new Error('broken runtime'))

    const wrapper = mount(App, provideStore(store))

    expect(wrapper.text()).toContain('Choose scene')

    await wrapper.get('.error-card button').trigger('click')

    await nextTick()
    expect(wrapper.find('.scene-browser').exists()).toBe(true)
    wrapper.unmount()
  })
  it('routes the camera motion toggle and disables it with motion blur', async () => {
    const setRenderingSetting = vi.fn((_section, _key, value) => value)
    const store = createEditorStore()

    store.attach(makeRuntime({ setRenderingSetting }))

    const wrapper = mount(RenderSettingsPanel, provideStore(store))

    await wrapper
      .findAll('.n-collapse-item__header-main')
      .find((header) => header.text().includes('Motion blur'))!
      .trigger('click')

    const isCameraBlurEnabled = wrapper
      .findAllComponents(SettingCheckbox)
      .find((checkbox) => checkbox.props('label') === 'Camera motion')!

    expect(isCameraBlurEnabled.props('isDisabled')).toBe(true)
    expect(isCameraBlurEnabled.props('isChecked')).toBe(true)
    store.setRendering('motionBlur', 'isEnabled', true)

    await nextTick()
    expect(isCameraBlurEnabled.props('isDisabled')).toBe(false)
    isCameraBlurEnabled.vm.$emit('change', false)
    expect(setRenderingSetting).toHaveBeenLastCalledWith('motionBlur', 'isCameraBlurEnabled', false)
    expect(store.settings.value!.rendering.motionBlur.isCameraBlurEnabled).toBe(false)
    wrapper.unmount()
    store.dispose()
  })
  it('renders current sections without a separate lights section', () => {
    const store = createEditorStore()

    store.attach(makeRuntime())

    const render = mount(RenderSettingsPanel, provideStore(store))

    expect(render.text()).not.toContain('Output')
    expect(render.text()).toContain('Anti-aliasing')
    expect(render.text()).toContain('Method')
    expect(render.text()).not.toContain('Composite pass')
    expect(render.text()).toContain('Softness')
    expect(render.text()).toContain('Grain')
    expect(render.text()).toContain('Ambient occlusion')
    expect(render.text()).toContain('Depth of field')
    expect(render.text()).not.toContain('Debug rendering')
    expect(render.text()).not.toContain('Effects')
    expect(render.findAll('.feature-toggle').map((toggle) => toggle.text())).toEqual([
      'Anti-aliasing',
      'Shadows',
      'Planar reflections',
      'Ambient occlusion',
      'Volumetric lighting',
      'Subsurface lighting',
      'Bloom',
      'Motion blur',
      'Depth of field'
    ])
    expect(render.text()).not.toContain('Enable shadows')
    expect(render.findAll('.feature-only-row').map((row) => row.text())).toEqual([
      'Planar reflections',
      'Subsurface lighting'
    ])

    const entities = mount(EntitiesPanel, provideStore(store))
    const environment = mount(EnvironmentPanel, provideStore(store))

    expect(environment.text()).toContain('Ambient brightness')
    expect(environment.text()).toContain('Diffuse strength')
    expect(entities.text()).not.toContain('Ambient brightness')
    expect(entities.text()).toContain('Reset to import')
    expect(entities.findComponent(NCollapse).exists()).toBe(false)
    expect(environment.findComponent(NCollapse).exists()).toBe(false)

    const debug = mount(DebugPanel, provideStore(store))

    expect(debug.text()).not.toContain('2D overlay')
    expect(debug.text()).toContain('Camera frustums')
    expect(debug.text()).toContain('Light frustums')
    expect(debug.text()).toContain('Debug visualization')

    const simulation = mount(SimulationPanel, provideStore(store))

    for (const panel of [render, entities, environment, debug, simulation]) {
      expect(panel.findAllComponents(NCheckbox).every((checkbox) => checkbox.props('size') === 'small')).toBe(true)
    }

    const diagnostics = mount(DiagnosticsPanel, provideStore(store))

    expect(diagnostics.text()).toContain('Reflections')
    expect(diagnostics.text().indexOf('Primitives')).toBeLessThan(diagnostics.text().indexOf('Reflections'))
    expect(diagnostics.text()).toContain('1 / 2')
    expect(diagnostics.text()).toContain('Primitives')
    expect(diagnostics.text()).toContain('8 / 14')
    expect(diagnostics.text()).not.toContain('DOF backing GPU')
    expect(diagnostics.text()).not.toContain('submittedPrimitiveCount')
    expect(diagnostics.text()).not.toContain('Environment')
    store.dispose()
  })
  it('keeps the frame rate outside the diagnostics scroll container', () => {
    localStorage.setItem('luz.editor.layout', JSON.stringify({ diagnostics: { isVisible: true } }))

    const store = createEditorStore()

    store.attach(makeRuntime())

    const wrapper = mount(App, provideStore(store))
    const diagnostics = wrapper.find('[aria-label="Diagnostics"]')

    expect(diagnostics.find('.panel-fixed').text()).toContain('Frame rate')
    expect(diagnostics.find('.panel-content').text()).not.toContain('Frame rate')
    store.dispose()
  })
  it.each([
    ['directional', Sun],
    ['spot', LampDesk],
    ['point', Lightbulb]
  ] as const)('routes a %s light control through the typed runtime command', async (lightType, icon) => {
    const setComponentVisible = vi.fn((_path: string, _name: string, isVisible: boolean) => isVisible)
    const store = createEditorStore()

    store.attach(makeRuntime({ setComponentVisible }))

    store.entities.value = [
      {
        key: 'sun',
        label: 'Sun',
        components: [{ name: 'Sunlight', type: 'light', lightKey: 'sun', lightType }],
        children: []
      }
    ]

    const wrapper = mount(EntitiesPanel, provideStore(store))

    await wrapper.get('[data-entity-path="sun"] .n-tree-node-content').trigger('click')

    await vi.waitFor(() => expect(wrapper.find('button.visibility-toggle').exists()).toBe(true))
    expect(wrapper.findAllComponents(icon)).toHaveLength(2)
    expect(wrapper.text()).not.toContain('Directional')

    await wrapper.get('button.visibility-toggle').trigger('click')
    expect(setComponentVisible).toHaveBeenCalledOnce()
    expect(setComponentVisible).toHaveBeenCalledWith('sun', 'Sunlight', false)
    expect(store.lights.value[0].isEnabled).toBe(false)
    expect(wrapper.findAllComponents(icon)).toHaveLength(2)

    await wrapper.get('button.visibility-toggle').trigger('click')
    expect(wrapper.findAllComponents(icon)).toHaveLength(2)
    store.dispose()
  })
  it('starts, stops, resets, and changes gravity through runtime commands', async () => {
    const setSimulationRunning = vi.fn((isRunning: boolean) => isRunning)
    const resetSimulation = vi.fn(() => ({ isRunning: false, timeScale: 1, gravity: -9.81 }))
    const setTimeScale = vi.fn((value: number) => value)
    const setGravity = vi.fn((value: number) => value)
    const store = createEditorStore()

    store.attach(makeRuntime({ setSimulationRunning, resetSimulation, setTimeScale, setGravity }))

    const wrapper = mount(SimulationPanel, provideStore(store))
    const simulationButtons = wrapper.findAll('.simulation-actions button')

    expect(wrapper.get('.simulation-legend').text()).toContain('Active')
    expect(wrapper.get('.simulation-legend').text()).toContain('Passive')
    expect(wrapper.get('.simulation-legend').text()).toContain('Sleeping')
    expect(wrapper.get('.simulation-legend').text()).toContain('Colliding')
    expect(wrapper.get('.simulation-legend').text()).toContain('Culled')
    expect(simulationButtons[0].text()).toBe('Start')

    await simulationButtons[0].trigger('click')

    await nextTick()
    expect(setSimulationRunning).toHaveBeenCalledWith(true)
    expect(simulationButtons[0].text()).toBe('Stop')

    await simulationButtons[0].trigger('click')

    await nextTick()
    expect(setSimulationRunning).toHaveBeenLastCalledWith(false)

    const sliders = wrapper.findAllComponents(SettingSlider)
    const timeScale = sliders.find((slider) => slider.props('label') === 'Time scale')!
    const gravity = sliders.find((slider) => slider.props('label') === 'Gravity')!

    timeScale.vm.$emit('change', 0.25)
    gravity.vm.$emit('change', -4.2)
    expect(setTimeScale).toHaveBeenCalledWith(0.25)
    expect(setGravity).toHaveBeenCalledWith(-4.2)
    expect(store.settings.value?.simulation.timeScale).toBe(0.25)
    expect(store.settings.value?.simulation.gravity).toBe(-4.2)

    await simulationButtons[1].trigger('click')
    expect(resetSimulation).toHaveBeenCalledOnce()
    expect(store.isSimulationRunning.value).toBe(false)
    expect(store.settings.value?.simulation.timeScale).toBe(1)
    expect(store.settings.value?.simulation.gravity).toBe(-9.81)
    store.dispose()
  })
  it('filters overlay annotations through the legend checkboxes', async () => {
    const setDebugOverlayCategory = vi.fn((_category, isEnabled: boolean) => isEnabled)
    const setRenderingSetting = vi.fn((_section, _key, value) => value)
    const store = createEditorStore()

    store.attach(makeRuntime({ setDebugOverlayCategory, setRenderingSetting }))

    const wrapper = mount(SimulationPanel, provideStore(store))
    const checkboxes = wrapper.findAllComponents(NCheckbox)
    const overlay = checkboxes.find((checkbox) => checkbox.classes().includes('overlay-toggle'))!
    const categories = checkboxes.filter((checkbox) => checkbox.classes().includes('legend-toggle'))

    expect(wrapper.findComponent(NCollapse).exists()).toBe(true)
    expect(overlay.text()).toBe('Enable overlay')
    expect(overlay.props('checked')).toBe(true)
    expect(categories).toHaveLength(5)
    expect(wrapper.find('.legend-swatch').exists()).toBe(false)
    expect(
      categories.map((checkbox) =>
        checkbox.classes().find((name) => ['active', 'passive', 'sleeping', 'colliding', 'culled'].includes(name))
      )
    ).toEqual(['active', 'passive', 'sleeping', 'colliding', 'culled'])
    expect(categories.every((checkbox) => checkbox.props('checked') === true)).toBe(true)
    expect(categories.every((checkbox) => checkbox.props('disabled') === false)).toBe(true)
    overlay.vm.$emit('update:checked', false)

    await nextTick()
    expect(setRenderingSetting).toHaveBeenCalledWith('debug', 'areOverlaysVisible', false)
    expect(store.settings.value?.rendering.debug.areOverlaysVisible).toBe(false)
    expect(categories.every((checkbox) => checkbox.props('disabled') === true)).toBe(true)
    expect(wrapper.findAll('.legend-item').every((item) => item.classes().includes('is-disabled'))).toBe(true)
    categories[3].vm.$emit('update:checked', false)
    expect(setDebugOverlayCategory).toHaveBeenCalledOnce()
    expect(setDebugOverlayCategory).toHaveBeenCalledWith('colliding', false)
    expect(store.settings.value?.rendering.debug.overlayCategories.colliding).toBe(false)
    store.dispose()
  })
  it('resets camera and visibility from the Entities panel independently of environment', async () => {
    const state = makeRuntime().captureEditorState()

    state.settings.camera.position = [1, 2, 3]
    state.settings.models = {}
    state.settings.lights = {}
    state.entities = [
      { key: 'Mesh', label: 'Mesh', components: [{ name: 'Model', type: 'model', isVisible: true }], children: [] }
    ]

    const resetImportedEntities = vi.fn(() => state)
    const store = createEditorStore()

    store.attach(makeRuntime({ resetImportedEntities }))

    store.settings.value!.environment.rotationDegrees = 90
    store.settings.value!.simulation.timeScale = 0.5
    store.settings.value!.models = { mesh: { isVisible: false } }

    const wrapper = mount(App, provideStore(store))
    const panel = wrapper.get('.floating-panel[aria-label="Entities"]')

    expect(panel.find('.entity-actions .n-divider').exists()).toBe(true)

    const button = panel.get('.reset-entities')

    expect(button.classes()).toContain('n-button--block')

    await button.trigger('click')
    expect(resetImportedEntities).toHaveBeenCalledOnce()
    expect(store.settings.value!.camera.position).toEqual([1, 2, 3])
    expect(store.settings.value!.models).toEqual({})
    expect(store.settings.value!.lights).toEqual({})
    expect(store.entities.value).toEqual(state.entities)
    expect(store.lights.value).toEqual(state.lights)
    expect(store.settings.value!.environment.rotationDegrees).toBe(90)
    expect(store.settings.value!.simulation.timeScale).toBe(0.5)
    wrapper.unmount()
  })
  it('resets only the environment from its panel', async () => {
    const environment = makeRuntime().captureEditorState().settings.environment

    let finishReset!: (value: typeof environment) => void

    const resetImportedEnvironment = vi.fn(
      () =>
        new Promise<typeof environment>((resolve) => {
          finishReset = resolve
        })
    )
    const store = createEditorStore()

    store.attach(makeRuntime({ resetImportedEnvironment }))

    store.settings.value!.environment.rotationDegrees = 90
    store.settings.value!.environment.diffuseStrength = 1.5
    store.settings.value!.camera.position = [1, 2, 3]
    store.settings.value!.simulation.timeScale = 0.5
    store.settings.value!.lights = { sun: { isEnabled: false } }
    store.settings.value!.models = { mesh: { isVisible: false } }

    const before = JSON.parse(JSON.stringify(store.settings.value))
    const lights = store.lights.value
    const entities = store.entities.value
    const wrapper = mount(App, provideStore(store))

    await wrapper.findAll('.toolbar-item')[0].trigger('click')
    expect(wrapper.get('.scene-menu').text()).not.toContain('Reset to import')

    const button = wrapper.get('.floating-panel[aria-label="Environment"] .reset-environment')

    expect(button.text()).toBe('Reset to import')

    await button.trigger('click')
    expect(button.attributes('disabled')).toBeDefined()
    expect(resetImportedEnvironment).toHaveBeenCalledOnce()
    finishReset({ ...environment })

    await nextTick()

    await nextTick()
    expect(store.settings.value).toEqual({ ...before, environment })
    expect(store.lights.value).toBe(lights)
    expect(store.entities.value).toBe(entities)
    expect(button.attributes('disabled')).toBeUndefined()
    wrapper.unmount()
  })
})
