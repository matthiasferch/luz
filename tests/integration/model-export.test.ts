import type {
  RenderBackend,
  MaterialCompiler,
  MeshCompiler,
  SurfaceOptions,
  Texture,
  Primitive,
  MaterialGraph
} from '@luz/graphics'
import { createDouble } from '../fixtures/test-double'
import { expect } from 'chai'
import { Model } from '@luz/graphics'
import { Material, Mesh, ModelCompiler, RenderMaterial, Surface, TextureCompiler } from '@luz/graphics'

describe('Model export compatibility', () => {
  it('gives programmatic materials a serializable constant graph', () => {
    const data = new Material().serialize()
    const graph = data.graph as MaterialGraph

    expect(graph.version).to.equal(1)
    expect(graph.nodes).to.deep.equal({})
    expect(graph.outputs.baseColor).to.deep.equal({ value: [0.8, 0.8, 0.8, 1] })
    expect(graph.outputs.subsurfaceWeight).to.deep.equal({ value: 0 })
    expect(graph.outputs.subsurfaceScale).to.deep.equal({ value: 0.01 })
    expect(data.isDoubleSided).to.equal(false)
    expect(data).not.to.have.property('albedoSurface')
  })
  it('rejects old flattened material exports with a re-export message', async () => {
    let failure

    try {
      await Material.deserialize({ albedoColor: [1, 1, 1] } as any)
    } catch (error) {
      failure = error
    }

    expect(String(failure)).to.contain('re-export')
  })
  it('deserializes and compiles exported meshes', async () => {
    const model = await Model.deserialize({
      type: 'model',
      meshes: {
        Body: {
          topology: 'triangles',
          vertices: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1]
        }
      }
    })

    expect(model.meshes.Body).to.be.instanceOf(Mesh)

    const defaultMaterial = createDouble<RenderMaterial>({})
    const primitive = createDouble<Primitive>({ material: defaultMaterial })
    const compiler = new ModelCompiler(
      createDouble<RenderBackend>({ defaultMaterial }),
      createDouble<MaterialCompiler>({ compile: async () => defaultMaterial }),
      createDouble<MeshCompiler>({ compile: () => primitive })
    )
    const renderModel = await compiler.compile(model)

    expect(renderModel.source).to.equal(model)
    expect(renderModel.primitives.Body).to.equal(primitive)
  })
  it('reuses compiled model assets by URL and fingerprint across model instances', async () => {
    const createModel = () =>
      Model.deserialize({
        type: 'model',
        meshes: {
          Body: {
            topology: 'triangles',
            vertices: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1]
          }
        }
      })

    let meshCompilations = 0

    const compiler = new ModelCompiler(
      createDouble<RenderBackend>({ defaultMaterial: {} }),
      createDouble<MaterialCompiler>({ compile: async () => createDouble<RenderMaterial>({}) }),
      createDouble<MeshCompiler>({
        compile: () => {
          meshCompilations += 1

          return createDouble<Primitive>({ material: {} })
        }
      })
    )
    const firstRenderModel = await compiler.compile(await createModel(), { url: 'model.json', fingerprint: 'one' })
    const secondModel = await createModel()
    const secondRenderModel = await compiler.compile(secondModel, { url: 'model.json', fingerprint: 'one' })

    expect(secondRenderModel).not.to.equal(firstRenderModel)
    expect(secondRenderModel.source).to.equal(secondModel)
    expect(secondRenderModel.primitives).to.equal(firstRenderModel.primitives)
    expect(meshCompilations).to.equal(1)

    await compiler.compile(await createModel(), { url: 'model.json', fingerprint: 'two' })
    expect(meshCompilations).to.equal(2)
  })
  it('keeps render metadata outside the graph', async () => {
    const source = new Material({
      alphaMode: 'mask',
      alphaCutoff: 0.35,
      blendMode: 'transmissive',
      transmissionDepth: 0.12,
      transmissionEdgeFade: 0.2,
      isDoubleSided: true
    })
    const runtime = new RenderMaterial(source, {
      source: 'graph source',
      topology: 'topology',
      uniforms: { materialGraphValue0: 0.75 },
      textureCount: 0
    })

    expect(source.serialize()).to.include({
      alphaMode: 'mask',
      alphaCutoff: 0.35,
      blendMode: 'transmissive',
      transmissionDepth: 0.12,
      transmissionEdgeFade: 0.2,
      isDoubleSided: true
    })
    expect(runtime.uniforms).to.include({
      isMaterialAlphaMasked: true,
      materialAlphaCutoff: 0.35,
      materialTransmissionDepth: 0.12,
      materialTransmissionEdgeFade: 0.2,
      isMaterialDoubleSided: true
    })
    expect(runtime.isDoubleSided).to.equal(true)
    expect(runtime.isOpaque).to.equal(false)
  })
  it('preserves an explicit surface color space over the material default', async () => {
    const compiledSurfaces: SurfaceOptions[] = []
    const texture = createDouble<Texture>({})
    const compiler = new TextureCompiler(
      createDouble<RenderBackend>({
        textures: {
          create: (surface) => {
            compiledSurfaces.push(surface)

            return texture
          }
        }
      }),
      async () => createDouble<HTMLImageElement>({ width: 2, height: 2 })
    )

    await compiler.compile(new Surface({ path: 'roughness.png', colorSpace: 'sRGB' }), 'linear')
    expect(compiledSurfaces[0].colorSpace).to.equal('sRGB')
  })
  it('reuses compiled path textures with the same complete surface descriptor', async () => {
    let resolves = 0
    let creations = 0

    const texture = createDouble<Texture>({})
    const compiler = new TextureCompiler(
      createDouble<RenderBackend>({
        textures: {
          create: () => {
            creations += 1

            return texture
          }
        }
      }),
      async () => {
        resolves += 1

        return createDouble<HTMLImageElement>({ width: 2, height: 2 })
      }
    )
    const surface = new Surface({ path: 'base-color.png', colorSpace: 'sRGB', filtering: 'linear' })

    expect(await compiler.compile(surface)).to.equal(await compiler.compile(surface))
    expect(resolves).to.equal(1)
    expect(creations).to.equal(1)

    await compiler.compile(new Surface({ path: 'base-color.png', colorSpace: 'linear', filtering: 'linear' }))
    expect(resolves).to.equal(2)
    expect(creations).to.equal(2)
  })
})
