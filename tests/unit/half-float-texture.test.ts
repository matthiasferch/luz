import type { TextureFormat } from '@luz/formats'
import { expect } from 'chai'
import { Surface, WebGL2TextureManager } from '@luz/graphics'

describe('Half-float texture storage', () => {
  for (const [format, internal, external] of [
    ['color', 0x881a, 0x1908],
    ['red', 0x822d, 0x1903],
    ['redGreen', 0x822f, 0x8227]
  ] as const) {
    it(`allocates and uploads ${format} binary16 data`, () => {
      const allocations: unknown[][] = []
      const uploads: unknown[][] = []
      const gl = {
        RGBA16F: 0x881a,
        R16F: 0x822d,
        RG16F: 0x822f,
        RGBA: 0x1908,
        RED: 0x1903,
        RG: 0x8227,
        HALF_FLOAT: 0x140b,
        TEXTURE_2D: 0x0de1,
        TEXTURE0: 0x84c0,
        createTexture: () => ({}),

        activeTexture: () => {},

        bindTexture: () => {},

        texParameteri: () => {},

        texImage2D: (...parameters: unknown[]) => allocations.push(parameters),

        texSubImage2D: (...parameters: unknown[]) => uploads.push(parameters)
      } as unknown as WebGL2RenderingContext
      const manager = new WebGL2TextureManager(gl)
      const data = new Uint16Array([0x3c00, 0x4000, 0x4200, 0x4400])
      const texture = manager.create({ width: 1, height: 1, format: format as TextureFormat, precision: 16, data })

      expect(texture.components).to.equal(internal)
      expect(allocations[0][2]).to.equal(internal)
      expect(allocations[0].slice(6, 8)).to.deep.equal([external, gl.HALF_FLOAT])
      expect(uploads[0].slice(6, 8)).to.deep.equal([external, gl.HALF_FLOAT])
      expect(uploads[0][8]).to.equal(data)
    })
  }

  it('deserializes half-float bit patterns without changing their representation', async () => {
    const surface = await Surface.deserialize({ precision: 16, data: [0x3c00, 0xc000] })

    expect(surface.data).to.be.instanceOf(Uint16Array)
    expect(Array.from(surface.data as Uint16Array)).to.deep.equal([0x3c00, 0xc000])
  })
})
