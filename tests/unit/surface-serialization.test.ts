import { rejects } from 'node:assert/strict'
import { expect } from 'chai'
import { Surface } from '@luz/graphics'
import type { PixelData } from '@luz/graphics'
import { Matrix2, Matrix3, Matrix4 } from '@luz/math'

describe('Surface documents', () => {
  for (const [precision, pixels] of [
    [8, new Uint8Array([0, 1, 128, 255])],
    [16, new Uint16Array([0, 0x8000, 0x3c00, 0x7e01])],
    [24, new Uint32Array([0, 1, 0x80000000, 0xffffffff])],
    [32, new Float32Array([0, 0.1, -2.5, 65504])]
  ] as const) {
    it(`round-trips ${precision}-bit pixel storage through JSON`, async () => {
      const source = new Surface({ precision, data: pixels, format: precision === 24 ? 'depth' : 'color' })
      const document = source.serialize()
      const restored = await Surface.deserialize(JSON.parse(JSON.stringify(document)))
      const restoredPixels = restored.data as PixelData

      expect(document.data).to.be.an('array')
      expect(restoredPixels.constructor).to.equal(pixels.constructor)
      expect([...new Uint8Array(restoredPixels.buffer)]).to.deep.equal([...new Uint8Array(pixels.buffer)])
      expect(restoredPixels).not.to.equal(pixels)
      expect(restored.serialize()).to.deep.equal(document)
    })
  }

  it('keeps resolved images out of documents and requires a reloadable source path', () => {
    const image = { width: 4, height: 8 } as HTMLImageElement
    const surface = new Surface({ path: 'texture.png', data: image, width: 4, height: 8 })

    expect(surface.serialize()).to.include({ path: 'texture.png', width: 4, height: 8 })
    expect(surface.serialize()).not.to.have.property('data')
    expect(() => new Surface({ data: image }).serialize()).to.throw('requires a path')
    expect(() => new Surface({ precision: 32, data: new Float32Array([Infinity]) }).serialize()).to.throw('finite')
  })
  it('rejects corrupted pixel objects, invalid components and runtime fields', async () => {
    for (const definition of [
      { data: { 0: 255 } },
      { data: [256] },
      { data: [-1] },
      { precision: 16, data: [65536] },
      { precision: 32, data: [1e100] },
      { precision: 32, data: [NaN] },
      { precision: 12 },
      { format: 'invalid' },
      { width: 0 },
      { height: 1.5 },
      { serialize: () => ({}) }
    ]) {
      await rejects(Surface.deserialize(definition), /Surface|surface/)
    }
  })
  it('does not accept runtime methods through constructor options', () => {
    const options = { path: 'texture.png', serialize: () => ({ broken: true }) }
    const surface = new Surface(options)

    expect(surface.serialize()).not.to.have.property('broken')
    expect(surface.serialize()).to.have.property('path', 'texture.png')
  })
})
describe('Matrix documents', () => {
  for (const Matrix of [Matrix2, Matrix3, Matrix4]) {
    it(`serializes ${Matrix.name} as a numeric array`, async () => {
      const matrix = new Matrix()

      matrix[0] = 0.5

      const document = matrix.serialize()
      const restored = await Matrix.deserialize(JSON.parse(JSON.stringify(document)))

      expect(document).to.be.an('array')
      expect([...restored]).to.deep.equal([...matrix])
    })
  }
})
