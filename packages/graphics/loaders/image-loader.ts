import type { KTXContainer } from '@luz/formats'
import { decodeHDRtoSRGB8 } from './hdr-loader'
import { decodeKTX } from './ktx-loader'
import { readBinary } from './resource-readers'

export type ImageDecoder = (data: Blob, signal?: AbortSignal) => Promise<TexImageSource>
export type ImageSource =
  | { kind: 'image'; image: TexImageSource }
  | { kind: 'hdr'; data: Uint8Array; width: number; height: number }
  | { kind: 'ktx'; container: KTXContainer }
export interface ImageOptions {
  baseUrl: string
  decodeImage: ImageDecoder
  readBinary?: (url: string, signal?: AbortSignal) => Promise<ArrayBuffer>
}
export class ImageLoader {
  private readonly imageSources = new Map<string, Promise<TexImageSource>>()
  private readonly decodedSources = new Map<string, Promise<ImageSource>>()

  private requests = new AbortController()
  constructor(private readonly options: ImageOptions) {}

  loadImage(path: string): Promise<TexImageSource> {
    const url = new URL(path, this.options.baseUrl).toString()
    const cachedSource = this.imageSources.get(url)

    if (cachedSource) {
      return cachedSource
    }

    const signal = this.requests.signal
    const source = (async () => {
      signal.throwIfAborted()

      const data = await (this.options.readBinary ?? readBinary)(url, signal)

      signal.throwIfAborted()

      const image = await this.options.decodeImage(new Blob([data]), signal)

      signal.throwIfAborted()

      return image
    })()

    this.imageSources.set(url, source)
    void source.catch(() => {
      if (this.imageSources.get(url) === source) {
        this.imageSources.delete(url)
      }
    })

    return source
  }

  loadSource(path: string): Promise<ImageSource> {
    const url = new URL(path, this.options.baseUrl).toString()
    const cachedSource = this.decodedSources.get(url)

    if (cachedSource) {
      return cachedSource
    }

    const signal = this.requests.signal
    const source = (async (): Promise<ImageSource> => {
      signal.throwIfAborted()

      const pathname = new URL(url).pathname.toLowerCase()

      if (pathname.endsWith('.hdr') || pathname.endsWith('.ktx')) {
        const data = await (this.options.readBinary ?? readBinary)(url, signal)

        signal.throwIfAborted()

        return pathname.endsWith('.hdr')
          ? { kind: 'hdr', ...decodeHDRtoSRGB8(data) }
          : { kind: 'ktx', container: decodeKTX(data) }
      }

      return { kind: 'image', image: await this.loadImage(url) }
    })().then((value) => {
      signal.throwIfAborted()

      return value
    })

    this.decodedSources.set(url, source)
    void source.catch(() => {
      if (this.decodedSources.get(url) === source) {
        this.decodedSources.delete(url)
      }
    })

    return source
  }

  beginReload(): void {
    this.requests.abort()
    this.imageSources.clear()
    this.decodedSources.clear()

    this.requests = new AbortController()
  }

  clear(): void {
    this.beginReload()
  }
}
