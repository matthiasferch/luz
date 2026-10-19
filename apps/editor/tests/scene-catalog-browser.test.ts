import { describe, expect, it, vi } from 'vitest'
import {
  SCENE_SELECTION_STORAGE_KEY,
  activateSceneAfterThumbnail,
  createActiveScenePoller,
  normalizeSceneCatalog,
  readSceneExportProgress,
  readStoredSceneId,
  createSceneExportUrl,
  selectInitialScene,
  storeSceneId,
  type SceneDescriptor
} from '../src/editor/scene-catalog'

const createSceneDescriptor = (id: string, isValid = true): SceneDescriptor => ({
  id,
  label: id,
  url: `./assets/scenes/${id}`,
  byteLength: 100,
  isValid: isValid,
  entities: 1,
  models: 1,
  lights: 0,
  cameras: 0,
  hasEnvironment: false
})

describe('scene selection', () => {
  it('restores a valid stored scene, then falls back to editor and alphabetical order', () => {
    const scenes = normalizeSceneCatalog([
      createSceneDescriptor('z.scene.json'),
      createSceneDescriptor('editor.scene.json'),
      createSceneDescriptor('a.scene.json')
    ])

    expect(selectInitialScene(scenes, 'z.scene.json')?.id).toBe('z.scene.json')
    expect(selectInitialScene(scenes, 'missing.scene.json')?.id).toBe('editor.scene.json')
    expect(selectInitialScene([createSceneDescriptor('b.scene.json'), createSceneDescriptor('a.scene.json')])?.id).toBe(
      'a.scene.json'
    )
    expect(selectInitialScene([createSceneDescriptor('editor.scene.json', false)])).toBeUndefined()
  })
  it('stores the selected relative scene id', () => {
    const values = new Map<string, string>()
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,

      setItem: (key: string, value: string) => values.set(key, value)
    }

    storeSceneId('nested/test.scene.json', storage)
    expect(readStoredSceneId(storage)).toBe('nested/test.scene.json')
    expect(values.get(SCENE_SELECTION_STORAGE_KEY)).toBe('nested/test.scene.json')
  })
  it('updates the current thumbnail before activating another scene', async () => {
    const events: string[] = []

    await activateSceneAfterThumbnail(
      'next.scene.json',
      async () => {
        events.push('thumbnail')
      },
      (id) => {
        events.push(`activate:${id}`)
      }
    )
    expect(events).toEqual(['thumbnail', 'activate:next.scene.json'])
  })
  it('still activates the selected scene when updating the thumbnail fails', async () => {
    const activate = vi.fn()

    await expect(
      activateSceneAfterThumbnail(
        'next.scene.json',
        async () => {
          throw new Error('capture failed')
        },
        activate
      )
    ).rejects.toThrow('capture failed')
    expect(activate).toHaveBeenCalledWith('next.scene.json')
  })
})
describe('active scene monitoring', () => {
  it('maps scene manifests to valid JSON export-status paths', () => {
    expect(createSceneExportUrl('./assets/scenes/pier.scene.json')).toBe('./assets/scenes/pier.export.json')
    expect(createSceneExportUrl('/nested/room.scene.json?cache=1')).toBe('/nested/room.export.json?cache=1')
    expect(() => createSceneExportUrl('/nested/room.json')).toThrow('must end in .scene.json')
  })
  it('reads and validates export progress', async () => {
    const progress = {
      status: 'exporting',
      scene: 'pier.scene.json',
      stage: 'Exporting models from Blender',
      completed: 2,
      total: 5
    }
    const fetcher = vi.fn(async () => new Response(JSON.stringify(progress))) as unknown as typeof fetch

    await expect(readSceneExportProgress('./assets/scenes/pier.scene.json', fetcher)).resolves.toEqual(progress)
    expect(fetcher).toHaveBeenCalledWith('./assets/scenes/pier.export.json', { cache: 'no-store' })

    const missingResponseFetcher = vi.fn(async () => new Response(null, { status: 204 })) as unknown as typeof fetch

    await expect(readSceneExportProgress('/pier.scene.json', missingResponseFetcher)).resolves.toBeNull()

    const invalidResponseFetcher = vi.fn(
      async () => new Response(JSON.stringify({ ...progress, completed: 6 }))
    ) as unknown as typeof fetch

    await expect(readSceneExportProgress('/pier.scene.json', invalidResponseFetcher)).rejects.toThrow(
      'progress is invalid'
    )
  })
  it('reloads in place for every selected-scene fingerprint change', async () => {
    const responses = ['one', 'one', 'two', 'three']
    const fetcher = vi.fn(async (input: RequestInfo | URL) =>
      String(input).endsWith('.export.json')
        ? new Response('', { status: 404 })
        : new Response('', { headers: { etag: responses.shift()! } })
    ) as unknown as typeof fetch
    const changed = vi.fn()
    const poll = createActiveScenePoller('./assets/scenes/active.scene.json', changed, fetcher)

    await poll()

    await poll()
    expect(changed).not.toHaveBeenCalled()

    await poll()

    await poll()
    expect(changed).toHaveBeenCalledTimes(2)
    expect(fetcher).toHaveBeenCalledTimes(8)
    expect(fetcher).toHaveBeenCalledWith('./assets/scenes/active.scene.json', { method: 'HEAD', cache: 'no-store' })
  })
  it('treats disappearance of the active scene as a change', async () => {
    let fingerprintRequests = 0

    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('.export.json')) {
        return new Response('', { status: 404 })
      }

      fingerprintRequests += 1

      return fingerprintRequests === 1
        ? new Response('', { headers: { etag: 'present' } })
        : new Response('', { status: 404 })
    }) as unknown as typeof fetch
    const changed = vi.fn()
    const poll = createActiveScenePoller('/active.scene.json', changed, fetcher)

    await poll()

    await poll()
    expect(changed).toHaveBeenCalledOnce()
  })
  it('retries a failed in-place reload on the next poll', async () => {
    let fingerprintRequests = 0

    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).endsWith('.export.json')) {
        return new Response('', { status: 404 })
      }

      fingerprintRequests += 1

      return new Response('', { headers: { etag: fingerprintRequests === 1 ? 'one' : 'two' } })
    }) as unknown as typeof fetch
    const changed = vi.fn().mockRejectedValueOnce(new Error('reload failed')).mockResolvedValueOnce(undefined)
    const poll = createActiveScenePoller('/active.scene.json', changed, fetcher)

    await poll()

    await poll()

    await poll()
    expect(changed).toHaveBeenCalledTimes(2)
  })
  it('reports changed export stages without interrupting fingerprint monitoring', async () => {
    const exportResponses = [
      null,
      { status: 'exporting', scene: 'pier.scene.json', stage: 'Exporting models from Blender', completed: 1, total: 3 },
      { status: 'exporting', scene: 'pier.scene.json', stage: 'Exporting models from Blender', completed: 1, total: 3 },
      { status: 'exporting', scene: 'pier.scene.json', stage: 'Finalizing Blender export' },
      null
    ]
    const fetcher = vi.fn(async (input: RequestInfo | URL) => {
      if (!String(input).endsWith('.export.json')) {
        return new Response('', { headers: { etag: 'scene' } })
      }

      const progress = exportResponses.shift()

      return progress ? new Response(JSON.stringify(progress)) : new Response('', { status: 404 })
    }) as unknown as typeof fetch
    const progressChanged = vi.fn()
    const poll = createActiveScenePoller('/pier.scene.json', vi.fn(), fetcher, progressChanged)

    for (let index = 0; index < 5; index++) {
      await poll()
    }

    expect(progressChanged.mock.calls.map(([progress]) => progress)).toEqual([
      null,
      { status: 'exporting', scene: 'pier.scene.json', stage: 'Exporting models from Blender', completed: 1, total: 3 },
      { status: 'exporting', scene: 'pier.scene.json', stage: 'Finalizing Blender export' },
      null
    ])
  })
})
