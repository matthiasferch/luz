import { decodeImage } from '@luz/browser'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadJson, loadJsonInWorker, loadText } from '../src/resources/scene-loader'
import { ImageLoader } from '@luz/graphics'
import { loadHDRtoSRGB8 } from '@luz/graphics'
import { loadKTX } from '@luz/graphics'

afterEach(() => vi.unstubAllGlobals())
describe('resource loading', () => {
  for (const [name, load] of Object.entries({ JSON: loadJson, text: loadText, HDR: loadHDRtoSRGB8, KTX: loadKTX })) {
    it(`reports the URL and HTTP status for a failed ${name} request`, async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('missing', { status: 404 })))

      await expect(load('https://example.test/missing')).rejects.toThrow('https://example.test/missing')

      await expect(load('https://example.test/missing')).rejects.toThrow('404')
    })
  }

  it('terminates an aborted JSON worker and rejects its request', async () => {
    const terminate = vi.fn()
    const postMessage = vi.fn()

    vi.stubGlobal(
      'Worker',
      class {
        terminate = terminate
        postMessage = postMessage
      }
    )

    const controller = new AbortController()
    const request = loadJsonInWorker('/scene.json', 'no-cache', controller.signal)
    const assertion = expect(request).rejects.toThrow('cancelled')

    controller.abort(new Error('cancelled'))

    await assertion

    expect(terminate).toHaveBeenCalledTimes(1)
    expect(postMessage).toHaveBeenCalledWith({
      url: new URL('/scene.json', window.location.href).toString(),
      cache: 'no-cache'
    })

    await expect(loadJsonInWorker('/scene.json', 'no-cache', controller.signal)).rejects.toThrow('cancelled')
    expect(postMessage).toHaveBeenCalledTimes(1)
  })
  it('terminates a JSON worker when posting the request fails', async () => {
    const terminate = vi.fn()

    vi.stubGlobal(
      'Worker',
      class {
        terminate = terminate
        postMessage() {
          throw new Error('post failed')
        }
      }
    )

    await expect(loadJsonInWorker('/scene.json')).rejects.toThrow('post failed')
    expect(terminate).toHaveBeenCalledTimes(1)
  })
  it('reloads image sources and does not let a stale failure evict the replacement', async () => {
    let resolveResponse!: (response: Response) => void

    const fetchSource = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            resolveResponse = resolve
          })
      )
      .mockResolvedValue(new Response(new Blob(['image'])))
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test')
    vi.stubGlobal('fetch', fetchSource)
    vi.stubGlobal(
      'Image',
      class {
        onload?: () => void
        onerror?: () => void
        set src(_value: string) {
          queueMicrotask(() => this.onload?.())
        }
      }
    )

    const loader = new ImageLoader({ baseUrl: document.baseURI, decodeImage })
    const pendingImage = loader.loadImage('/shared.png')
    const assertion = expect(pendingImage).rejects.toThrow('404')

    expect(loader.loadImage('/shared.png')).toBe(pendingImage)
    loader.beginReload()

    const replacement = await loader.loadImage('/shared.png')

    resolveResponse(new Response('missing', { status: 404 }))

    await assertion

    expect(await loader.loadImage('/shared.png')).toBe(replacement)
    expect(fetchSource).toHaveBeenCalledTimes(2)
    expect(fetchSource.mock.calls[1][1].cache).toBe('no-cache')
    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:test')
    loader.clear()
  })
  it('cancels pending image decoding and releases its blob URL', async () => {
    const revokeObjectUrl = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:pending')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(new Blob(['image']))))
    vi.stubGlobal(
      'Image',
      class {
        src = ''
        onload?: () => void
        onerror?: () => void
      }
    )

    const loader = new ImageLoader({ baseUrl: document.baseURI, decodeImage })
    const request = loader.loadImage('/pending.png')
    const assertion = expect(request).rejects.toThrow()

    await vi.waitFor(() => expect(URL.createObjectURL).toHaveBeenCalled())
    loader.clear()

    await assertion

    expect(revokeObjectUrl).toHaveBeenCalledWith('blob:pending')
  })
})
