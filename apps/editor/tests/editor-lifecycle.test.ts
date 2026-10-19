import { afterEach, describe, expect, it, vi } from 'vitest'
import { Editor } from '../src/runtime/editor-runtime'

afterEach(() => vi.unstubAllGlobals())

const createEnvironmentFixture = () => {
  const source = { kind: 'hdr', width: 2, height: 1, data: new Uint8Array(8) }
  const editor = Object.assign(Object.create(Editor.prototype), {
    isDestroyed: false,
    environmentGeneration: 0,
    sceneRenderer: { setEnvironment: vi.fn() },
    environmentLoader: { load: vi.fn().mockResolvedValue({ irradiance: source, radiance: source, rotation: 0 }) }
  })
  const createScene = (irradiance = 'diffuse') => ({ environment: { irradiance, radiance: 'specular', rotation: 0 } })

  return { editor, source, createScene }
}

describe('editor lifecycle', () => {
  it('cancels frame callbacks, listeners and pending work before destroying GPU resources', async () => {
    const calls: string[] = []
    const recordCall = (name: string) => () => calls.push(name)
    const onResize = vi.fn()
    const onPageHide = vi.fn()
    const stopLoop = vi.fn()
    const requests = new AbortController()

    window.addEventListener('resize', onResize)
    window.addEventListener('pagehide', onPageHide)

    let rejectThumbnail!: (reason: unknown) => void

    const thumbnail = new Promise((_resolve, reject) => {
      rejectThumbnail = reject
    })
    const assertion = expect(thumbnail).rejects.toThrow('destroyed')
    const editor = Object.assign(Object.create(Editor.prototype), {
      isDestroyed: false,
      environmentGeneration: 0,
      animationLoop: { stop: stopLoop },
      onPageHide,
      onResize,
      requests,
      thumbnailRequests: [{ reject: rejectThumbnail }],
      resizeObserver: { disconnect: recordCall('observer') },
      sceneLoader: { destroy: recordCall('workers') },
      imageLoader: { clear: recordCall('sources') },
      inputManager: { destroy: recordCall('input') },
      debugOverlay: { destroy: recordCall('overlay') },
      debugRenderer: { destroy: recordCall('debug') },
      sceneRenderer: { destroy: recordCall('renderer') },
      modelManager: { destroy: recordCall('models') },
      backend: { destroy: recordCall('backend') },
      settingsStore: { flush: recordCall('settings') }
    })

    editor.destroy()
    editor.destroy()
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('pagehide'))

    await assertion

    await expect(editor.captureThumbnail()).rejects.toThrow('destroyed')
    expect(stopLoop).toHaveBeenCalledOnce()
    expect(requests.signal.aborted).toBe(true)
    expect(onResize).not.toHaveBeenCalled()
    expect(onPageHide).not.toHaveBeenCalled()
    expect(calls).toEqual([
      'observer',
      'workers',
      'sources',
      'input',
      'overlay',
      'debug',
      'renderer',
      'models',
      'backend',
      'settings'
    ])
  })
  it('retains the previous environment when loading fails and allows retry', async () => {
    const { editor, createScene } = createEnvironmentFixture()

    vi.spyOn(console, 'warn').mockImplementation(() => {})
    editor.environmentLoader.load.mockRejectedValueOnce(new Error('transport failed'))

    await editor.applySceneEnvironment(createScene())
    expect(editor.sceneRenderer.setEnvironment).not.toHaveBeenCalled()

    await editor.applySceneEnvironment(createScene())
    expect(editor.sceneRenderer.setEnvironment).toHaveBeenCalledOnce()
  })
  it('ignores an older request after a newer environment is published', async () => {
    const { editor, source, createScene } = createEnvironmentFixture()

    let resolveSource!: (value: { irradiance: typeof source; radiance: typeof source; rotation: number }) => void

    editor.environmentLoader.load.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSource = resolve
        })
    )

    const pendingEnvironment = editor.applySceneEnvironment(createScene('old'))

    await editor.applySceneEnvironment(createScene('new'))
    resolveSource({ irradiance: source, radiance: source, rotation: 0 })

    await pendingEnvironment
    expect(editor.sceneRenderer.setEnvironment).toHaveBeenCalledOnce()
    expect(editor.loadedEnvironmentKey).toContain('new')
  })
  it('does not install an environment after destruction', async () => {
    const { editor, createScene } = createEnvironmentFixture()
    const request = editor.applySceneEnvironment(createScene())

    editor.isDestroyed = true

    await request
    expect(editor.sceneRenderer.setEnvironment).not.toHaveBeenCalled()
  })
})
