import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { createDefaultMaterialGraph, GraphCompiler } from '@luz/graphics'
import type { Texture, TextureCompiler } from '@luz/graphics'
import { createDouble } from '../fixtures/test-double'
import { generateGraphSource } from '../../packages/graphics/compilers/material/generate-source'
import { createTopologyKey } from '../../packages/graphics/compilers/material/topology'
import { compileGraphBindings } from '../../packages/graphics/compilers/material/compile-bindings'

const createTexturedGraph = () => {
  const graph = createDefaultMaterialGraph()

  graph.nodes.image = { type: 'imageTexture', surface: { path: 'first.png', colorSpace: 'sRGB' } }
  graph.outputs.baseColor = { node: 'image', output: 'Color' }
  graph.outputs.alpha = { node: 'image', output: 'Alpha' }

  return graph
}

describe('Material compilation stages', () => {
  it('generates source and texture requests without allocating resources or mutating the graph', async () => {
    const graph = createTexturedGraph()
    const originalGraph = JSON.stringify(graph)
    const source = generateGraphSource(graph)
    const topology = createTopologyKey(graph)
    const texture = createDouble<Texture>({})
    const requests: string[] = []
    const compiler = createDouble<TextureCompiler>({
      compile: async (surface, colorSpace) => {
        requests.push(surface.path!)
        expect(colorSpace).to.equal('sRGB')

        return texture
      }
    })

    expect(Object.keys(source.textures)).to.deep.equal(['materialGraphTexture0'])
    expect(source.uniforms).not.to.have.property('materialGraphTexture0')
    expect(JSON.stringify(graph)).to.equal(originalGraph)

    const bindings = await compileGraphBindings(source, compiler)

    expect(requests).to.deep.equal(['first.png'])
    expect(bindings.uniforms.materialGraphTexture0).to.equal(texture)
    expect(bindings.textures).to.deep.equal([texture])
    expect(source.uniforms).not.to.have.property('materialGraphTexture0')

    graph.nodes.image.surface!.path = 'replacement.png'
    graph.outputs.roughness = { value: 0.9 }

    const replacement = generateGraphSource(graph)

    expect(replacement.source).to.equal(source.source)
    expect(createTopologyKey(graph)).to.equal(topology)
    expect(replacement.uniforms).not.to.deep.equal(source.uniforms)
    expect(replacement.textures.materialGraphTexture0.path).to.equal('replacement.png')
  })
  it('waits for outstanding bindings and releases successful allocations after a sibling failure', async () => {
    const graph = createTexturedGraph()
    const texture = createDouble<Texture>({})
    const released: Texture[] = []
    const failure = new Error('texture failed')

    let resolveTexture!: (texture: Texture) => void

    const pendingTexture = new Promise<Texture>((resolve) => {
      resolveTexture = resolve
    })

    graph.nodes.secondImage = { type: 'imageTexture', surface: { path: 'second.png' } }
    graph.outputs.roughness = { node: 'secondImage', output: 'Color' }

    const compiler = createDouble<TextureCompiler>({
      compile: async (surface) => {
        if (surface.path === 'second.png') {
          throw failure
        }

        return pendingTexture
      },

      release: (allocation) => {
        released.push(allocation)
      }
    })
    const request = compileGraphBindings(generateGraphSource(graph), compiler)
    const assertion = rejects(request, (error) => error === failure)

    await Promise.resolve()
    expect(released).to.deep.equal([])
    resolveTexture(texture)

    await assertion
    expect(released).to.deep.equal([texture])
  })
  it('rejects invalid graphs and excessive texture counts before allocating bindings', async () => {
    let allocationCount = 0

    const textures = createDouble<TextureCompiler>({
      compile: async () => {
        allocationCount++

        return createDouble<Texture>({})
      }
    })
    const graph = createTexturedGraph()
    const compiler = new GraphCompiler(textures, 0)

    await rejects(compiler.compile(graph), /configured limit/)

    graph.nodes.image.inputs = { vector: { node: 'missing', output: 'Vector' } }

    await rejects(compiler.compile(graph), /missing/)
    expect(allocationCount).to.equal(0)
  })
  it('releases late bindings when compilation is invalidated and supports a subsequent retry', async () => {
    const texture = createDouble<Texture>({})
    const released: Texture[] = []

    let resolveTexture!: (texture: Texture) => void

    const pendingTexture = new Promise<Texture>((resolve) => {
      resolveTexture = resolve
    })
    const compiler = new GraphCompiler(
      createDouble<TextureCompiler>({
        compile: async () => pendingTexture,

        release: (allocation) => {
          released.push(allocation)
        }
      })
    )
    const graph = createTexturedGraph()
    const request = compiler.compile(graph)
    const assertion = rejects(request, /invalidated/)

    compiler.clear()
    resolveTexture(texture)

    await assertion
    expect(released).to.deep.equal([texture])

    const replacement = await compiler.compile(graph)

    expect(replacement.uniforms.materialGraphTexture0).to.equal(texture)
    compiler.release(replacement)
    compiler.release(replacement)
    expect(released).to.deep.equal([texture, texture])
  })
})
