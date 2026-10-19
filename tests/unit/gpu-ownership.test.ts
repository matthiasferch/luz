import { expect } from 'chai'
import type { KTXContainer } from '@luz/formats'
import {
  createDefaultMaterialGraph,
  GraphCompiler,
  Material,
  MaterialCompiler,
  Mesh,
  MeshCompiler,
  Model,
  ModelCompiler,
  PipelineCompiler,
  RenderPipeline,
  Surface,
  TextureCompiler,
  WebGL2RenderBackend
} from '@luz/graphics'
import { WebGL2ShaderManager } from '../../packages/graphics/renderer/webgl2/managers/webgl2-shader-manager'
import { WebGL2ProgramManager } from '../../packages/graphics/renderer/webgl2/managers/webgl2-program-manager'
import { WebGL2SamplerManager } from '../../packages/graphics/renderer/webgl2/managers/webgl2-sampler-manager'
import { WebGL2TextureManager } from '../../packages/graphics/renderer/webgl2/managers/webgl2-texture-manager'
import { WebGL2PrimitiveManager } from '../../packages/graphics/renderer/webgl2/managers/webgl2-primitive-manager'
import { WebGL2BufferManager } from '../../packages/graphics/renderer/webgl2/managers/webgl2-buffer-manager'
import type { Shader } from '../../packages/graphics/types/shader'
import type { RenderMaterial } from '../../packages/graphics/renderer/render-material'

const createContext = () => {
  const liveResources = new Map<object, string>()
  const calls: { name: string; parameters: unknown[] }[] = []
  const constants = new Map<string, number>()
  const failures = new Set<string>()
  const nullAllocations = new Set<string>()
  const rejectedStatuses = new Set<string>()
  const gl = new Proxy(
    {},
    {
      get: (_target, property: string) => {
        if (/^[A-Z][A-Z_0-9]*$/.test(property)) {
          if (!constants.has(property)) {
            constants.set(property, constants.size + 1)
          }

          return constants.get(property)
        }

        return (...parameters: unknown[]) => {
          calls.push({ name: property, parameters })

          if (failures.has(property)) {
            throw new Error(`Failed ${property}`)
          }

          if (property.startsWith('create')) {
            if (nullAllocations.has(property)) {
              return null
            }

            const resource = {}

            liveResources.set(resource, property.slice(6))

            return resource
          }

          if (property.startsWith('delete') && parameters[0]) {
            expect(liveResources.get(parameters[0] as object), property).to.equal(property.slice(6))
            liveResources.delete(parameters[0] as object)
          }

          if (property === 'getProgramParameter') {
            return parameters[1] === constants.get('LINK_STATUS') ? !rejectedStatuses.has('link') : 0
          }

          if (property === 'getShaderParameter') {
            return !rejectedStatuses.has('compile')
          }

          if (property === 'isShader' || property === 'isProgram') {
            return true
          }

          if (property === 'checkFramebufferStatus') {
            return gl.FRAMEBUFFER_COMPLETE
          }

          if (property === 'getParameter') {
            return 16
          }

          return 0
        }
      }
    }
  ) as WebGL2RenderingContext

  return { gl, liveResources, calls, failures, nullAllocations, rejectedStatuses }
}

const createContainer = (numberOfFaces: number): KTXContainer => ({
  glType: 0,
  glTypeSize: 1,
  glFormat: 0,
  glInternalFormat: 1,
  glBaseInternalFormat: 1,
  pixelWidth: 1,
  pixelHeight: 1,
  pixelDepth: 0,
  numberOfArrayElements: 0,
  numberOfFaces,
  numberOfMipmapLevels: 1,
  bytesOfKeyValueData: 0,
  isLittleEndian: true,
  levels: [{ width: 1, height: 1, faces: Array.from({ length: numberOfFaces }, () => new Uint8Array(4)) }]
})

const createMesh = () =>
  new Mesh({
    topology: 'triangles',
    vertices: [0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1],
    indices: [0, 1, 2],
    weights: [{ vertex: 0, indices: [0, 0, 0, 0], weights: [1, 0, 0, 0] }]
  })

describe('GPU resource ownership', () => {
  it('recompiles edited meshes without sharing distinct edits or leaking previous primitives', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const materials = new MaterialCompiler(
      new TextureCompiler(backend, async () => ({ width: 1, height: 1 }) as TexImageSource)
    )
    const compiler = new ModelCompiler(backend, materials, new MeshCompiler(backend))
    const firstVertices = [0, 0, 0, 0, 0, 1, 0, 0]
    const secondVertices = firstVertices.slice()
    const firstMesh = new Mesh({ vertices: firstVertices })
    const secondMesh = new Mesh({ vertices: secondVertices })
    const firstModel = new Model({ meshes: { point: firstMesh } })
    const secondModel = new Model({ meshes: { point: secondMesh } })
    const identity = { url: 'shared.json', fingerprint: 'same' }
    const original = await compiler.compile(firstModel, identity)
    const shared = await compiler.compile(secondModel, identity)

    expect(shared.primitives).to.equal(original.primitives)

    firstVertices[0] = 3
    secondVertices[0] = 7

    firstMesh.invalidateGeometry()
    secondMesh.invalidateGeometry()

    const firstEdited = await compiler.compile(firstModel, identity)

    expect(liveResources.has(original.primitives.point.vertexArray)).to.equal(true)

    const secondEdited = await compiler.compile(secondModel, identity)

    expect(firstEdited.primitives).not.to.equal(original.primitives)
    expect(firstEdited.primitives).not.to.equal(secondEdited.primitives)
    expect(liveResources.has(original.primitives.point.vertexArray)).to.equal(false)
    expect(await compiler.compile(firstModel, identity)).to.equal(firstEdited)
    expect(firstMesh.serialize()).not.to.have.any.keys('revision', 'geometryRevision')
    compiler.clear()
    expect(liveResources.size).to.equal(1)
    backend.destroy()
  })
  it('rejects geometry edits during pending compilation and permits a fresh retry', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const materials = new MaterialCompiler(
      new TextureCompiler(backend, async () => ({ width: 1, height: 1 }) as TexImageSource)
    )
    const compiler = new ModelCompiler(backend, materials, new MeshCompiler(backend))
    const mesh = createMesh()
    const model = new Model({ meshes: { triangle: mesh } })
    const identity = { url: 'edited.json', fingerprint: 'same' }
    const pending = compiler.compile(model, identity)

    mesh.invalidateGeometry()
    expect(await pending.catch((error: Error) => error.message)).to.contain('invalidated')
    expect(liveResources.size).to.equal(1)

    await compiler.compile(model, identity)
    compiler.clear()
    expect(liveResources.size).to.equal(1)
    backend.destroy()
  })
  it('shares compiled model assets and releases them only after the last model', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const textures = new TextureCompiler(backend, async () => ({ width: 1, height: 1 }) as TexImageSource)
    const materials = new MaterialCompiler(textures)
    const compiler = new ModelCompiler(backend, materials, new MeshCompiler(backend))
    const firstModel = new Model({ meshes: { triangle: createMesh() } })
    const secondModel = new Model({ meshes: { triangle: createMesh() } })
    const identity = { url: 'model.json', fingerprint: 'one' }

    const firstPromise = compiler.compile(firstModel, identity)

    expect(compiler.compile(firstModel, identity)).to.equal(firstPromise)

    const [firstRenderModel, secondRenderModel] = await Promise.all([
      firstPromise,
      compiler.compile(secondModel, identity)
    ])

    expect(firstRenderModel).not.to.equal(secondRenderModel)
    expect(firstRenderModel.primitives).to.equal(secondRenderModel.primitives)
    expect(liveResources.size).to.equal(8)
    compiler.release(firstModel)
    compiler.release(firstModel)
    expect(liveResources.size).to.equal(8)
    expect(() => compiler.requireCompiledModel(firstModel)).to.throw('not been compiled')
    compiler.release(secondModel)
    expect(liveResources.size).to.equal(1)
    compiler.clear()
    backend.destroy()
  })
  it('keeps working model resources when a replacement fails and releases partial geometry', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const textures = new TextureCompiler(backend, async () => ({ width: 1, height: 1 }) as TexImageSource)
    const materials = new MaterialCompiler(textures)
    const compiler = new ModelCompiler(backend, materials, new MeshCompiler(backend))
    const model = new Model({ meshes: { triangle: createMesh() } })

    const firstModel = await compiler.compile(model, { url: 'model.json', fingerprint: 'one' })

    model.setMesh('invalid', new Mesh({ vertices: [] }))
    expect(
      await compiler.compile(model, { url: 'model.json', fingerprint: 'two' }).catch((error: Error) => error.message)
    ).to.contain('no vertices')
    expect(compiler.requireCompiledModel(model)).to.equal(firstModel)
    expect(liveResources.size).to.equal(8)
    model.removeMesh('invalid')

    const replacement = await compiler.compile(model, { url: 'model.json', fingerprint: 'two' })

    expect(replacement).not.to.equal(firstModel)
    expect(liveResources.has(firstModel.primitives.triangle.vertexArray)).to.equal(false)
    expect(liveResources.size).to.equal(8)
    compiler.clear()
    expect(liveResources.size).to.equal(1)
    backend.destroy()
  })
  it('releases pending models after clear instead of publishing them', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const textures = new TextureCompiler(backend, async () => ({ width: 1, height: 1 }) as TexImageSource)
    const materials = new MaterialCompiler(textures)
    const compiler = new ModelCompiler(backend, materials, new MeshCompiler(backend))
    const model = new Model({ meshes: { triangle: createMesh() } })

    const promise = compiler.compile(model)

    compiler.clear()
    expect(await promise.catch((error: Error) => error.message)).to.contain('invalidated')
    expect(() => compiler.requireCompiledModel(model)).to.throw('not been compiled')
    expect(liveResources.size).to.equal(1)
    backend.destroy()
  })
  it('releases old procedural compilations and preserves other model views across reload', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const textures = new TextureCompiler(backend, async () => ({ width: 1, height: 1 }) as TexImageSource)
    const materials = new MaterialCompiler(textures)
    const compiler = new ModelCompiler(backend, materials, new MeshCompiler(backend))
    const model = new Model({ meshes: { triangle: createMesh() } })

    await compiler.compile(model)

    await compiler.compile(model)
    expect(liveResources.size).to.equal(8)

    const identity = { url: 'model.json', fingerprint: 'one' }
    const original = await compiler.compile(model, identity)
    const secondModel = new Model({ meshes: { triangle: createMesh() } })

    compiler.beginReload()

    const replacement = await compiler.compile(secondModel, identity)

    expect(replacement.primitives).not.to.equal(original.primitives)
    expect(liveResources.size).to.equal(15)
    compiler.release(model)
    expect(liveResources.has(replacement.primitives.triangle.vertexArray)).to.equal(true)
    compiler.clear()
    expect(liveResources.size).to.equal(1)
    backend.destroy()
  })
  it('shares texture requests until their final owner releases them', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)

    let imageCount = 0

    const compiler = new TextureCompiler(backend, async () => {
      imageCount += 1

      return { width: 1, height: 1 } as TexImageSource
    })
    const surface = new Surface({ path: 'shared.png' })
    const [firstTexture, secondTexture] = await Promise.all([compiler.compile(surface), compiler.compile(surface)])

    expect(firstTexture).to.equal(secondTexture)
    expect(imageCount).to.equal(1)
    compiler.release(firstTexture)
    expect(liveResources.has(secondTexture)).to.equal(true)
    compiler.release(secondTexture)
    expect(liveResources.has(secondTexture)).to.equal(false)

    const thirdTexture = await compiler.compile(surface)

    expect(thirdTexture).not.to.equal(secondTexture)
    expect(imageCount).to.equal(2)
    compiler.clear()
    expect(liveResources.size).to.equal(1)
    backend.destroy()
  })
  it('invalidates pending texture requests without evicting or destroying their replacements', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)

    let resolveImage!: (image: TexImageSource) => void
    let requestCount = 0

    const compiler = new TextureCompiler(backend, async () => {
      requestCount += 1

      return requestCount === 1
        ? new Promise<TexImageSource>((resolve) => {
            resolveImage = resolve
          })
        : ({ width: 1, height: 1 } as TexImageSource)
    })
    const surface = new Surface({ path: 'shared.png' })
    const pendingTexture = compiler.compile(surface).then(
      () => 'unexpected success',
      (error: Error) => error.message
    )

    compiler.beginReload()

    const replacement = await compiler.compile(surface)

    resolveImage({ width: 1, height: 1 } as TexImageSource)
    expect(await pendingTexture).to.contain('invalidated')
    expect(await compiler.compile(surface)).to.equal(replacement)
    expect(requestCount).to.equal(2)
    expect(liveResources.size).to.equal(2)
    compiler.clear()
    backend.destroy()
  })
  it('retries failed texture reads and cleans up failed solid uploads', async () => {
    const { gl, liveResources, failures } = createContext()
    const backend = new WebGL2RenderBackend(gl)

    let requestCount = 0

    const compiler = new TextureCompiler(backend, async () => {
      requestCount += 1

      if (requestCount === 1) {
        throw new Error('Missing image')
      }

      return { width: 1, height: 1 } as TexImageSource
    })
    const surface = new Surface({ path: 'retry.png' })

    expect(await compiler.compile(surface).catch((error: Error) => error.message)).to.equal('Missing image')

    await compiler.compile(surface)
    failures.add('texSubImage2D')
    expect(() => compiler.compileSolid([255, 255, 255, 255])).to.throw()
    expect(liveResources.size).to.equal(2)
    compiler.clear()
    backend.destroy()
  })
  it('releases successful sibling textures when graph compilation fails', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const textures = new TextureCompiler(backend, async (path) => {
      if (path === 'missing.png') {
        throw new Error('Missing image')
      }

      return { width: 1, height: 1 } as TexImageSource
    })
    const graphs = new GraphCompiler(textures)
    const graph = createDefaultMaterialGraph()

    graph.nodes.firstImage = { type: 'imageTexture', surface: { path: 'valid.png' } }
    graph.nodes.secondImage = { type: 'imageTexture', surface: { path: 'missing.png' } }
    graph.outputs.baseColor = { node: 'firstImage', output: 'Color' }
    graph.outputs.emissionColor = { node: 'secondImage', output: 'Color' }

    expect(await graphs.compile(graph).catch((error: Error) => error.message)).to.equal('Missing image')
    expect(liveResources.size).to.equal(1)
    textures.clear()
    backend.destroy()
  })
  it('retains shared textures until every material is released', async () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const textures = new TextureCompiler(backend, async () => ({ width: 1, height: 1 }) as TexImageSource)
    const materials = new MaterialCompiler(textures)
    const graph = createDefaultMaterialGraph()

    graph.nodes.image = { type: 'imageTexture', surface: { path: 'shared.png' } }
    graph.outputs.baseColor = { node: 'image', output: 'Color' }

    const [firstMaterial, secondMaterial] = await Promise.all([
      materials.compile(new Material({ graph })),
      materials.compile(new Material({ graph }))
    ])

    expect(liveResources.size).to.equal(2)
    materials.release(firstMaterial)
    materials.release(firstMaterial)
    expect(liveResources.size).to.equal(2)
    materials.release(secondMaterial)
    expect(liveResources.size).to.equal(1)
    materials.clear()
    textures.clear()
    backend.destroy()
  })
  it('retains working pipeline programs after failed replacement and releases all variants', () => {
    const { gl, liveResources, rejectedStatuses } = createContext()
    const backend = new WebGL2RenderBackend(gl)
    const compiler = new PipelineCompiler(backend, [], [])
    const pipeline = new RenderPipeline({ vertexShader: 'vertex', fragmentShader: 'fragment' })

    compiler.compile(pipeline, '', 'evaluateMaterial()')

    const program = pipeline.program
    const resolveProgram = pipeline.resolveProgram!
    const variant = resolveProgram(backend.defaultMaterial)
    const resourceCount = liveResources.size

    rejectedStatuses.add('link')
    expect(() => compiler.compile(pipeline, '', '')).to.throw('Failed to link')
    expect(pipeline.program).to.equal(program)
    expect(pipeline.resolveProgram!(backend.defaultMaterial)).to.equal(variant)
    expect(liveResources.size).to.equal(resourceCount)
    rejectedStatuses.clear()
    compiler.compile(pipeline, '', '')
    expect(liveResources.has(program!)).to.equal(false)
    expect(liveResources.has(variant)).to.equal(false)
    expect(() => resolveProgram(backend.defaultMaterial)).to.throw('released')
    compiler.release(pipeline)
    compiler.clear()
    expect(pipeline.program).to.equal(null)
    expect(pipeline.resolveProgram).to.equal(null)
    expect(liveResources.size).to.equal(1)
    backend.destroy()
    expect(liveResources.size).to.equal(0)
  })
  it('releases rejected shader compilations and program links', () => {
    const { gl, liveResources, rejectedStatuses } = createContext()
    const shaders = new WebGL2ShaderManager(gl)
    const programs = new WebGL2ProgramManager(gl)

    rejectedStatuses.add('compile')
    rejectedStatuses.add('link')
    expect(shaders.create('vertex', '')).to.equal(null)
    expect(programs.create({} as Shader, {} as Shader)).to.equal(null)
    shaders.destroyAll()
    programs.destroyAll()
    expect(liveResources.size).to.equal(0)
  })
  it('releases primitive buffers without releasing the borrowed material', () => {
    const { gl, liveResources } = createContext()
    const manager = new WebGL2PrimitiveManager(gl)
    const material = {} as RenderMaterial
    const firstPrimitive = manager.create(createMesh(), material)
    const secondPrimitive = manager.create(createMesh(), material)

    expect(liveResources.size).to.equal(14)
    manager.destroy(firstPrimitive)
    manager.destroy(firstPrimitive)
    expect(liveResources.size).to.equal(7)
    expect(secondPrimitive.material).to.equal(material)
    manager.destroyAll()
    manager.destroyAll()
    expect(liveResources.size).to.equal(0)
  })

  for (const operation of ['createBuffer', 'bufferData', 'vertexAttribPointer']) {
    it(`releases partial primitive allocations after ${operation} fails`, () => {
      const { gl, liveResources, failures, nullAllocations } = createContext()
      const manager = new WebGL2PrimitiveManager(gl)

      if (operation.startsWith('create')) {
        nullAllocations.add(operation)
      } else {
        failures.add(operation)
      }

      expect(() => manager.create(createMesh(), {} as RenderMaterial)).to.throw()
      manager.destroyAll()
      expect(liveResources.size).to.equal(0)
    })
  }

  it('tracks ordinary, 2D KTX and cube KTX textures together', () => {
    const { gl, liveResources } = createContext()
    const manager = new WebGL2TextureManager(gl)
    const texture = manager.create({})

    manager.create2DFromKTX(createContainer(1))
    manager.createCubeFromKTX(createContainer(6))
    expect(liveResources.size).to.equal(3)
    manager.destroy(texture)
    manager.destroy(texture)
    manager.destroyAll()
    manager.destroyAll()
    expect(liveResources.size).to.equal(0)
  })
  it('cleans up texture uploads that throw', () => {
    const { gl, liveResources, failures } = createContext()
    const manager = new WebGL2TextureManager(gl)

    failures.add('texImage2D')
    failures.add('compressedTexImage2D')
    expect(() => manager.create({})).to.throw()
    expect(() => manager.create2DFromKTX(createContainer(1))).to.throw()
    expect(() => manager.createCubeFromKTX(createContainer(6))).to.throw()
    manager.destroyAll()
    expect(liveResources.size).to.equal(0)
  })
  it('releases shaders, programs and samplers idempotently and unbinds active resources', () => {
    const { gl, liveResources, calls } = createContext()
    const shaders = new WebGL2ShaderManager(gl)
    const programs = new WebGL2ProgramManager(gl)
    const samplers = new WebGL2SamplerManager(gl)
    const vertexShader = shaders.create('vertex', 'void main() {}')!
    const fragmentShader = shaders.create('fragment', 'void main() {}')!
    const program = programs.create(vertexShader, fragmentShader)!
    const sampler = samplers.create()

    samplers.bind(sampler, 3)
    expect(calls.filter((call) => call.name === 'bindSampler').pop()?.parameters).to.deep.equal([3, sampler])
    programs.destroy(program)
    programs.destroy(program)
    shaders.destroy(vertexShader)
    shaders.destroyAll()
    samplers.destroy(sampler)
    samplers.destroyAll()
    expect(calls.filter((call) => call.name === 'bindSampler').pop()?.parameters).to.deep.equal([3, null])
    expect(calls.filter((call) => call.name === 'useProgram').pop()?.parameters).to.deep.equal([null])
    expect(liveResources.size).to.equal(0)
  })
  it('cleans up shader, program, sampler and generic primitive initialization exceptions', () => {
    const { gl, liveResources, failures } = createContext()
    const buffers = new WebGL2BufferManager(gl)
    const buffer = buffers.create('vertexBuffer')

    failures.add('shaderSource')
    failures.add('linkProgram')
    failures.add('samplerParameteri')
    failures.add('vertexAttribPointer')
    expect(() => new WebGL2ShaderManager(gl).create('vertex', '')).to.throw()
    expect(() => new WebGL2ProgramManager(gl).create({} as Shader, {} as Shader)).to.throw()
    expect(() => new WebGL2SamplerManager(gl).create()).to.throw()
    expect(() =>
      new WebGL2PrimitiveManager(gl).create({
        topology: 'triangles',
        vertexCount: 6,
        attributes: [{ buffer, location: 7, format: 'float32x3', divisor: 1 }]
      })
    ).to.throw()
    expect(liveResources.size).to.equal(1)
    buffers.destroy(buffer)
    expect(liveResources.size).to.equal(0)
  })
  it('destroys frame buffers while retaining borrowed attachments', () => {
    const { gl, liveResources } = createContext()
    const buffers = new WebGL2BufferManager(gl)
    const textures = new WebGL2TextureManager(gl)
    const frameBuffer = buffers.create('frameBuffer')
    const texture = textures.create({})

    buffers.attach(frameBuffer, texture, gl.COLOR_ATTACHMENT0)
    buffers.create('uniformBuffer')
    buffers.create('renderBuffer')
    buffers.destroyAll()
    buffers.destroy(frameBuffer)
    expect(frameBuffer.attachments).to.deep.equal({})
    expect(liveResources.size).to.equal(1)
    textures.destroyAll()
  })
  it('releases every backend resource on repeated destruction', () => {
    const { gl, liveResources } = createContext()
    const backend = new WebGL2RenderBackend(gl)

    const buffer = backend.buffers.create('vertexBuffer')

    backend.primitives.create({
      topology: 'triangles',
      vertexCount: 6,
      attributes: [{ buffer, location: 7, format: 'float32x3', divisor: 1 }]
    })
    backend.buffers.create('frameBuffer')
    backend.samplers.create()
    backend.shaders.create('vertex', '')
    backend.primitives.create(createMesh(), backend.defaultMaterial)
    expect(liveResources.size).to.be.greaterThan(0)
    backend.destroy()
    backend.destroy()
    expect(liveResources.size).to.equal(0)
  })
})
