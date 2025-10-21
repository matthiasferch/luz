import { Camera, Light, Model, Transform } from '@luz/core'

import { WebGLMeshManager } from '../managers/meshes'
import { WebGLBufferManager } from '../managers/buffers'
import { WebGLProgramManager } from '../managers/programs'
import { WebGLSamplerManager } from '../managers/samplers'
import { WebGLShaderManager } from '../managers/shaders'
import { WebGLTextureManager } from '../managers/textures'
import { Program } from '../types/program'
import { UniformValue } from '../types/uniform'
import { Texture } from '../types/texture'
import { Material } from './material'
import { RenderTarget } from './target'
import { vec4 } from '@luz/vectors'
import { getUniformProperties } from '@luz/utilities'
import { UniformProperty } from '@luz/utilities/uniform'
import { Scissor } from './scissor'
import type { RenderState } from './render-graph'
import type { RenderPipeline } from './render-pipeline'
import type { Renderer, ShaderManager, ProgramManager, MeshManager, BufferManager, TextureManager, SamplerManager, BlendMode, CullMode, DepthTest } from './renderer'
import { RenderStatistics } from './render-statistics'

type UniformCache = Record<string, UniformValue>

type MaskOptions = {
  color: boolean[]
  depth: boolean
}

type ClearOptions = {
  color: vec4
  depth: number
  stencil: number
}

export class WebGLRenderer implements Renderer {
  readonly meshes: MeshManager
  readonly buffers: BufferManager

  readonly shaders: ShaderManager
  readonly programs: ProgramManager

  readonly textures: TextureManager
  readonly samplers: SamplerManager

  readonly defaultTexture: Texture
  readonly defaultMaterial: Material

  private activeCullMode: CullMode = 'None'
  private activeBlendMode: BlendMode = 'None'
  private activeDepthTest: DepthTest = 'None'

  private readonly uniformCache: UniformCache

  private readonly uniformProperties: Record<string, UniformProperty[]>

  private lastMaterialByProgram: WeakMap<Program, Material>

  readonly statistics: RenderStatistics

  constructor(private gl: WebGL2RenderingContext) {
    this.meshes = new WebGLMeshManager(this.gl)
    this.buffers = new WebGLBufferManager(this.gl)

    this.shaders = new WebGLShaderManager(this.gl)
    this.programs = new WebGLProgramManager(this.gl)

    this.textures = new WebGLTextureManager(this.gl)
    this.samplers = new WebGLSamplerManager(this.gl)

    const textureData = new Uint8Array([0xff, 0xff, 0xff, 0xff])

    this.defaultTexture = this.textures.create({ data: textureData })
    this.defaultMaterial = new Material({ texture: this.defaultTexture })

    this.uniformCache = Object.create(null)

    this.uniformProperties = {
      model: getUniformProperties(Model),
      light: getUniformProperties(Light),
      camera: getUniformProperties(Camera),
      material: getUniformProperties(Material),
      transform: getUniformProperties(Transform)
    }

    this.statistics = new RenderStatistics()

    this.lastMaterialByProgram = new WeakMap()
  }

  set cullMode(cullMode: CullMode) {
    if (cullMode === this.activeCullMode) {
      return
    }

    if (cullMode === 'None') {
      this.gl.disable(this.gl.CULL_FACE)
    } else {
      this.gl.enable(this.gl.CULL_FACE)

      switch (cullMode) {
        case 'Front':
          this.gl.cullFace(this.gl.FRONT)
          break

        case 'Back':
          this.gl.cullFace(this.gl.BACK)
          break
      }
    }

    this.activeCullMode = cullMode

    this.statistics.stateChanges.cullMode += 1
  }

  set blendMode(blendMode: BlendMode) {
    if (blendMode === this.activeBlendMode) {
      return
    }

    if (blendMode === 'None') {
      this.gl.disable(this.gl.BLEND)
    } else {
      this.gl.enable(this.gl.BLEND)

      switch (blendMode) {
        case 'Additive':
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE)
          break

        case 'Transparent':
          this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA)
          break
      }
    }

    this.activeBlendMode = blendMode

    this.statistics.stateChanges.blendMode += 1
  }

  set depthTest(depthTest: DepthTest) {
    if (depthTest === this.activeDepthTest) {
      return
    }

    if (depthTest === 'None') {
      this.gl.disable(this.gl.DEPTH_TEST)
    } else {
      this.gl.enable(this.gl.DEPTH_TEST)

      switch (depthTest) {
        case 'Never':
          this.gl.depthFunc(this.gl.NEVER)
          break

        case 'Always':
          this.gl.depthFunc(this.gl.ALWAYS)
          break

        case 'Equal':
          this.gl.depthFunc(this.gl.EQUAL)
          break

        case 'NotEqual':
          this.gl.depthFunc(this.gl.NOTEQUAL)
          break

        case 'Less':
          this.gl.depthFunc(this.gl.LESS)
          break

        case 'LessEqual':
          this.gl.depthFunc(this.gl.LEQUAL)
          break

        case 'Greater':
          this.gl.depthFunc(this.gl.GREATER)
          break

        case 'GreaterEqual':
          this.gl.depthFunc(this.gl.GEQUAL)
          break
      }
    }

    this.activeDepthTest = depthTest

    this.statistics.stateChanges.depthTest += 1
  }

  bindTarget({ width, height, frameBuffer }: RenderTarget) {
    if (frameBuffer) {
      this.buffers.bind(frameBuffer)
    } else {
      this.buffers.unbind('FrameBuffer')
    }

    this.gl.viewport(0, 0, width, height)
  }

  mask({ color, depth }: Partial<MaskOptions>) {
    if (color !== undefined) {
      const [r = true, g = true, b = true, a = true] = color

      this.gl.colorMask(r, g, b, a)

      this.statistics.stateChanges.maskColor += 1
    }

    if (depth !== undefined) {
      this.gl.depthMask(depth)

      this.statistics.stateChanges.maskDepth += 1
    }
  }

  clear({ color, depth, stencil }: Partial<ClearOptions>) {
    let clearMask = 0

    if (color !== undefined) {
      const { r = 0.0, g = 0.0, b = 0.0, a = 1.0 } = color

      this.gl.clearColor(r, g, b, a)
      clearMask |= this.gl.COLOR_BUFFER_BIT
    }

    if (depth !== undefined) {
      this.gl.clearDepth(depth)
      clearMask |= this.gl.DEPTH_BUFFER_BIT
    }

    if (stencil !== undefined) {
      this.gl.clearStencil(stencil)
      clearMask |= this.gl.STENCIL_BUFFER_BIT
    }

    if (clearMask !== 0) {
      this.gl.clear(clearMask)
    }
  }

  scissor(scissor: Scissor | null) {
    if (scissor === null) {
      this.gl.disable(this.gl.SCISSOR_TEST)
      return
    }

    const { x, y, width, height } = scissor

    this.gl.enable(this.gl.SCISSOR_TEST)
    this.gl.scissor(x, y, width, height)
  }

  bindPipeline(pipeline: RenderPipeline, overrideStates?: Partial<RenderState>) {
    if (pipeline.program == null) {
      throw new Error('Cannot bind pipeline without a program')
    }

    this.programs.use(pipeline.program)

    this.cullMode = overrideStates?.cullMode ?? pipeline.cullMode
    this.blendMode = overrideStates?.blendMode ?? pipeline.blendMode
    this.depthTest = overrideStates?.depthTest ?? pipeline.depthTest

    this.mask({
      color: overrideStates?.colorMask ?? pipeline.colorMask,
      depth: overrideStates?.depthMask ?? pipeline.depthMask
    })
  }

  resetMaterialBinding(program: Program) {
    this.lastMaterialByProgram.delete(program)
  }

  bindCameraUniforms(program: Program, camera: Camera) {
    const uniforms: UniformCache = Object.create(null)
    const hasUniform = this.hasUniform.bind(this, program)

    for (const { key } of this.uniformProperties.camera) {
      const name = `camera.${key}`

      if (hasUniform(name)) {
        uniforms[name] = (camera as any)[key]
      }
    }

    if (Object.keys(uniforms).length > 0) {
      this.programs.update(program, { uniforms })
    }
  }

  bindLightUniforms(program: Program, light: Light) {
    const uniforms: UniformCache = Object.create(null)
    const hasUniform = this.hasUniform.bind(this, program)

    for (const { key } of this.uniformProperties.light) {
      const name = `light.${key}`

      if (hasUniform(name)) {
        uniforms[name] = (light as any)[key]
      }
    }

    if (Object.keys(uniforms).length > 0) {
      this.programs.update(program, { uniforms })
    }
  }

  render<T extends {}>(
    model: Model,
    program: Program,
    transform: Transform,
    additionalUniforms?: T,
    selectedPartitions?: string[]
  ) {
    const baseUniforms: UniformCache = Object.create(null)

    const hasUniform = this.hasUniform.bind(this, program)

    const setUniformValue = (value: UniformValue, key: string, prefix?: string) => {
      const name = prefix ? `${prefix}.${key}` : key

      if (hasUniform(name)) {
        baseUniforms[name] = value
      }
    }

    // Camera uniforms are bound at pass level (frame group)

    if (transform) {
      for (const { key } of this.uniformProperties.transform) {
        setUniformValue((transform as any)[key], key, 'transform')
      }
    }

    if (model) {
      for (const { key } of this.uniformProperties.model) {
        setUniformValue((model as any)[key], key, 'model')
      }
    }

    if ((model as any).boneMatrices) {
      setUniformValue((model as any).boneMatrices, 'boneMatrices')
    }

    // Light uniforms are bound at pass level (light group)

    if (additionalUniforms) {
      const uniformValues = this.collectUniformValues(program, additionalUniforms)

      for (const uniform in uniformValues) {
        baseUniforms[uniform] = uniformValues[uniform]
      }
    }

    // Apply base (camera/transform/model/light/additional) uniforms once per object
    if (Object.keys(baseUniforms).length > 0) {
      this.programs.update(program, { uniforms: baseUniforms })
    }

    const selectedSet: Set<string> | null = selectedPartitions
      ? new Set(selectedPartitions)
      : null

    for (const [name, partition] of Object.entries((model as any).partitions)) {
      if (selectedSet && !selectedSet.has(name)) {
        continue
      }
      const { mesh } = partition as any

      if (!mesh) {
        console.warn('Partition has no mesh:', name)
        continue
      }

      const material = mesh.material ?? this.defaultMaterial

      if (!material.texture) {
        console.warn('Material has no texture on partition:', name)
        continue
      }

      // Bind material uniforms only when changed for this program
      const last = this.lastMaterialByProgram.get(program)
      if (last !== material) {
        const materialUniforms = this.uniformCache
        for (const uname in materialUniforms) delete (materialUniforms as any)[uname]
        for (const { key } of this.uniformProperties.material) {
          const uname = `material.${key}`
          if (this.hasUniform(program, uname)) (materialUniforms as any)[uname] = (material as any)[key]
        }
        this.programs.update(program, { uniforms: materialUniforms })
        this.lastMaterialByProgram.set(program, material)
      }

      this.meshes.render(mesh)

      this.statistics.renderedMeshes += 1
    }
  }

  private collectUniformValues(program: Program, uniformValues: any) {
    const uniforms: UniformCache = Object.create(null)
    const hasUniform = this.hasUniform.bind(this, program)

    const collectRecursively = (values: any, prefix?: string) => {
      if (values == null || typeof values !== 'object') {
        return
      }

      for (const [name, value] of Object.entries(values)) {
        const uniformName = prefix ? `${prefix}.${name}` : name

        if (hasUniform(uniformName)) {
          uniforms[uniformName] = value as UniformValue
        } else if (Array.isArray(value)) {
          ; (value as any[]).forEach((element, index) => {
            const arrayIndex = `${uniformName}[${index}]`

            if (hasUniform(arrayIndex)) {
              uniforms[arrayIndex] = element as UniformValue
            } else {
              collectRecursively(element, arrayIndex)
            }
          })
        } else {
          collectRecursively(value, uniformName)
        }
      }
    }

    collectRecursively(uniformValues)

    return uniforms
  }

  // Apply a set of (possibly nested) uniform values once against a program,
  // flattening them to real uniform names present in the program. Useful for
  // pass-level uniforms to avoid re-setting them per draw.
  bindNestedUniforms(program: Program, values: any) {
    const uniforms = this.collectUniformValues(program, values)
    if (Object.keys(uniforms).length > 0) {
      this.programs.update(program, { uniforms })
    }
  }

  private hasUniform(program: Program, name: string) {
    const { uniforms } = program

    if (!(uniforms as any)) {
      return false
    }

    return Object.prototype.hasOwnProperty.call(uniforms, name)
  }
}
