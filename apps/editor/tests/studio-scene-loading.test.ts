import { flushPromises, mount } from '@vue/test-utils'
import { expect, it, vi } from 'vitest'
import { Editor } from '../src/runtime/editor-runtime'
import { createEditorStore, editorStoreKey } from '../src/editor/editor-store'
import * as catalog from '../src/editor/scene-catalog'
import * as thumbnails from '../src/editor/scene-thumbnails'
import * as publications from '../src/studio/scenes'
import StudioWorkspace from '../src/studio/StudioWorkspace.vue'
import { makeRuntime } from './editor-fixture'

it('shows progress throughout a picker load and retains the working scene if the next selection fails', async () => {
  const initialScene = {
    id: 'initial.scene.json',
    url: './initial.scene.json',
    label: 'Initial',
    byteLength: 64,
    isValid: true,
    entities: 0,
    models: 0,
    lights: 0,
    cameras: 0,
    hasEnvironment: false
  }
  const nextScene = { ...initialScene, id: 'next.scene.json', url: './next.scene.json', label: 'Next' }
  const createRuntime = (): Editor =>
    Object.assign(Object.create(Editor.prototype), makeRuntime(), { destroy: vi.fn() })
  const nextRuntime = Promise.withResolvers<Editor>()
  const thumbnail = Promise.withResolvers<void>()
  const publication = Promise.withResolvers<Awaited<ReturnType<typeof publications.getPublication>>>()
  const store = createEditorStore()

  vi.spyOn(catalog, 'loadSceneCatalog').mockResolvedValue([initialScene, nextScene])
  vi.spyOn(thumbnails, 'updateSceneThumbnail').mockImplementation(async (_editor, _scene, isCaptureForced) => {
    if (isCaptureForced) {
      await thumbnail.promise
    }
  })
  vi.spyOn(publications, 'getListings').mockResolvedValue([
    { id: 'published', project: 'project', title: 'Published', version: 1, isPublished: 1 }
  ])
  vi.spyOn(publications, 'getPublication').mockReturnValue(publication.promise)
  vi.spyOn(Editor, 'create')
    .mockResolvedValueOnce(createRuntime())
    .mockImplementationOnce(async (_selector, _url, reportLoading) => {
      reportLoading?.({ stage: 'Compiling models', completed: 1, total: 3 })

      return nextRuntime.promise
    })

  const workspace = mount(StudioWorkspace, {
    global: { provide: { [editorStoreKey as symbol]: store }, stubs: { teleport: true } }
  })

  const openPicker = async () => {
    await workspace.get('.toolbar-item').trigger('click')

    await workspace.get('.scene-menu button').trigger('click')

    await flushPromises()
  }

  try {
    await flushPromises()

    await openPicker()

    await workspace.findAll('.scene-row')[1].trigger('click')
    expect(workspace.get('.status-card').text()).toContain('Next')
    expect(workspace.get('.loading-spinner').isVisible()).toBe(true)
    thumbnail.resolve()

    await flushPromises()
    expect(workspace.get('.status-card').text()).toContain('Compiling models (1/3)')
    nextRuntime.resolve(createRuntime())

    await flushPromises()
    expect(workspace.find('.loading-spinner').exists()).toBe(false)
    expect(store.activeSceneId.value).toBe(nextScene.id)

    await openPicker()

    await workspace.get('.publication-row').trigger('click')
    expect(workspace.get('.status-card').text()).toContain('Fetching published scene')
    publication.reject(new Error('Scene unavailable'))

    await flushPromises()
    expect(workspace.get('.operation-error').text()).toContain('Scene unavailable')
    expect(workspace.find('.loading-spinner').exists()).toBe(false)
    expect(workspace.get('.editor-toolbar').isVisible()).toBe(true)
    expect(store.activeSceneId.value).toBe(nextScene.id)
  } finally {
    workspace.unmount()
    document.querySelector('#canvas')?.remove()
    localStorage.clear()
  }
})
