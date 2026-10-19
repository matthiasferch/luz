import { expect } from 'chai'
import { ModelLoader, WebGL2PrimitiveManager } from '@luz/graphics'
import { GEOMETRY_HEADER_LENGTH, GEOMETRY_MAGIC, GEOMETRY_MAJOR_VERSION, GEOMETRY_MINOR_VERSION } from '@luz/formats'
import { Entity } from '@luz/core'

const createGeometry = (indexFormat: 'uint16' | 'uint32' = 'uint16') => {
  const indexOffset = GEOMETRY_HEADER_LENGTH + 3 * 32
  const indexSize = indexFormat === 'uint16' ? 2 : 4
  const buffer = new ArrayBuffer(indexOffset + 3 * indexSize)
  const header = new DataView(buffer)

  new Uint8Array(buffer, 0, 4).set(Array.from(GEOMETRY_MAGIC, (character) => character.charCodeAt(0)))
  header.setUint16(4, GEOMETRY_MAJOR_VERSION, true)
  header.setUint16(6, GEOMETRY_MINOR_VERSION, true)
  header.setUint32(8, buffer.byteLength, true)
  header.setUint32(12, 0, true)
  new Float32Array(buffer, GEOMETRY_HEADER_LENGTH, 24).set([
    0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1
  ])

  const IndexArray = indexFormat === 'uint16' ? Uint16Array : Uint32Array

  new IndexArray(buffer, indexOffset, 3).set([0, 1, 2])

  const data = {
    type: 'model',
    geometry: { uri: 'triangle.geometry', byteLength: buffer.byteLength },
    meshes: {
      triangle: {
        topology: 'triangles',
        vertices: {
          byteOffset: GEOMETRY_HEADER_LENGTH,
          count: 3,
          byteStride: 32,
          attributes: {
            position: { format: 'float32x3', byteOffset: 0 },
            normal: { format: 'float32x3', byteOffset: 12 },
            textureCoordinates: { format: 'float32x2', byteOffset: 24 }
          }
        },
        indices: { byteOffset: indexOffset, count: 3, format: indexFormat }
      }
    }
  }

  return { buffer, data }
}

const expectFailure = async (promise: Promise<unknown>, message: string) => {
  try {
    await promise
    expect.fail('Expected geometry loading to fail')
  } catch (error) {
    expect((error as Error).message).to.contain(message)
  }
}

describe('Binary geometry loading', () => {
  it('deduplicates source IO per reload while creating independent model instances', async () => {
    const { buffer, data } = createGeometry()

    let jsonLoads = 0
    let binaryLoads = 0

    const loader = new ModelLoader(
      async () => {
        jsonLoads += 1

        return data
      },
      async () => {
        binaryLoads += 1

        return buffer
      }
    )

    const [firstModel, secondModel] = await Promise.all([
      loader.load('https://example.test/models/triangle.model.json'),
      loader.load('https://example.test/models/triangle.model.json')
    ])

    expect(firstModel).not.to.equal(secondModel)
    expect(firstModel.meshes.triangle.resolvedGeometry!.vertices.buffer).to.equal(buffer)
    expect(secondModel.meshes.triangle.resolvedGeometry!.vertices.buffer).to.equal(buffer)
    expect(loader.findAssetIdentity(firstModel)).to.deep.equal(loader.findAssetIdentity(secondModel))
    expect(jsonLoads).to.equal(1)
    expect(binaryLoads).to.equal(1)
    loader.beginReload()

    const reloaded = await loader.load('https://example.test/models/triangle.model.json')

    expect(loader.findAssetIdentity(reloaded)).to.deep.equal(loader.findAssetIdentity(firstModel))
    expect(jsonLoads).to.equal(2)
    expect(binaryLoads).to.equal(2)
  })

  for (const format of ['uint16', 'uint32'] as const) {
    it(`loads valid ${format} indexed geometry as typed views`, async () => {
      const { buffer, data } = createGeometry(format)
      const loader = new ModelLoader(
        async () => data,
        async () => buffer
      )
      const model = await loader.load('https://example.test/models/triangle.model.json')
      const geometry = model.meshes.triangle.resolvedGeometry!

      expect(geometry.vertices.buffer).to.equal(buffer)
      expect(geometry.indices).to.be.instanceOf(format === 'uint16' ? Uint16Array : Uint32Array)
      expect(Array.from(geometry.indices!)).to.deep.equal([0, 1, 2])

      const entity = await Entity.deserialize({ components: { Model: model } })

      expect(entity.components.Model).to.equal(model)
      expect((entity.components.Model as any).meshes.triangle.resolvedGeometry.vertices.buffer).to.equal(buffer)
    })
  }

  it('rejects bad magic', async () => {
    const { buffer, data } = createGeometry()

    new Uint8Array(buffer)[0] = 0

    await expectFailure(
      new ModelLoader(
        async () => data,
        async () => buffer
      ).load('model.json'),
      'invalid magic'
    )
  })
  it('rejects unsupported versions', async () => {
    const { buffer, data } = createGeometry()

    new DataView(buffer).setUint16(4, 2, true)

    await expectFailure(
      new ModelLoader(
        async () => data,
        async () => buffer
      ).load('model.json'),
      'unsupported version'
    )
  })
  it('rejects declared length mismatches', async () => {
    const { buffer, data } = createGeometry()

    new DataView(buffer).setUint32(8, buffer.byteLength - 1, true)

    await expectFailure(
      new ModelLoader(
        async () => data,
        async () => buffer
      ).load('model.json'),
      'length mismatch'
    )
  })
  it('rejects misaligned vertex views', async () => {
    const { buffer, data } = createGeometry()

    data.meshes.triangle.vertices.byteOffset = 18

    await expectFailure(
      new ModelLoader(
        async () => data,
        async () => buffer
      ).load('model.json'),
      '4-byte aligned'
    )
  })
  it('rejects out-of-range index views', async () => {
    const { buffer, data } = createGeometry()

    data.meshes.triangle.indices.count = 100

    await expectFailure(
      new ModelLoader(
        async () => data,
        async () => buffer
      ).load('model.json'),
      'outside the geometry file'
    )
  })
  it('keeps legacy inline geometry available', async () => {
    const loader = new ModelLoader()
    const model = await loader.loadData(
      {
        type: 'model',
        meshes: { triangle: { topology: 'triangles', vertices: [0, 0, 0, 0, 0, 1, 0, 0] } }
      },
      'legacy.model.json'
    )

    expect(model.meshes.triangle.vertices).to.deep.equal([0, 0, 0, 0, 0, 1, 0, 0])
    expect(model.meshes.triangle.resolvedGeometry).to.equal(undefined)
  })
})
describe('Binary geometry rendering', () => {
  for (const indexType of [0x1403, 0x1405]) {
    it(`draws indexed primitives with GL index type 0x${indexType.toString(16)}`, () => {
      const calls: any[] = []
      const gl = {
        TRIANGLES: 4,
        bindVertexArray: () => undefined,

        drawElements: (...parameters: any[]) => calls.push(parameters)
      }
      const manager = new WebGL2PrimitiveManager(gl as any)

      manager.render({
        vertexArray: { topology: 'triangles', vertexCount: 3, indexCount: 3, indexType },
        material: {}
      } as any)
      expect(calls).to.deep.equal([[4, 3, indexType, 0]])
    })
  }
})
