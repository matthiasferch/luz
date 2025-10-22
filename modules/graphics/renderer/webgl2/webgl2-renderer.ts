import { Camera, Light, Model, Transform } from '@luz/core'

import { WebGL2MeshManager } from './managers/webgl2-mesh-manager'
import { WebGL2BufferManager } from './managers/webgl2-buffer-manager'
import { WebGL2ProgramManager } from './managers/webgl2-program-manager'
import { WebGL2SamplerManager } from './managers/webgl2-sampler-manager'
import { WebGL2ShaderManager } from './managers/webgl2-shader-manager'
import { WebGL2TextureManager } from './managers/webgl2-texture.manager'
import { Program } from '../../types/program'
import { UniformValue } from '../../types/uniform'
import { Texture } from '../../types/texture'
import { Material } from '../material'
import { RenderTarget } from '../target'
import { getUniformProperties } from '@luz/utilities'
import { UniformProperty } from '@luz/utilities/uniform'
import { Scissor } from '../scissor'
import type { RenderState } from '../render-graph'
import type { RenderPipeline } from '../render-pipeline'
import type { Renderer, BlendMode, CullMode, DepthTest, ClearOptions } from '../renderer'
import { RenderStatistics } from '../render-statistics'

export class WebGL2Renderer implements Renderer {
  readonly meshes: WebGL2MeshManager
  readonly buffers: WebGL2BufferManager

  readonly shaders: WebGL2ShaderManager
  readonly programs: WebGL2ProgramManager

  readonly textures: WebGL2TextureManager
  readonly samplers: WebGL2SamplerManager

  readonly defaultTexture: Texture
  readonly defaultMaterial: Material

  private activeCullMode: CullMode = 'None'
  private activeBlendMode: BlendMode = 'None'
  private activeDepthTest: DepthTest = 'None'

  private readonly uniformCache: Record<string, UniformValue>
  private readonly uniformProperties: Record<string, UniformProperty[]>

  private lastMaterialByProgram: WeakMap<Program, Material>

  readonly statistics: RenderStatistics

  constructor(private context: WebGL2RenderingContext) {
    this.meshes = new WebGL2MeshManager(this.context)
    this.buffers = new WebGL2BufferManager(this.context)

    this.shaders = new WebGL2ShaderManager(this.context)
    this.programs = new WebGL2ProgramManager(this.context)

    this.textures = new WebGL2TextureManager(this.context)
    this.samplers = new WebGL2SamplerManager(this.context)

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
      this.context.disable(this.context.CULL_FACE)
    } else {
      this.context.enable(this.context.CULL_FACE)

      switch (cullMode) {
        case 'Front':
          this.context.cullFace(this.context.FRONT)
          break

        case 'Back':
          this.context.cullFace(this.context.BACK)
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
      this.context.disable(this.context.BLEND)
    } else {
      this.context.enable(this.context.BLEND)

      switch (blendMode) {
        case 'Additive':
          this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE)
          break

        case 'Transparent':
          this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA)
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
      this.context.disable(this.context.DEPTH_TEST)
    } else {
      this.context.enable(this.context.DEPTH_TEST)

      switch (depthTest) {
        case 'Never':
          this.context.depthFunc(this.context.NEVER)
          break

        case 'Always':
          this.context.depthFunc(this.context.ALWAYS)
          break

        case 'Equal':
          this.context.depthFunc(this.context.EQUAL)
          break

        case 'NotEqual':
          this.context.depthFunc(this.context.NOTEQUAL)
          break

        case 'Less':
          this.context.depthFunc(this.context.LESS)
          break

        case 'LessEqual':
          this.context.depthFunc(this.context.LEQUAL)
          break

        case 'Greater':
          this.context.depthFunc(this.context.GREATER)
          break

        case 'GreaterEqual':
          this.context.depthFunc(this.context.GEQUAL)
          break
      }
    }

    this.activeDepthTest = depthTest

    this.statistics.stateChanges.depthTest += 1
  }

  set colorMask(colorMask: boolean[]) {
    const [r = true, g = true, b = true, a = true] = colorMask

    this.context.colorMask(r, g, b, a)

    this.statistics.stateChanges.maskColor += 1
  }

  set depthMask(depthMask: boolean) {
    this.context.depthMask(depthMask)

    this.statistics.stateChanges.maskDepth += 1
  }

  set scissor(scissor: Scissor | null) {
    if (scissor === null) {
      this.context.disable(this.context.SCISSOR_TEST)
      return
    }

    const { x, y, width, height } = scissor

    this.context.enable(this.context.SCISSOR_TEST)
    this.context.scissor(x, y, width, height)
  }

  clear({ color, depth, stencil }: Partial<ClearOptions>) {
    let clearMask = 0

    if (color !== undefined) {
      const { r = 0.0, g = 0.0, b = 0.0, a = 1.0 } = color

      this.context.clearColor(r, g, b, a)
      clearMask |= this.context.COLOR_BUFFER_BIT
    }

    if (depth !== undefined) {
      this.context.clearDepth(depth)
      clearMask |= this.context.DEPTH_BUFFER_BIT
    }

    if (stencil !== undefined) {
      this.context.clearStencil(stencil)
      clearMask |= this.context.STENCIL_BUFFER_BIT
    }

    if (clearMask !== 0) {
      this.context.clear(clearMask)
    }
  }

  bindTarget({ width, height, frameBuffer }: RenderTarget) {
    if (frameBuffer) {
      this.buffers.bind(frameBuffer)
    } else {
      this.buffers.unbind('FrameBuffer')
    }

    this.context.viewport(0, 0, width, height)
  }

  bindPipeline(pipeline: RenderPipeline, overrideStates?: Partial<RenderState>) {
    if (pipeline.program == null) {
      throw new Error('Cannot bind pipeline without a program')
    }

    this.programs.bind(pipeline.program)

    this.cullMode = overrideStates?.cullMode ?? pipeline.cullMode
    this.blendMode = overrideStates?.blendMode ?? pipeline.blendMode
    this.depthTest = overrideStates?.depthTest ?? pipeline.depthTest

    this.colorMask = overrideStates?.colorMask ?? pipeline.colorMask
    this.depthMask = overrideStates?.depthMask ?? pipeline.depthMask
  }

  bindCameraUniforms(program: Program, camera: Camera) {
    const uniforms: Record<string, UniformValue> = Object.create(null)
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
    const uniforms: Record<string, UniformValue> = Object.create(null)
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

  bindUniforms(program: Program, values: any) {
    const uniforms = this.collectUniformValues(program, values)
    if (Object.keys(uniforms).length > 0) {
      this.programs.update(program, { uniforms })
    }
  }

  resetMaterialBinding(program: Program) {
    this.lastMaterialByProgram.delete(program)
  }

  render<T extends {}>(
    model: Model,
    program: Program,
    transform: Transform,
    additionalUniforms?: T,
    selectedPartitions?: string[]
  ) {
    const baseUniforms: Record<string, UniformValue> = Object.create(null)

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
    const uniforms: Record<string, UniformValue> = Object.create(null)
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

  private hasUniform(program: Program, name: string) {
    const { uniforms } = program

    if (!(uniforms as any)) {
      return false
    }

    return Object.prototype.hasOwnProperty.call(uniforms, name)
  }
}
