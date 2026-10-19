import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { createDefaultMaterialGraph, Material } from '@luz/graphics'
import type { MaterialNode } from '@luz/formats'

describe('Material node contracts', () => {
  it('constrains inputs, properties and surfaces to the node kind', () => {
    const mapping: MaterialNode = {
      type: 'mapping',
      inputs: { vector: { value: [1, 2, 3] } },
      properties: { vectorType: 'POINT' }
    }
    const image: MaterialNode = { type: 'imageTexture', surface: { path: 'texture.png' } }

    // @ts-expect-error Math nodes cannot own texture surfaces.
    const invalidSurface: MaterialNode = { type: 'math', surface: {} }

    // @ts-expect-error Image texture documents require a surface.
    const missingSurface: MaterialNode = { type: 'imageTexture' }

    // @ts-expect-error Mapping has no color input.
    const invalidInput: MaterialNode = { type: 'mapping', inputs: { color: { value: [1, 1, 1] } } }

    // @ts-expect-error Rotation inversion is a boolean.
    const invalidProperty: MaterialNode = { type: 'vectorRotate', properties: { isInversionEnabled: 1 } }

    // @ts-expect-error Vector math cannot use scalar-only operations.
    const invalidOperation: MaterialNode = { type: 'vectorMath', properties: { operation: 'SINE' } }

    expect([
      mapping,
      image,
      invalidSurface,
      missingSurface,
      invalidInput,
      invalidProperty,
      invalidOperation
    ]).to.have.length(7)
  })
  it('validates every node during material decoding, including nodes not connected to outputs', async () => {
    for (const node of [
      null,
      { type: 'missing' },
      { type: 'imageTexture' },
      { type: 'math', surface: {} },
      { type: 'mapping', inputs: { color: { value: [1, 1, 1] } } },
      { type: 'vectorRotate', properties: { isInversionEnabled: 1 } },
      { type: 'vectorMath', properties: { operation: 'SINE' } },
      { type: 'geometry', properties: { toString: 'bad' } },
      { type: 'value', inputs: { value: { value: NaN } } },
      { type: 'value', inputs: { value: { value: [1] } } },
      { type: 'value', inputs: { value: { node: 'toString', output: 'Value' } } },
      { type: 'colorRamp', inputs: { 'position-1': { value: 0 } } }
    ]) {
      const graph = { ...createDefaultMaterialGraph(), nodes: { invalid: node } }

      await rejects(Material.deserialize({ graph }))
    }
  })
  it('preserves supported Blender properties and indexed ramp inputs through serialization', async () => {
    const graph = createDefaultMaterialGraph()

    graph.nodes.ramp = {
      type: 'colorRamp',
      properties: { interpolation: 'B_SPLINE', elementCount: 2 },
      inputs: {
        position0: { value: 0 },
        position1: { value: 1 },
        color0: { value: [0, 0, 0, 1] },
        color1: { value: [1, 1, 1, 1] }
      }
    }
    graph.nodes.normal = { type: 'normalMap', properties: { space: 'TANGENT' } }

    const material = await Material.deserialize({ graph })

    expect(material.serialize().graph).to.deep.equal(graph)
  })
})
