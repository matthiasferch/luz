import { flushPromises, mount } from '@vue/test-utils'
import { afterEach, expect, it, vi } from 'vitest'
import { createEditorStore, editorStoreKey } from '../src/editor/editor-store'
import StudioWorkspace from '../src/studio/StudioWorkspace.vue'

const mountWorkspace = (url: string) => {
  history.replaceState(null, '', url)

  return mount(StudioWorkspace, {
    global: { provide: { [editorStoreKey as symbol]: createEditorStore() }, stubs: { teleport: true } }
  })
}

afterEach(() => {
  history.replaceState(null, '', '/')
  localStorage.clear()
  vi.useRealTimers()
})
it('offers installation on a direct visit and remembers an explicit installation confirmation', async () => {
  const workspace = mountWorkspace('/')

  try {
    expect(workspace.find('.editor-shell').exists()).toBe(true)
    expect(workspace.find('[role="dialog"]').exists()).toBe(false)
    expect(workspace.get('a[download]').attributes('href')).toBe('/luz-exporter.zip')

    await workspace.get('.extension-panel .studio-actions button').trigger('click')
    expect(workspace.find('.extension-panel').exists()).toBe(false)
  } finally {
    workspace.unmount()
  }

  const reopened = mountWorkspace('/')

  try {
    await flushPromises()
    expect(reopened.find('.extension-panel').exists()).toBe(false)
  } finally {
    reopened.unmount()
  }
})
it('offers the pairing action on a Blender launch and recovers from a blocked or unresponsive window', async () => {
  vi.useFakeTimers()

  const closeWindow = vi.fn()
  const openWindow = vi
    .spyOn(window, 'open')
    .mockReturnValueOnce(null)
    .mockReturnValue({ closed: false, close: closeWindow } as unknown as Window)
  const workspace = mountWorkspace('/#connect=54321.' + 'a'.repeat(43))

  try {
    expect(location.hash).toBe('')
    expect(workspace.get('[role="dialog"]').text()).toContain('Connect your Blender scene')
    expect(workspace.find('a[download]').exists()).toBe(false)
    expect(openWindow).not.toHaveBeenCalled()

    await workspace.get('.studio-actions button').trigger('click')
    expect(workspace.get('[role="dialog"] [role="status"]').text()).toContain('blocked')

    await workspace.get('.studio-actions button').trigger('click')
    expect(openWindow).toHaveBeenCalledWith('http://127.0.0.1:54321/', '_blank', expect.any(String))
    expect(workspace.get('[role="dialog"] [role="status"]').text()).toBe('Connecting to Blender…')

    await vi.advanceTimersByTimeAsync(15000)
    expect(closeWindow).toHaveBeenCalled()
    expect(workspace.get('[role="dialog"] [role="status"]').text()).toContain('Open in luz')
    expect(workspace.get('.studio-actions button').text()).toBe('Connect Blender')
  } finally {
    workspace.unmount()
  }
})
