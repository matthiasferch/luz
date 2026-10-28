import { mount } from '@vue/test-utils'
import { NInput, NSelect, NSlider } from 'naive-ui'
import { nextTick } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import AnimationPanel from '../src/editor/components/AnimationPanel.vue'
import AnimationControls from '../src/editor/components/AnimationControls.vue'
import SettingSlider from '../src/editor/components/SettingSlider.vue'
import { createEditorStore, editorStoreKey } from '../src/editor/editor-store'
import type { AnimationGroup } from '../src/editor/editor-api'
import { makeRuntime } from './editor-fixture'

const createFixture = (isTransformTimeline = false) => {
  const store = createEditorStore()
  const groups: AnimationGroup[] = ['First', 'Second'].map((key) => ({
    key,
    label: key,
    isPaused: false,
    speed: 1,
    clips: [
      { name: 'Walking', duration: 2, playback: 'loop', weight: 1, time: 0.5, isPlaying: true },
      ...(!isTransformTimeline
        ? [{ name: 'Running', duration: 1, playback: 'once' as const, weight: 0, time: 0, isPlaying: false }]
        : [])
    ]
  }))
  const setAnimationMix = vi.fn(
    (key: string, weights: Record<string, number>, _transitionDuration = 0, isRestartEnabled = false) => {
      const group = groups.find((group) => group.key === key)!

      group.isPaused = false

      for (const clip of group.clips) {
        clip.weight = weights[clip.name] ?? 0
        clip.isPlaying = clip.weight > 0

        if (isRestartEnabled) {
          clip.time = 0
        }
      }
    }
  )
  const setAnimationPlayback = vi.fn((key: string, name: string, mode: 'loop' | 'once') => {
    groups.find((group) => group.key === key)!.clips.find((clip) => clip.name === name)!.playback = mode
  })
  const controlAnimation = vi.fn((key: string, action: 'pause' | 'resume' | 'stop') => {
    const group = groups.find((group) => group.key === key)!

    group.isPaused = action === 'pause'

    for (const clip of group.clips) {
      clip.isPlaying = action === 'resume' && clip.weight > 0
    }
  })
  const seekAnimation = vi.fn()
  const setAnimationSpeed = vi.fn()

  store.attach(
    makeRuntime({
      collectAnimationGroups: () => structuredClone(groups),

      getAnimationTime: (key, name) =>
        groups.find((group) => group.key === key)?.clips.find((clip) => clip.name === name)?.time ?? 0,
      setAnimationMix,
      setAnimationPlayback,
      controlAnimation,
      seekAnimation,
      setAnimationSpeed
    })
  )

  const wrapper = mount(AnimationPanel, {
    global: { provide: { [editorStoreKey as symbol]: store }, stubs: { teleport: true, transition: false } }
  })
  const dispose = () => {
    wrapper.unmount()
    store.dispose()
  }

  return {
    store,
    wrapper,
    groups,
    setAnimationMix,
    setAnimationPlayback,
    controlAnimation,
    seekAnimation,
    setAnimationSpeed,
    dispose
  }
}

describe('Animation overlay', () => {
  it('cycles through clips in both directions, wraps, and preserves paused targets', async () => {
    const fixture = createFixture()
    const { store, groups } = fixture
    const wrapper = mount(AnimationControls, { global: { provide: { [editorStoreKey as symbol]: store } } })

    store.controlAnimation('Second', 'pause')

    await nextTick()

    await wrapper.get('button[aria-label="Next animation"]').trigger('click')
    expect(groups.map((group) => group.clips.filter((clip) => clip.weight > 0).map((clip) => clip.name))).toEqual([
      ['Running'],
      ['Running']
    ])
    expect(groups[0].clips[1].isPlaying).toBe(true)
    expect(groups[1].clips[1].isPlaying).toBe(false)
    expect(groups[1].isPaused).toBe(true)
    expect(groups[1].clips[1].time).toBe(0)
    expect(wrapper.get('button[aria-label="Loop animations"]').attributes('aria-pressed')).toBe('false')

    await wrapper.get('button[aria-label="Next animation"]').trigger('click')
    expect(groups.every((group) => group.clips[0].weight === 1)).toBe(true)
    expect(wrapper.get('button[aria-label="Loop animations"]').attributes('aria-pressed')).toBe('true')

    await wrapper.get('button[aria-label="Previous animation"]').trigger('click')
    expect(groups.every((group) => group.clips[1].weight === 1)).toBe(true)

    groups[0].clips[0].weight = 0.25
    groups[0].clips[1].weight = 0.75
    store.animationGroups.value = structuredClone(groups)

    await nextTick()

    await wrapper.get('button[aria-label="Previous animation"]').trigger('click')
    expect(groups[0].clips[0].weight).toBe(1)
    expect(groups[0].clips[1].weight).toBe(0)
    wrapper.unmount()
    fixture.dispose()
  })
  it('toggles looping for active clips without seeking or changing playback and reflects panel edits', async () => {
    const fixture = createFixture()
    const { store, groups, controlAnimation, setAnimationMix, seekAnimation } = fixture
    const wrapper = mount(AnimationControls, { global: { provide: { [editorStoreKey as symbol]: store } } })
    const loopButton = wrapper.get('button[aria-label="Loop animations"]')

    expect(loopButton.attributes('aria-pressed')).toBe('true')
    expect(loopButton.classes()).toContain('is-active')

    await loopButton.trigger('click')
    expect(groups.every((group) => group.clips[0].playback === 'once')).toBe(true)
    expect(groups.every((group) => group.clips[0].isPlaying && group.clips[0].time === 0.5)).toBe(true)
    expect(loopButton.attributes('aria-pressed')).toBe('false')
    store.setAnimationPlayback('First', 'Walking', 'loop')

    await nextTick()
    expect(loopButton.attributes('aria-pressed')).toBe('false')

    await loopButton.trigger('click')
    expect(groups.every((group) => group.clips[0].playback === 'loop')).toBe(true)
    expect(groups.every((group) => group.clips[1].playback === 'once')).toBe(true)
    expect(loopButton.attributes('aria-pressed')).toBe('true')
    expect(controlAnimation).not.toHaveBeenCalled()
    expect(setAnimationMix).not.toHaveBeenCalled()
    expect(seekAnimation).not.toHaveBeenCalled()
    wrapper.unmount()
    fixture.dispose()
  })
  it('disables navigation for single-clip targets and selects either end when no clip is active', async () => {
    const fixture = createFixture(true)
    const { store, groups, setAnimationMix } = fixture
    const wrapper = mount(AnimationControls, { global: { provide: { [editorStoreKey as symbol]: store } } })

    expect(wrapper.get('button[aria-label="Previous animation"]').attributes('disabled')).toBeDefined()
    expect(wrapper.get('button[aria-label="Next animation"]').attributes('disabled')).toBeDefined()
    expect(wrapper.find('button[aria-label="Reset animations"]').exists()).toBe(false)

    groups[0].clips[0].weight = 0
    groups[0].clips[0].isPlaying = false

    groups[0].clips.push({ name: 'Running', duration: 1, playback: 'once', weight: 0, time: 0, isPlaying: false })

    store.animationGroups.value = structuredClone(groups)

    await nextTick()

    await wrapper.get('button[aria-label="Next animation"]').trigger('click')
    expect(setAnimationMix).toHaveBeenCalledExactlyOnceWith('First', { Walking: 1 }, 0, true)

    groups[0].clips[0].weight = 0
    groups[0].clips[0].isPlaying = false
    store.animationGroups.value = structuredClone(groups)

    await nextTick()

    await wrapper.get('button[aria-label="Previous animation"]').trigger('click')
    expect(setAnimationMix).toHaveBeenLastCalledWith('First', { Running: 1 }, 0, true)
    expect(groups[1].clips[0].time).toBe(0.5)
    wrapper.unmount()
    fixture.dispose()
  })
  it('resumes paused and finished clips, starts stopped groups, and leaves playing groups alone', async () => {
    const fixture = createFixture()
    const { store, groups, controlAnimation, setAnimationMix } = fixture
    const wrapper = mount(AnimationControls, { global: { provide: { [editorStoreKey as symbol]: store } } })

    groups[0].isPaused = true
    groups[0].clips[0].isPlaying = false
    store.animationGroups.value = structuredClone(groups)

    await nextTick()

    await wrapper.get('button[aria-label="Play animations"]').trigger('click')
    expect(controlAnimation.mock.calls).toEqual([['First', 'resume']])
    expect(groups[0].clips[0].time).toBe(0.5)
    expect(setAnimationMix).not.toHaveBeenCalled()

    groups[0].clips[0].playback = 'once'
    groups[0].clips[0].time = 2
    groups[0].clips[0].isPlaying = false
    groups[1].clips[0].weight = 0
    groups[1].clips[0].isPlaying = false
    store.animationGroups.value = structuredClone(groups)

    await nextTick()

    await wrapper.get('button[aria-label="Play animations"]').trigger('click')
    expect(controlAnimation).toHaveBeenLastCalledWith('First', 'resume')
    expect(setAnimationMix).toHaveBeenCalledExactlyOnceWith('Second', { Walking: 1 }, 0, true)
    wrapper.unmount()
    fixture.dispose()
  })
})
describe('Animations panel', () => {
  it('updates mixed progress between telemetry snapshots and cancels frame updates on unmount', async () => {
    const callbacks = new Map<number, FrameRequestCallback>()

    let frameCount = 0

    const requestFrame = vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      frameCount += 1

      callbacks.set(frameCount, callback)

      return frameCount
    })
    const cancelFrame = vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
      callbacks.delete(id)
    })
    const fixture = createFixture()
    const { wrapper, groups, store } = fixture
    const advanceFrame = async () => {
      const [id, callback] = callbacks.entries().next().value!

      callbacks.delete(id)
      callback(frameCount * 16)

      await nextTick()
    }

    try {
      groups[0].clips[0].weight = 0.5
      groups[0].clips[1].weight = 0.5
      groups[0].clips[1].isPlaying = true
      store.animationGroups.value = structuredClone(groups)

      await wrapper.get('#animation-mixer-tab').trigger('click')

      const slider = wrapper
        .findAllComponents(NSlider)
        .find((entry) => entry.attributes('aria-label') === 'Animation progress')!
      const snapshot = store.animationGroups.value

      expect(wrapper.text()).toContain('Mixed playback')

      for (const time of [0.6, 0.62, 1.98, 0.02]) {
        groups[0].clips[0].time = time

        await advanceFrame()
        expect(slider.props('value')).toBe(time / 2)
        expect(store.animationGroups.value).toBe(snapshot)
      }

      await wrapper.get('[aria-label="Pause playback"]').trigger('click')

      await advanceFrame()
      expect(slider.props('value')).toBe(0.01)

      groups[0].clips[0].time = 1.5
      store.animationGroups.value = structuredClone(groups)

      await nextTick()
      expect(slider.props('value')).toBe(0.75)

      await advanceFrame()
      expect(slider.props('value')).toBe(0.75)
    } finally {
      fixture.dispose()
      expect(cancelFrame).toHaveBeenCalled()
      expect(callbacks.size).toBe(0)
      requestFrame.mockRestore()
      cancelFrame.mockRestore()
    }
  })
  it('preserves dropdown options during playback updates while reflecting catalog and mix changes', async () => {
    const fixture = createFixture()
    const { wrapper, groups, store } = fixture

    try {
      await wrapper.get('#animation-mixer-tab').trigger('click')

      const dropdowns = wrapper.findAllComponents(NSelect)
      const previousOptions = dropdowns.map((dropdown) => dropdown.props('options'))
      const mixerDropdown = dropdowns.find((dropdown) => dropdown.attributes('aria-label') === 'Add animation to mix')!

      groups[0].clips[0].time = 1.25
      groups[0].clips[0].weight = 0.75
      store.animationGroups.value = structuredClone(groups)

      await nextTick()

      for (const [index, dropdown] of dropdowns.entries()) {
        expect(dropdown.props('options')).toBe(previousOptions[index])
      }

      expect(wrapper.text()).toContain('1.25 s')

      groups[0].label = 'Renamed character'

      groups[0].clips.push({ name: 'Jumping', duration: 1, playback: 'once', weight: 0, time: 0, isPlaying: false })

      store.animationGroups.value = structuredClone(groups)

      await nextTick()
      expect(dropdowns[0].props('options')).toContainEqual({ label: 'Renamed character', value: 'First' })
      expect(mixerDropdown.props('options')).toEqual([
        { label: 'Running', value: 'Running' },
        { label: 'Jumping', value: 'Jumping' }
      ])
      mixerDropdown.vm.$emit('update:value', 'Running')

      await nextTick()
      expect(mixerDropdown.props('options')).toEqual([{ label: 'Jumping', value: 'Jumping' }])

      await wrapper.get('[aria-label="Remove Running from mix"]').trigger('click')
      expect(mixerDropdown.props('options')).toContainEqual({ label: 'Running', value: 'Running' })
      groups[0].clips.pop()

      store.animationGroups.value = structuredClone(groups)

      await nextTick()
      expect(mixerDropdown.props('options')).toEqual([{ label: 'Running', value: 'Running' }])
    } finally {
      fixture.dispose()
    }
  })
  it('searches clips, crossfades, toggles looping, and controls transport for the selected character', async () => {
    const fixture = createFixture()
    const { wrapper } = fixture

    try {
      wrapper.findAllComponents(NSelect)[0].vm.$emit('update:value', 'Second')

      await nextTick()
      wrapper.findComponent(NInput).vm.$emit('update:value', 'run')

      await nextTick()
      expect(wrapper.findAll('.clip-row')).toHaveLength(1)

      await wrapper.get('[aria-label="Play Running"]').trigger('click')
      expect(fixture.setAnimationMix).toHaveBeenLastCalledWith('Second', { Running: 1 }, 0.2, true)

      await wrapper.get('[aria-label="Loop Running"]').trigger('click')
      expect(fixture.setAnimationPlayback).toHaveBeenLastCalledWith('Second', 'Running', 'loop')
      expect(wrapper.get('[aria-label="Loop Running"]').attributes('aria-pressed')).toBe('true')

      fixture.groups[1].clips[1].isPlaying = true
      fixture.store.animationGroups.value = structuredClone(fixture.groups)

      await nextTick()

      await wrapper.get('[aria-label="Pause playback"]').trigger('click')
      expect(fixture.controlAnimation).toHaveBeenLastCalledWith('Second', 'pause')

      await wrapper.get('[aria-label="Resume playback"]').trigger('click')
      expect(fixture.controlAnimation).toHaveBeenLastCalledWith('Second', 'resume')
      wrapper
        .findAllComponents(NSlider)
        .find((slider) => slider.attributes('aria-label') === 'Animation progress')!
        .vm.$emit('update:value', 0.75)
      expect(fixture.seekAnimation).toHaveBeenLastCalledWith('Second', 0.75)
      wrapper
        .findAllComponents(NSelect)
        .find((select) => select.attributes('aria-label') === 'Playback speed')!
        .vm.$emit('update:value', 2)
      expect(fixture.setAnimationSpeed).toHaveBeenLastCalledWith('Second', 2)

      await wrapper.get('[aria-label="Stop playback"]').trigger('click')
      expect(fixture.controlAnimation).toHaveBeenLastCalledWith('Second', 'stop')
      fixture.store.attach(makeRuntime())

      await nextTick()
      expect(wrapper.text()).toContain('No animations in this scene')
    } finally {
      fixture.dispose()
    }
  })
  it('adds only chosen clips, balances live contributions, removes clips, and preserves edits across telemetry refreshes', async () => {
    const fixture = createFixture()
    const { wrapper } = fixture

    try {
      await wrapper.get('#animation-mixer-tab').trigger('click')
      expect(wrapper.findAll('.mixer-row')).toHaveLength(1)
      wrapper
        .findAllComponents(NSelect)
        .find((select) => select.attributes('aria-label') === 'Add animation to mix')!
        .vm.$emit('update:value', 'Running')

      await nextTick()
      expect(wrapper.findAll('.mixer-row')).toHaveLength(2)
      wrapper
        .findAllComponents(NSlider)
        .find((slider) => slider.attributes('aria-label') === 'Running contribution')!
        .vm.$emit('update:value', 25)
      expect(fixture.setAnimationMix).toHaveBeenLastCalledWith('First', { Walking: 0.75, Running: 0.25 }, 0, false)

      fixture.store.animationGroups.value = structuredClone(fixture.groups)

      await nextTick()
      expect(wrapper.findAll('.weight-control output').map((output) => output.text())).toEqual(['75%', '25%'])
      expect(wrapper.text()).not.toContain('Apply blend')

      await wrapper.get('[aria-label="Remove Walking from mix"]').trigger('click')
      expect(fixture.setAnimationMix).toHaveBeenLastCalledWith('First', { Running: 1 }, 0, false)

      await wrapper.get('[aria-label="Remove Running from mix"]').trigger('click')
      expect(fixture.setAnimationMix).toHaveBeenLastCalledWith('First', {}, 0, false)
      expect(wrapper.findAll('.mixer-row')).toHaveLength(0)
    } finally {
      fixture.dispose()
    }
  })
  it('shows mixer and crossfade controls for a single object animation', () => {
    const fixture = createFixture(true)

    try {
      expect(fixture.wrapper.findAllComponents(SettingSlider)).toHaveLength(1)
      expect(fixture.wrapper.find('#animation-mixer-tab').exists()).toBe(true)
      expect(fixture.wrapper.text()).not.toContain('Simulation is running')
      expect(fixture.wrapper.find('[aria-label="Animation progress"]').exists()).toBe(true)
    } finally {
      fixture.dispose()
    }
  })
})
