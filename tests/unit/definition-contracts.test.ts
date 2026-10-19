import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import type {
  BoneWeight,
  BoundingBoxDefinition,
  ModelDefinition,
  PipelineDefinition,
  VertexDescriptor
} from '@luz/formats'
import { Bone, Material, Mesh, Model, RenderPipeline } from '@luz/graphics'
import type { PipelineOptions } from '@luz/graphics'

describe('Document and runtime contracts', () => {
  it('round-trips mesh bounding boxes through the document contract', async () => {
    const boundingBox: BoundingBoxDefinition = { minimum: [-2, -3, -4], maximum: [5, 6, 7] }
    const definition: ModelDefinition = {
      type: 'model',
      meshes: { shape: { topology: 'triangles', vertices: [0, 0, 0, 0, 0, 0, 0, 1], boundingBox } }
    }
    const model = await Model.deserialize(definition)
    const serialized = model.serialize()
    const reloadedModel = await Model.deserialize(serialized)

    expect(model.meshes.shape.boundingBox).to.deep.equal(boundingBox)
    expect(serialized).to.have.deep.nested.property('meshes.shape.boundingBox', boundingBox)
    expect(serialized).not.to.have.nested.property('meshes.shape.bounds')
    expect(reloadedModel.meshes.shape.boundingBox).to.deep.equal(boundingBox)
  })
  it('keeps runtime methods and transient state out of model definitions', async () => {
    const definition: ModelDefinition = { type: 'model', meshes: {} }

    // @ts-expect-error Runtime palettes are not document fields.
    definition.boneMatrices = new Float32Array(16)

    // @ts-expect-error Definitions cannot contain runtime methods.
    definition.update = () => undefined

    const model = await Model.deserialize(definition)

    expect(model.boneMatrices).to.equal(undefined)
    expect(model.update).to.equal(Model.prototype.update)
    expect(model.serialize()).not.to.have.property('boneMatrices')
    expect(model.serialize()).not.to.have.property('update')
  })
  it('does not assign methods or GPU state from constructor options', () => {
    const getInjectedValue = () => ({ injected: true })
    const mesh = new Mesh({
      // @ts-expect-error Constructor options exclude methods.
      serialize: getInjectedValue
    })
    const material = new Material({
      // @ts-expect-error Constructor options exclude methods.
      serialize: getInjectedValue
    })
    const bone = new Bone({
      // @ts-expect-error Constructor options exclude methods.
      update: getInjectedValue
    })
    const pipeline = new RenderPipeline({
      vertexShader: 'vertex.glsl',
      fragmentShader: 'fragment.glsl',
      // @ts-expect-error Compiled resources are never constructor options.
      program: { injected: true }
    })

    expect(mesh.serialize).not.to.equal(getInjectedValue)
    expect(material.serialize).not.to.equal(getInjectedValue)
    expect(bone.update).not.to.equal(getInjectedValue)
    expect(pipeline.program).to.equal(null)

    // @ts-expect-error Pipeline creation requires shader names.
    const incompleteOptions: PipelineOptions = {}

    expect(incompleteOptions).to.deep.equal({})
  })
  it('keeps resolved mesh geometry separate from documents', async () => {
    const descriptor: VertexDescriptor = {
      byteOffset: 16,
      count: 1,
      byteStride: 12,
      attributes: { position: { format: 'float32x3', byteOffset: 0 } }
    }
    const resolvedGeometry = { vertices: new Float32Array([1, 2, 3]), descriptor }
    const mesh = new Mesh({ vertices: descriptor, resolvedGeometry })

    expect(mesh.resolvedGeometry).to.equal(resolvedGeometry)
    expect(mesh.serialize()).not.to.have.property('resolvedGeometry')
    expect((await Mesh.deserialize({ vertices: descriptor, resolvedGeometry })).resolvedGeometry).to.equal(undefined)
  })
  it('decodes pipeline documents with fixed color masks and rejects runtime fields', async () => {
    const definition: PipelineDefinition = {
      vertexShader: 'vertex.glsl',
      fragmentShader: 'fragment.glsl',
      colorMask: [true, false, true, false]
    }
    const pipeline = await RenderPipeline.deserialize(definition)
    const reloadedPipeline = await RenderPipeline.deserialize(pipeline.serialize())

    expect(reloadedPipeline.serialize()).to.deep.equal(pipeline.serialize())
    expect(pipeline.colorMask).not.to.equal(definition.colorMask)

    for (const invalidDefinition of [
      { ...definition, colorMask: [true] },
      { ...definition, colorMask: [true, true, true, 1] },
      { ...definition, clearColor: [0, 0, 0, NaN] },
      { ...definition, clearStencil: 1.5 },
      { ...definition, program: {} },
      { ...definition, resolveProgram: () => undefined },
      { fragmentShader: 'fragment.glsl' }
    ]) {
      await rejects(RenderPipeline.deserialize(invalidDefinition))
    }
  })
  it('requires exactly four skin influences and the declared vertex channel formats', () => {
    const weight: BoneWeight = { vertex: 0, indices: [0, 0, 0, 0], weights: [1, 0, 0, 0] }

    // @ts-expect-error Skinning always supplies four indices.
    weight.indices = [0, 0]

    const descriptor: VertexDescriptor = {
      byteOffset: 16,
      count: 1,
      byteStride: 12,
      attributes: {
        // @ts-expect-error Position attributes require three components.
        position: { format: 'float32x2', byteOffset: 0 }
      }
    }

    expect(weight.indices).to.have.length(2)
    expect(descriptor.attributes.position.format).to.equal('float32x2')
  })
})
