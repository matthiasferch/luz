import { expect } from 'chai'
import { WebGL2BufferManager, WebGL2PrimitiveManager, WebGL2RenderBackend, RenderStatistics, Mesh } from '@luz/graphics'
import type { RenderMaterial, VertexBuffer, PrimitiveOptions } from '@luz/graphics'

const createFixture = () => {
  const allocations: number[] = []
  const uploads: { buffer: unknown; length: number }[] = []
  const draws: number[][] = []
  const deletedBuffers: unknown[] = []
  const deletedArrays: unknown[] = []
  const attributes: number[][] = []
  const divisors: number[][] = []
  const windings: number[] = []

  let boundBuffer: unknown
  let boundArray: unknown
  let isAllocationRejected = false

  const context = {
    ARRAY_BUFFER: 1,
    FLOAT: 2,
    DYNAMIC_DRAW: 3,
    TRIANGLES: 4,
    MAX_VERTEX_ATTRIBS: 5,
    CCW: 6,
    CW: 7,
    UNSIGNED_SHORT: 8,
    STATIC_DRAW: 9,
    ELEMENT_ARRAY_BUFFER: 10,
    getParameter: () => 16,

    createVertexArray: () => ({}),

    createBuffer: () => ({}),

    bindVertexArray(array: unknown) {
      boundArray = array
    },

    bindBuffer(_target: number, buffer: unknown) {
      boundBuffer = buffer
    },

    enableVertexAttribArray() {},

    disableVertexAttribArray() {},

    vertexAttrib3f() {},

    vertexAttrib4f() {},

    vertexAttribPointer(...values: number[]) {
      attributes.push(values)
    },

    vertexAttribDivisor(...values: number[]) {
      divisors.push(values)
    },

    bufferData(_target: number, capacity: number) {
      if (isAllocationRejected) {
        throw new Error('Allocation failed')
      }

      allocations.push(capacity)
    },

    bufferSubData(_target: number, _offset: number, values: ArrayBufferView) {
      uploads.push({ buffer: boundBuffer, length: values.byteLength })
    },

    drawArraysInstanced(_topology: number, _first: number, count: number, instances: number) {
      draws.push([count, instances])
    },

    drawArrays(_topology: number, _first: number, count: number) {
      draws.push([count])
    },

    drawElements(_topology: number, count: number, type: number) {
      draws.push([count, type])
    },

    drawElementsInstanced(_topology: number, count: number, type: number, _offset: number, instances: number) {
      draws.push([count, type, instances])
    },

    frontFace(winding: number) {
      windings.push(winding)
    },

    deleteVertexArray(resource: unknown) {
      deletedArrays.push(resource)
    },

    deleteBuffer(resource: unknown) {
      deletedBuffers.push(resource)
    }
  }
  const gl = context as unknown as WebGL2RenderingContext
  const buffers = new WebGL2BufferManager(gl)
  const primitives = new WebGL2PrimitiveManager(gl)
  const backend = Object.create(WebGL2RenderBackend.prototype) as WebGL2RenderBackend

  Object.assign(backend, { context: gl, primitives, buffers, statistics: new RenderStatistics() })

  return {
    buffers,
    primitives,
    backend,
    context,
    allocations,
    uploads,
    draws,
    deletedArrays,
    deletedBuffers,
    attributes,
    divisors,
    windings,
    getBoundArray: () => boundArray,

    rejectAllocation: () => {
      isAllocationRejected = true
    }
  }
}

const createOptions = (buffer: VertexBuffer, vertexCount = 6): PrimitiveOptions => ({
  topology: 'triangles',
  vertexCount,
  attributes: [
    { buffer, location: 7, format: 'float32x3', byteStride: 24, divisor: 1 },
    { buffer, location: 8, format: 'float32x3', byteStride: 24, byteOffset: 12, divisor: 1 }
  ]
})

describe('Dynamic primitives', () => {
  it('reuses buffer capacity, grows only when needed, and submits populated instance ranges', () => {
    const fixture = createFixture()
    const buffer = fixture.buffers.create('vertexBuffer')
    const primitive = fixture.primitives.create(createOptions(buffer))
    const cone = fixture.primitives.create(createOptions(buffer, 96))

    fixture.buffers.update(buffer, new Float32Array(6))
    fixture.backend.draw(primitive, { instanceCount: 1 })
    fixture.backend.draw(cone, { instanceCount: 1 })
    fixture.buffers.update(buffer, new Float32Array(12))
    fixture.backend.draw(primitive, { instanceCount: 2 })
    expect(fixture.allocations).to.deep.equal([256])
    fixture.buffers.update(buffer, new Float32Array(600))
    expect(fixture.allocations).to.deep.equal([256, 4096])
    fixture.buffers.update(buffer, new Float32Array(0))
    fixture.backend.draw(primitive, { instanceCount: 0 })
    expect(buffer.byteLength).to.equal(0)
    fixture.buffers.update(buffer, new Float32Array(6))
    fixture.backend.draw(primitive, { instanceCount: 1 })
    expect(fixture.draws).to.deep.equal([
      [6, 1],
      [96, 1],
      [6, 2],
      [6, 1]
    ])
    expect(fixture.uploads.map(({ length }) => length)).to.deep.equal([24, 48, 2400, 24])
    expect(fixture.backend.statistics.renderedPrimitiveCount).to.equal(4)
    expect(buffer.capacity).to.equal(4096)
    expect(fixture.getBoundArray()).to.equal(null)
  })
  it('borrows shared vertex buffers and releases each owned vertex array exactly once', () => {
    const fixture = createFixture()
    const buffer = fixture.buffers.create('vertexBuffer')
    const firstPrimitive = fixture.primitives.create(createOptions(buffer))
    const secondPrimitive = fixture.primitives.create(createOptions(buffer))

    fixture.primitives.destroy(firstPrimitive)
    fixture.primitives.destroy(firstPrimitive)
    fixture.backend.draw(firstPrimitive, { instanceCount: 1 })
    expect(fixture.draws).to.have.length(0)
    expect(fixture.deletedArrays).to.have.length(1)
    expect(fixture.deletedBuffers).to.have.length(0)
    fixture.backend.draw(secondPrimitive, { instanceCount: 1 })
    fixture.primitives.destroyAll()
    fixture.primitives.destroyAll()
    fixture.buffers.destroyAll()
    fixture.buffers.destroy(buffer)
    expect(fixture.deletedArrays).to.have.length(2)
    expect(fixture.deletedBuffers).to.deep.equal([buffer])
    expect(buffer.capacity).to.equal(0)
    expect(() => fixture.buffers.update(buffer, new Float32Array(6))).to.throw('destroyed buffer')
  })
  it('configures per-vertex and per-instance attributes without generating mesh tangent data', () => {
    const fixture = createFixture()
    const buffer = fixture.buffers.create('vertexBuffer')

    fixture.primitives.create({
      topology: 'triangles',
      vertexCount: 3,
      attributes: [
        { buffer, location: 0, format: 'float32x2' },
        { buffer, location: 3, format: 'float32x4', byteOffset: 8, byteStride: 24, divisor: 2 }
      ]
    })
    expect(fixture.attributes).to.deep.equal([
      [0, 2, 2, false, 0, 0],
      [3, 4, 2, false, 24, 8]
    ])
    expect(fixture.divisors).to.deep.equal([
      [0, 0],
      [3, 2]
    ])
    expect(fixture.allocations).to.have.length(0)
  })
  it('restores ordinary winding after mirrored draws and counts only nonempty draws', () => {
    const fixture = createFixture()
    const buffer = fixture.buffers.create('vertexBuffer')
    const primitive = fixture.primitives.create(createOptions(buffer))
    const emptyPrimitive = fixture.primitives.create({ topology: 'triangles', vertexCount: 0, attributes: [] })

    fixture.backend.draw(primitive, { instanceCount: 1, isMirrored: true })
    fixture.backend.draw(primitive, { instanceCount: 1 })
    fixture.backend.draw(primitive)
    fixture.backend.draw(emptyPrimitive)
    expect(fixture.windings).to.deep.equal([fixture.context.CW, fixture.context.CCW])
    expect(fixture.draws).to.deep.equal([[6, 1], [6, 1], [6]])
    expect(fixture.backend.statistics.renderedPrimitiveCount).to.equal(3)
  })
  it('rebinds reused vertex buffers after mesh setup changes the array-buffer binding', () => {
    const fixture = createFixture()
    const buffer = fixture.buffers.create('vertexBuffer')

    fixture.buffers.update(buffer, new Float32Array(6))
    fixture.context.bindBuffer(fixture.context.ARRAY_BUFFER, {})
    fixture.buffers.update(buffer, new Float32Array(6))
    expect(fixture.uploads.every((upload) => upload.buffer === buffer)).to.equal(true)
  })
  it('does not publish increased capacity when allocation fails', () => {
    const fixture = createFixture()
    const buffer = fixture.buffers.create('vertexBuffer')

    fixture.buffers.update(buffer, new Float32Array(6))
    fixture.rejectAllocation()
    expect(() => fixture.buffers.update(buffer, new Float32Array(600))).to.throw('Allocation failed')
    expect(buffer.capacity).to.equal(256)
    expect(buffer.byteLength).to.equal(24)
  })
  it('rejects invalid attribute layouts and draw counts', () => {
    const fixture = createFixture()
    const buffer = fixture.buffers.create('vertexBuffer')
    const options = createOptions(buffer)

    for (const attribute of [
      { location: -1 },
      { location: 16 },
      { byteStride: 256 },
      { byteOffset: -4 },
      { byteOffset: 3 },
      { divisor: -1 },
      { divisor: 0.5 }
    ]) {
      expect(() =>
        fixture.primitives.create({ ...options, attributes: [{ ...options.attributes[0], ...attribute }] })
      ).to.throw('vertex attribute')
    }

    expect(() => fixture.primitives.create({ ...options, vertexCount: -1 })).to.throw('vertex count')
    expect(() =>
      fixture.primitives.create({ ...options, attributes: [options.attributes[0], options.attributes[0]] })
    ).to.throw('vertex attribute')

    const primitive = fixture.primitives.create(options)

    for (const instanceCount of [-1, 1.5, NaN, Infinity]) {
      expect(() => fixture.primitives.render(primitive, instanceCount)).to.throw('instance count')
    }
  })
  it('supports indexed instancing while retaining ordinary indexed mesh drawing', () => {
    const fixture = createFixture()
    const mesh = new Mesh({
      topology: 'triangles',
      vertices: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
      indices: [0, 1, 2]
    })
    const primitive = fixture.primitives.create(mesh, {} as RenderMaterial)

    fixture.primitives.render(primitive)
    fixture.primitives.render(primitive, 5)
    expect(fixture.draws).to.deep.equal([
      [3, fixture.context.UNSIGNED_SHORT],
      [3, fixture.context.UNSIGNED_SHORT, 5]
    ])
  })
})
