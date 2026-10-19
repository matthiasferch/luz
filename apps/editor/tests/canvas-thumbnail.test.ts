import { afterEach, describe, expect, it, vi } from 'vitest'
import { calculateThumbnailCrop, captureCanvasThumbnail } from '../src/editor/canvas-thumbnail'

afterEach(() => vi.restoreAllMocks())
describe('scene thumbnail framing', () => {
  it('center-crops wide viewports to 4:3', () => {
    expect(calculateThumbnailCrop(2400, 1080, 320, 240)).toEqual({
      x: 480,
      y: 0,
      width: 1440,
      height: 1080
    })
  })
  it('center-crops tall viewports to 4:3', () => {
    expect(calculateThumbnailCrop(1280, 1024, 320, 240)).toEqual({
      x: 0,
      y: 32,
      width: 1280,
      height: 960
    })
  })
  it('rejects empty source dimensions', () => {
    expect(() => calculateThumbnailCrop(0, 1080, 320, 180)).toThrow('positive')
  })
  it('takes an asynchronous bitmap snapshot before drawing a WebGL canvas', async () => {
    const drawImage = vi.fn()
    const thumbnail = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage })),
      toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['thumbnail'], { type: 'image/webp' })))
    } as unknown as HTMLCanvasElement

    vi.spyOn(document, 'createElement').mockReturnValue(thumbnail)

    const close = vi.fn()
    const bitmap = { close } as unknown as ImageBitmap
    const createBitmap = vi.fn(async () => bitmap) as unknown as typeof createImageBitmap
    const source = { width: 2400, height: 1080 } as HTMLCanvasElement

    const result = await captureCanvasThumbnail(source, 320, 240, createBitmap)

    expect(createBitmap).toHaveBeenCalledWith(source, 480, 0, 1440, 1080, {
      resizeWidth: 320,
      resizeHeight: 240,
      resizeQuality: 'high'
    })
    expect(drawImage).toHaveBeenCalledWith(bitmap, 0, 0)
    expect(close).toHaveBeenCalledOnce()
    expect(result.type).toBe('image/webp')
  })
  it('does not fall back to a blocking WebGL readback', async () => {
    const thumbnail = {
      width: 0,
      height: 0,
      getContext: vi.fn(() => ({ drawImage: vi.fn() }))
    } as unknown as HTMLCanvasElement

    vi.spyOn(document, 'createElement').mockReturnValue(thumbnail)

    await expect(
      captureCanvasThumbnail({ width: 320, height: 240 } as HTMLCanvasElement, 320, 240, null)
    ).rejects.toThrow('Asynchronous canvas snapshots are unavailable')
  })
})
