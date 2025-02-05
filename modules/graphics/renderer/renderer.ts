import { Camera, Entity, Light, Model, Transform } from '@luz/core'

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

type MaskOptions = { color: boolean[]; depth: boolean }

type ClearOptions = { color: vec4; depth: number; stencil: number }

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
  }

  use(target: RenderTarget) {
    const { width, height, frameBuffer } = target

    if (frameBuffer) {
      this.buffers.bind(frameBuffer)
    } else {
      this.buffers.unbind('FrameBuffer')
    }

    this.gl.viewport(0, 0, width, height)
  }

  mask({ color, depth }: Partial<MaskOptions>) {
    if (color != null) {
      this.gl.colorMask(color[0], color[1], color[2], color[3])
    }

    if (depth != null) {
      this.gl.depthMask(depth)
    }
  }

  clear({ color, depth, stencil }: Partial<ClearOptions>) {
    let clearMask = 0

    if (color != null) {
      const { x, y, z, w } = color

      this.gl.clearColor(x, y, z, w)

      clearMask |= this.gl.COLOR_BUFFER_BIT
    }

    if (depth != null) {
      this.gl.clearDepth(depth)

      clearMask |= this.gl.DEPTH_BUFFER_BIT
    }

    if (stencil != null) {
      this.gl.clearStencil(stencil)

      clearMask |= this.gl.STENCIL_BUFFER_BIT
    }

    this.gl.clear(clearMask)
  }

  renderPass<T extends {}>(pass: RenderPass, camera: Camera, entities: Entity[], lights: Light[] = [], uniforms?: T) {
    // cull mode
    this.state.cullMode = pass.cullMode

    // blend mode
    this.state.blendMode = pass.blendMode

    // depth test
    this.state.depthTest = pass.depthTest

    // depth mask
    this.mask({ color: pass.colorMask, depth: pass.depthMask })

    // clear buffers
    this.clear({ color: pass.clearColor, depth: pass.clearDepth })

    const { program } = pass

    if (!program) {
      throw new Error('Render pass has no program')
    }

    // render entities
    Object.values(entities).forEach((entity) => {
      Object.values(entity.models).forEach((model) => {
        this.renderModel(camera, entity, model, lights, program, uniforms)
      })
    })
  }

  renderModel<T extends {}>(
    camera: Camera | null,
    transform: Transform,
    model: Model,
    lights: Light[],
    program: Program,
    additionalUniforms?: T
  ) {
    const uniforms: Record<string, Uniform.Value> = {}

    const setUniformValue = (value: Uniform.Value, key: string, prefix?: string) => {
      const name = prefix ? `${prefix}.${key}` : key

      if (program.uniforms.hasOwnProperty(name)) {
        uniforms[name] = value
      }
    }

    if (camera) {
      getUniformProperties(Camera).forEach(({ key }) => {
        setUniformValue(camera[key], key, 'camera')
      })
    }

    if (transform) {
      getUniformProperties(Transform).forEach(({ key }) => {
        setUniformValue(transform[key], key, 'transform')
      })
    }

    if (model) {
      getUniformProperties(Model).forEach(({ key }) => {
        setUniformValue(model[key], key, 'model')
      })
    }

    if (model.boneMatrices) {
      // nested structures cannot contain arrays,
      // so we need to place bone matrices outside
      model.boneMatrices.forEach((matrix, index) => {
        setUniformValue(matrix, `boneMatrices[${index}]`)
      })
    }

    if (lights) {
      lights.forEach((light, index) => {
        getUniformProperties(Light).forEach(({ key }) => {
          setUniformValue(light[key], key, `lights[${index}]`)
        })
      })
    }

    this.programs.update(program, { uniforms })

    if (additionalUniforms) {
      // additional uniforms
      this.programs.update(program, {
        uniforms: this.collectUniformValues(program, additionalUniforms)
      })
    }

    Object.entries(model.partitions).forEach(([name, partition]) => {
      const { mesh } = partition

      if (!mesh) {
        throw new Error('Partition has no mesh')
      }

      const { material } = mesh

      if (!material) {
        throw new Error('Mesh has no material')
      }

      if (!material.texture) {
        throw new Error(name)
      }

      this.programs.update(program, {
        uniforms: getUniformProperties(Material).reduce((properties, { key }) => {
          const name = `material.${key}`

          if (program.uniforms.hasOwnProperty(name)) {
            properties[name] = material[key]
          }

          return properties
        }, {})
      })

      this.meshes.render(mesh)
    })
  }

  private collectUniformValues(program: Program, uniformValues: any) {
    const collectedUniformValues: Record<string, Uniform.Value> = {}

    const collectRecursively = (values: any, prefix?: string) => {
      if (values == null || typeof values !== 'object') {
        return
      }

      Object.entries(values).forEach(([name, value]: [string, any]) => {
        const uniformName = prefix ? `${prefix}.${name}` : name

        if (program.uniforms.hasOwnProperty(uniformName)) {
          collectedUniformValues[uniformName] = value
        } else if (Array.isArray(value)) {
          value.forEach((element, index) => {
            const arrayIndex = `${uniformName}[${index}]`

            if (program.uniforms.hasOwnProperty(arrayIndex)) {
              collectedUniformValues[arrayIndex] = element
            } else {
              collectRecursively(element, arrayIndex)
            }
          })
        } else {
          collectRecursively(value, uniformName)
        }
      })
    }

    collectRecursively(uniformValues)

    return collectedUniformValues
  }
}
