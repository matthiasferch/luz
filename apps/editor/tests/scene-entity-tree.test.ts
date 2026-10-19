import { mount } from '@vue/test-utils'
import { NTree } from 'naive-ui'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import EntitiesPanel from '../src/editor/components/EntitiesPanel.vue'
import type { EditorEntity } from '../src/editor/editor-api'
import { createEditorStore, editorStoreKey } from '../src/editor/editor-store'
import { makeRuntime } from './editor-fixture'

const tree: EditorEntity[] = ['First', 'Second'].map((label) => ({
  key: label,
  label,
  components: [],
  children: [{ key: `${label}/Mesh`, label: 'Mesh', components: [{ name: 'Model', type: 'model' }], children: [] }]
}))

const createFixture = (entities: EditorEntity[]) => {
  const store = createEditorStore()
  const state = makeRuntime().captureEditorState()
  const runtime = makeRuntime({ captureEditorState: () => ({ ...state, entities }) })

  store.attach(runtime)

  const wrapper = mount(EntitiesPanel, {
    global: { provide: { [editorStoreKey as symbol]: store }, stubs: { teleport: true, transition: false } }
  })

  return { store, wrapper, runtime }
}

describe('Scene entity tree', () => {
  it('lists object animations by name and animation icon without playback details', async () => {
    const { store, wrapper } = createFixture([
      {
        key: 'Platform',
        label: 'Platform',
        children: [],
        components: [
          { name: 'Horizontal', type: 'animation' },
          { name: 'Vertical', type: 'animation' }
        ]
      }
    ])

    try {
      await wrapper.get('[data-entity-path="Platform"] .n-tree-node-content').trigger('click')

      await vi.waitFor(() => expect(wrapper.find('[data-component-name="Horizontal"]').exists()).toBe(true))
      expect(wrapper.get('[data-component-name="Horizontal"]').text()).toBe('Horizontal')
      expect(wrapper.get('[data-component-name="Vertical"]').text()).toBe('Vertical')
      expect(wrapper.find('[data-component-name="Horizontal"] svg.lucide-route').exists()).toBe(true)
      expect(wrapper.find('svg.lucide-repeat, svg.lucide-repeat-off').exists()).toBe(false)
      expect(wrapper.text()).not.toContain('Mixer')
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('expands model contents independently and keeps visibility controls on models', async () => {
    const { store, wrapper } = createFixture(
      ['First', 'Second'].map((name) => ({
        key: name,
        label: name,
        children: [{ key: `${name}/Marker`, label: 'Marker', components: [], children: [] }],
        components: [
          {
            name: 'Model',
            type: 'model',
            isVisible: true,
            contents: [
              {
                name: 'Armature',
                type: 'armature',
                boneCount: 2,
                children: [{ name: 'Hips', type: 'bone', children: [{ name: 'Spine', type: 'bone' }] }]
              },
              { name: 'Timeline', type: 'animation' }
            ]
          }
        ]
      }))
    )

    try {
      expect(wrapper.find('[data-model-content-type]').exists()).toBe(false)

      await wrapper.findAll('[data-component-name="Model"] .n-tree-node-content')[0].trigger('click')

      await vi.waitFor(() => expect(wrapper.findAll('[data-model-content-type="armature"]')).toHaveLength(1))

      const armature = wrapper.get('[data-model-content-type="armature"]')

      expect(armature.text()).toBe('Armature2')
      expect(armature.find('svg.lucide-skull').exists()).toBe(true)
      expect(armature.find('[aria-label="2 bones"] svg.lucide-bone').exists()).toBe(true)
      expect(wrapper.get('[data-model-content-type="animation"]').text()).toBe('Timeline')
      expect(wrapper.find('[data-model-content-type="animation"] svg.lucide-route').exists()).toBe(true)
      expect(wrapper.find('svg.lucide-repeat, svg.lucide-repeat-off').exists()).toBe(false)
      expect(wrapper.find('[data-model-content-type] .visibility-toggle').exists()).toBe(false)
      expect(wrapper.findAll('[data-component-name="Model"] .visibility-toggle')).toHaveLength(2)

      await vi.waitFor(() => expect(wrapper.find('.n-tree-motion-wrapper').exists()).toBe(false))

      await wrapper.get('[data-model-content-type="armature"] .n-tree-node-content').trigger('click')

      await vi.waitFor(() => expect(wrapper.find('[data-model-content-name="Hips"]').exists()).toBe(true))

      await vi.waitFor(() => expect(wrapper.find('.n-tree-motion-wrapper').exists()).toBe(false))

      await wrapper.get('[data-model-content-name="Hips"] .n-tree-node-content').trigger('click')

      await vi.waitFor(() => expect(wrapper.find('[data-model-content-name="Spine"]').exists()).toBe(true))

      await vi.waitFor(() => expect(wrapper.find('.n-tree-motion-wrapper').exists()).toBe(false))

      await wrapper.findAll('[data-component-name="Model"] .n-tree-node-content')[1].trigger('click')

      await vi.waitFor(() => expect(wrapper.findAll('[data-model-content-type="armature"]')).toHaveLength(2))
      expect(wrapper.findAll('[data-model-content-type="animation"]').map((node) => node.text())).toEqual([
        'Timeline',
        'Timeline'
      ])
      expect(wrapper.findAll('[data-model-content-name="Hips"]')).toHaveLength(1)
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toContain(
        'content:["First","Model","armature","Armature","bone","Hips"]'
      )
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('shows a baked animation by its component name with an icon', () => {
    const { store, wrapper } = createFixture([
      {
        key: 'Platform',
        label: 'Platform',
        components: [{ name: 'Platform Motion', type: 'animation' }],
        children: [{ key: 'Platform/Marker', label: 'Marker', components: [], children: [] }]
      }
    ])

    try {
      const row = wrapper.get('[data-component-name="Platform Motion"]')

      expect(row.text()).toContain('Platform Motion')
      expect(row.find('svg.lucide-route').exists()).toBe(true)
      expect(row.find('.visibility-toggle').exists()).toBe(false)
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('toggles model and light visibility independently without changing expansion', async () => {
    const { store, wrapper, runtime } = createFixture(
      ['First', 'Second'].map((key) => ({
        key,
        label: key,
        components: [
          { name: 'Model', type: 'model', isVisible: true },
          { name: 'Light', type: 'light', isVisible: false, lightKey: 'lamp' },
          { name: 'Body', type: 'body' }
        ],
        children: [{ key: `${key}/Empty`, label: 'Empty', components: [], children: [] }]
      }))
    )
    const setVisible = vi.spyOn(runtime, 'setComponentVisible')

    try {
      const modelButtons = wrapper.findAll('[data-component-name="Model"] .visibility-toggle')
      const lightButtons = wrapper.findAll('[data-component-name="Light"] .visibility-toggle')
      const expanded = [...(wrapper.getComponent(NTree).props('expandedKeys') ?? [])]

      expect(wrapper.find('[data-component-name="Body"] .visibility-toggle').exists()).toBe(false)
      expect(modelButtons[0].find('svg.lucide-eye').exists()).toBe(true)
      expect(lightButtons[0].find('svg.lucide-eye-off').exists()).toBe(true)
      expect(modelButtons[0].element.parentElement?.lastElementChild).toBe(modelButtons[0].element)

      await modelButtons[0].trigger('click')
      expect(setVisible).toHaveBeenLastCalledWith('First', 'Model', false)
      expect(modelButtons[0].find('svg.lucide-eye-off').exists()).toBe(true)
      expect(modelButtons[1].attributes('aria-pressed')).toBe('true')
      expect(store.settings.value!.models[JSON.stringify(['First', 'Model'])]).toEqual({ isVisible: false })

      await modelButtons[0].trigger('keydown', { key: ' ', code: 'Space' })

      await modelButtons[0].trigger('click')
      expect(setVisible).toHaveBeenLastCalledWith('First', 'Model', true)

      await lightButtons[0].trigger('click')
      expect(setVisible).toHaveBeenLastCalledWith('First', 'Light', true)
      expect(lightButtons[0].find('svg.lucide-eye').exists()).toBe(true)
      expect(store.lights.value.find((light) => light.key === 'lamp')!.isEnabled).toBe(true)
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toEqual(expanded)
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('shows the empty scene state', () => {
    const { store, wrapper } = createFixture([])

    try {
      expect(wrapper.text()).toContain('No entities in scene')
      expect(wrapper.findComponent(NTree).exists()).toBe(false)
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('browses duplicate child names independently and labels transform-only nodes', async () => {
    const { store, wrapper } = createFixture(tree)

    try {
      expect(wrapper.get('[data-entity-path="First"]').text()).toBe('First')
      expect(wrapper.find('[data-entity-path="First"] [aria-label="Entity"] svg.lucide-network').exists()).toBe(true)
      expect(wrapper.get('[data-entity-path="First/Mesh"]').text()).toBe('Mesh')
      expect(
        wrapper.find('[data-entity-path="First/Mesh"] .entity-component-icons svg.lucide-vector-polygon').exists()
      ).toBe(true)
      expect(wrapper.get('[data-entity-path="Second/Mesh"]').text()).toContain('Mesh')
      expect(wrapper.get('[data-entity-path="First"] .n-tree-node-switcher').classes()).not.toContain(
        'n-tree-node-switcher--hide'
      )
      expect(wrapper.get('[data-entity-path="First/Mesh"] .n-tree-node-switcher').classes()).not.toContain(
        'n-tree-node-switcher--hide'
      )

      await wrapper.get('[data-entity-path="First"] .n-tree-node-content').trigger('click')
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toEqual(['entity:Second'])

      await vi.waitFor(() => expect(wrapper.find('[data-entity-path="First/Mesh"]').exists()).toBe(false))
      expect(wrapper.find('[data-entity-path="Second/Mesh"]').exists()).toBe(true)

      await wrapper.get('[data-entity-path="First"] .n-tree-node-content').trigger('click')
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toEqual(['entity:Second', 'entity:First'])
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('replaces stale nodes when the reloaded runtime is attached', async () => {
    const { store, wrapper, runtime } = createFixture(tree)

    try {
      store.attach(
        makeRuntime({
          captureEditorState: () => ({
            ...runtime.captureEditorState(),
            entities: [{ key: 'Empty', label: 'Empty', components: [], children: [] }]
          })
        })
      )

      await nextTick()
      expect(wrapper.find('[data-entity-path="First"]').exists()).toBe(false)
      expect(wrapper.get('[data-entity-path="Empty"]').text()).toContain('Empty')
      expect(wrapper.get('[data-entity-path="Empty"] .n-tree-node-switcher').classes()).toContain(
        'n-tree-node-switcher--hide'
      )

      await wrapper.get('[data-entity-path="Empty"] .n-tree-node-content').trigger('click')
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toEqual([])
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('expands components as leaves alongside child entities with matching names', async () => {
    const { store, wrapper } = createFixture([
      {
        key: 'Lamp',
        label: 'Lamp',
        components: [
          { name: 'Light', type: 'light' },
          { name: 'Fill', type: 'light' },
          { name: 'Body', type: 'body' }
        ],
        children: [{ key: 'Lamp/Light', label: 'Light', components: [{ name: 'Model', type: 'model' }], children: [] }]
      },
      {
        key: 'Camera',
        label: 'Camera',
        components: [{ name: 'Camera', type: 'camera' }],
        children: []
      }
    ])

    try {
      expect(wrapper.find('[data-component-name="Light"] .entity-components').exists()).toBe(false)
      expect(wrapper.find('[data-component-name="Fill"] .entity-components').exists()).toBe(false)
      expect(wrapper.find('[data-component-name="Body"] .entity-components').exists()).toBe(false)
      expect(wrapper.get('[data-component-name="Light"] .n-tree-node-switcher').classes()).toContain(
        'n-tree-node-switcher--hide'
      )
      expect(wrapper.find('[data-entity-path="Lamp/Light"]').exists()).toBe(true)
      expect(wrapper.find('[data-component-name="Model"]').exists()).toBe(false)

      await wrapper.get('[data-entity-path="Lamp/Light"] .n-tree-node-content').trigger('click')

      await vi.waitFor(() => expect(wrapper.find('[data-component-name="Model"]').exists()).toBe(true))

      await vi.waitFor(() => expect(wrapper.find('.n-tree-motion-wrapper').exists()).toBe(false))
      expect(wrapper.find('[data-component-name="Camera"]').exists()).toBe(false)

      await wrapper.get('[data-entity-path="Camera"] .n-tree-node-content').trigger('click')

      await vi.waitFor(() => expect(wrapper.find('[data-component-name="Camera"]').exists()).toBe(true))
      expect(wrapper.find('[data-component-name="Camera"] .entity-components').exists()).toBe(false)
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
  it('shows body details, active camera and light controls without changing tree expansion', async () => {
    const { store, wrapper, runtime } = createFixture([
      {
        key: 'Rig',
        label: 'Rig',
        components: [
          { name: 'Physics', type: 'body', motionMode: 'static', collisionShape: 'cylinder' },
          { name: 'View', type: 'camera', isActiveCamera: true },
          { name: 'Other', type: 'camera', isActiveCamera: false },
          { name: 'Key', type: 'light', lightType: 'directional', color: '#ff8000', lightKey: 'sun' },
          { name: 'Fill', type: 'light', lightType: 'spot', color: '#ffffff', lightKey: 'lamp' }
        ],
        children: [{ key: 'Rig/Empty', label: 'Empty', components: [], children: [] }]
      }
    ])
    const setVisible = vi.spyOn(runtime, 'setComponentVisible')

    try {
      expect(wrapper.get('[data-component-name="View"] .active-camera').text()).toBe('Active')
      expect(wrapper.get('[data-component-name="View"] svg.lucide-cctv').attributes('width')).toBe('14')
      expect(wrapper.find('[data-component-name="View"] svg.lucide-aperture').exists()).toBe(false)
      expect(wrapper.find('[data-component-name="Other"] .active-camera').exists()).toBe(false)
      expect(wrapper.get('[data-component-name="Key"] [role="img"]').attributes('aria-label')).toBeUndefined()
      expect(wrapper.get('[data-component-name="Key"] [role="img"]').attributes('title')).toBeUndefined()
      expect(wrapper.get('[data-component-name="Key"] svg.lucide-sun').attributes('aria-hidden')).toBe('true')
      expect(wrapper.get('[data-component-name="Key"] .component-icon').attributes('style')).toContain('color: #ff8000')
      expect(wrapper.find('.light-color').exists()).toBe(false)
      expect(wrapper.get('[data-component-name="Key"] .entity-row').element.firstElementChild?.className).toBe(
        'component-icon'
      )

      await wrapper.get('[data-component-name="Key"] .component-icon').trigger('click')
      expect(setVisible).not.toHaveBeenCalled()
      expect(store.lights.value.find((light) => light.key === 'sun')!.isEnabled).toBe(true)
      expect(wrapper.get('[data-component-name="Physics"] .entity-name').text()).toBe('Cylinder')
      expect(wrapper.find('[data-component-name="Physics"] svg.lucide-box').exists()).toBe(true)
      expect(wrapper.get('[data-component-name="Physics"] .motion-mode').text()).toBe('Static')

      const summary = wrapper.get('[data-entity-path="Rig"] .entity-component-icons')

      expect(summary.text()).toBe('')
      expect(summary.find('svg.lucide-box').exists()).toBe(true)
      expect(summary.findAll('svg.lucide-cctv')).toHaveLength(2)
      expect(summary.findAll('svg.lucide-sun')).toHaveLength(1)
      expect(summary.findAll('svg.lucide-lamp-desk')).toHaveLength(1)
      expect(wrapper.find('[data-component-name="Fill"] svg.lucide-lamp-desk').exists()).toBe(true)
      expect(wrapper.get('[data-component-name="Physics"] .n-tree-node-switcher').classes()).toContain(
        'n-tree-node-switcher--hide'
      )

      const expanded = wrapper.getComponent(NTree).props('expandedKeys')

      await wrapper.get('[data-component-name="Physics"] .n-tree-node-content').trigger('click')
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toEqual(expanded)
      expect(wrapper.text()).not.toContain('Motion mode')
      expect(wrapper.text()).not.toContain('Collision shape')

      const keyToggle = wrapper.get('[data-component-name="Key"] button.visibility-toggle')
      const fillToggle = wrapper.get('[data-component-name="Fill"] button.visibility-toggle')

      expect(keyToggle.attributes('aria-pressed')).toBe('true')
      expect(fillToggle.attributes('aria-pressed')).toBe('false')
      expect(fillToggle.find('svg.lucide-eye-off').exists()).toBe(true)
      expect(wrapper.find('.entity-tree .n-checkbox').exists()).toBe(false)

      await keyToggle.trigger('click')
      expect(setVisible).toHaveBeenLastCalledWith('Rig', 'Key', false)
      expect(store.lights.value.find((light) => light.key === 'sun')!.isEnabled).toBe(false)
      expect(fillToggle.attributes('aria-pressed')).toBe('false')
      expect(keyToggle.find('svg.lucide-eye-off').exists()).toBe(true)
      expect(summary.findAll('svg.lucide-sun')).toHaveLength(1)
      expect(summary.findAll('svg.lucide-lamp-desk')).toHaveLength(1)
      expect(wrapper.find('[data-component-name="Key"] svg.lucide-sun').exists()).toBe(true)
      expect(keyToggle.find('svg.lucide-eye').exists()).toBe(false)
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toEqual(expanded)
      store.setLightEnabled('sun', true)

      await nextTick()
      expect(keyToggle.attributes('aria-pressed')).toBe('true')
      expect(keyToggle.find('svg.lucide-eye').exists()).toBe(true)
      expect(summary.findAll('svg.lucide-sun')).toHaveLength(1)
      expect(wrapper.find('[data-component-name="Key"] svg.lucide-sun').exists()).toBe(true)

      await keyToggle.trigger('keydown', { key: ' ', code: 'Space' })
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toEqual(expanded)

      // Native buttons generate a click for keyboard activation in the browser.
      await keyToggle.trigger('click')
      expect(setVisible).toHaveBeenLastCalledWith('Rig', 'Key', false)
      expect(keyToggle.attributes('aria-pressed')).toBe('false')
      expect(wrapper.getComponent(NTree).props('expandedKeys')).toEqual(expanded)
    } finally {
      wrapper.unmount()
      store.dispose()
    }
  })
})
