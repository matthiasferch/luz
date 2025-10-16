import { Camera, Entity, isModel, Light, Model, Transform } from '@luz/core'

import { Meshes } from '../managers/meshes'
import { Buffers } from '../managers/buffers'
import { Programs } from '../managers/programs'
import { Samplers } from '../managers/samplers'
import { Shaders } from '../managers/shaders'
import { Textures } from '../managers/textures'
import { Program } from '../types/program'
import { Uniform } from '../types/uniform'
import { State } from './state'
import { Texture } from '../types/texture'
import { Material } from './material'
import { RenderTarget } from './target'
import { vec4 } from '@luz/vectors'
import { RenderPass } from './pass'
import { getUniformProperties } from '@luz/utilities'
import { UniformProperty } from '@luz/utilities/uniform'
import { Scissor } from './scissor'
import { PipelineCache } from './pipeline-cache'
import { RenderPipeline, PipelineDescriptor } from './pipeline'

type UniformCache = Record<string, Uniform.Value>

type MaskOptions = {
  color: boolean[]
  depth: boolean
}

type ClearOptions = {
  color: vec4
  depth: number
  stencil: number
}

export class Renderer {
  readonly state: State

  readonly shaders: Shaders
  readonly programs: Programs

  readonly meshes: Meshes
  readonly buffers: Buffers

  readonly textures: Textures
  readonly samplers: Samplers

  readonly defaultTexture: Texture
  readonly defaultMaterial: Material

  private readonly uniformCache: UniformCache

  private readonly uniformProperties: Record<string, UniformProperty[]>

  readonly pipelines: PipelineCache
  private activePipeline?: RenderPipeline
  private lastMaterialByProgram: WeakMap<Program, Material>

  constructor(private gl: WebGL2RenderingContext) {
    this.state = new State(this.gl)

    this.meshes = new Meshes(this.gl)
    this.buffers = new Buffers(this.gl)

    this.shaders = new Shaders(this.gl)
    this.programs = new Programs(this.gl)

    this.textures = new Textures(this.gl)
    this.samplers = new Samplers(this.gl)

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

    this.pipelines = new PipelineCache()
    this.lastMaterialByProgram = new WeakMap()
  }

  use({ width, height, frameBuffer }: RenderTarget) {
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
    }

    if (depth !== undefined) {
      this.gl.depthMask(depth)
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

  // Enable scissor test with given rectangle in pixels (origin bottom-left)
  enableScissor({ x, y, width, height }: Scissor) {
    this.gl.enable(this.gl.SCISSOR_TEST)
    this.gl.scissor(x, y, width, height)
  }

  // Disable scissor test
  disableScissor() {
    this.gl.disable(this.gl.SCISSOR_TEST)
  }

  bindPipeline(pipeline: RenderPipeline) {
    if (this.activePipeline === pipeline) {
      return
    }

    this.programs.use(pipeline.program)
    this.state.cullMode = pipeline.cullMode
    this.state.blendMode = pipeline.blendMode
    this.state.depthTest = pipeline.depthTest
    this.mask({ color: pipeline.colorMask, depth: pipeline.depthMask })

    this.activePipeline = pipeline
  }

  resetMaterialBinding(program: Program) {
    this.lastMaterialByProgram.delete(program)
  }

  renderPass<T extends {}>(
    pass: RenderPass,
    camera: Camera,
    entities: Entity[],
    light: Light,
    uniforms?: T
  ) {
    // cull mode
    this.state.cullMode = pass.cullMode

    // blend mode
    this.state.blendMode = pass.blendMode

    // depth test
    this.state.depthTest = pass.depthTest

    // write masks
    this.mask({ color: pass.colorMask, depth: pass.depthMask })

    // clear buffers
    this.clear({ color: pass.clearColor, depth: pass.clearDepth, stencil: pass.clearStencil })

    const { program } = pass

    if (!program) {
      throw new Error('Render pass has no program')
    }

    // render entities
    for (const entity of entities) {
      for (const component of Object.values(entity.components)) {
        if (isModel(component)) {
          this.renderModel(camera, entity, component, light, program, uniforms)
        }
      }
    }
  }

  renderModel<T extends {}>(
    camera: Camera | null,
    transform: Transform,
    model: Model,
    light: Light,
    program: Program,
    additionalUniforms?: T,
    selectedPartitions?: string[] | Set<string>
  ) {
    const baseUniforms: UniformCache = Object.create(null)

    const hasUniform = this.hasUniform.bind(this, program)

    const setUniformValue = (value: Uniform.Value, key: string, prefix?: string) => {
      const name = prefix ? `${prefix}.${key}` : key

      if (hasUniform(name)) {
        baseUniforms[name] = value
      }
    }

    if (camera) {
      for (const { key } of this.uniformProperties.camera) {
        setUniformValue(camera[key], key, 'camera')
      }
    }

    if (transform) {
      for (const { key } of this.uniformProperties.transform) {
        setUniformValue(transform[key], key, 'transform')
      }
    }

    if (model) {
      for (const { key } of this.uniformProperties.model) {
        setUniformValue(model[key], key, 'model')
      }
    }

    if (model.boneMatrices) {
      setUniformValue(model.boneMatrices, 'boneMatrices')
    }

    if (light) {
      for (const { key } of this.uniformProperties.light) {
        setUniformValue(light[key], key, 'light')
      }
    }

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
      ? (selectedPartitions instanceof Set ? selectedPartitions : new Set(selectedPartitions))
      : null

    for (const [name, partition] of Object.entries(model.partitions)) {
      if (selectedSet && !selectedSet.has(name)) {
        continue
      }
      const { mesh } = partition

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
        for (const uname in materialUniforms) delete materialUniforms[uname]
        for (const { key } of this.uniformProperties.material) {
          const uname = `material.${key}`
          if (this.hasUniform(program, uname)) (materialUniforms as any)[uname] = (material as any)[key]
        }
        this.programs.update(program, { uniforms: materialUniforms })
        this.lastMaterialByProgram.set(program, material)
      }

      this.meshes.render(mesh)
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
          uniforms[uniformName] = value as Uniform.Value
        } else if (Array.isArray(value)) {
          value.forEach((element, index) => {
            const arrayIndex = `${uniformName}[${index}]`

            if (hasUniform(arrayIndex)) {
              uniforms[arrayIndex] = element as Uniform.Value
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
  applyUniforms(program: Program, values: any) {
    const uniforms = this.collectUniformValues(program, values)
    if (Object.keys(uniforms).length > 0) {
      this.programs.update(program, { uniforms })
    }
  }

  private hasUniform(program: Program, name: string) {
    const { uniforms } = program

    if (!uniforms) {
      return false
    }

    return Object.prototype.hasOwnProperty.call(uniforms, name)
  }
}
