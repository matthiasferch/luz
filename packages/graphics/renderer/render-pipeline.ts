import type { Program } from '../types/program'
import { Serializable, Serialize } from '@luz/serialization'
import { CullMode, BlendMode, DepthTest, ColorMask } from '@luz/formats'
import type { PipelineDefinition } from '@luz/formats'
import type { RenderMaterial } from './render-material'

export interface PipelineOptions extends Omit<PipelineDefinition, '$schema'> {}

export class RenderPipeline extends Serializable {
  @Serialize()
  readonly cullMode: CullMode = 'back'

  @Serialize()
  readonly blendMode: BlendMode = 'none'

  @Serialize()
  readonly depthTest: DepthTest = 'lessEqual'

  @Serialize()
  readonly depthMask: boolean = true

  @Serialize()
  readonly colorMask: ColorMask = [true, true, true, true]

  @Serialize()
  readonly vertexShader!: string

  @Serialize()
  readonly fragmentShader!: string

  program: Program | null = null
  resolveProgram: ((material: RenderMaterial) => Program) | null = null

  constructor(options: PipelineOptions) {
    super()

    this.vertexShader = options.vertexShader
    this.fragmentShader = options.fragmentShader
    this.cullMode = options.cullMode ?? 'back'
    this.blendMode = options.blendMode ?? 'none'
    this.depthTest = options.depthTest ?? 'lessEqual'
    this.depthMask = options.depthMask ?? true
    this.colorMask = options.colorMask === undefined ? [true, true, true, true] : [...options.colorMask]
  }

  static createFromDefinition(data: unknown): RenderPipeline {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Render pipeline requires a pipeline definition')
    }

    const definition = data as Record<string, unknown>
    const fields = [
      'cullMode',
      'blendMode',
      'depthTest',
      'depthMask',
      'colorMask',
      'vertexShader',
      'fragmentShader',
      '$schema'
    ]

    if (Object.keys(definition).some((key) => !fields.includes(key))) {
      throw new Error('Unknown pipeline definition field')
    }

    for (const key of ['vertexShader', 'fragmentShader']) {
      if (typeof definition[key] !== 'string') {
        throw new Error(`Pipeline ${key} must be a string`)
      }
    }

    for (const [key, values] of Object.entries({
      cullMode: ['none', 'front', 'back'],
      blendMode: ['none', 'additive', 'transparent', 'transmissive'],
      depthTest: ['none', 'never', 'always', 'equal', 'notEqual', 'less', 'lessEqual', 'greater', 'greaterEqual']
    })) {
      const value = definition[key]

      if (value !== undefined && (typeof value !== 'string' || !values.includes(value))) {
        throw new Error(`Invalid pipeline ${key}`)
      }
    }

    const colorMask = definition.colorMask

    if (
      colorMask !== undefined &&
      (!Array.isArray(colorMask) ||
        colorMask.length !== 4 ||
        colorMask.some((value: unknown) => typeof value !== 'boolean'))
    ) {
      throw new Error('Pipeline colorMask must contain four booleans')
    }

    if (definition.depthMask !== undefined && typeof definition.depthMask !== 'boolean') {
      throw new Error('Pipeline depthMask must be a boolean')
    }

    if (definition.$schema !== undefined && typeof definition.$schema !== 'string') {
      throw new Error('Pipeline $schema must be a string')
    }

    return new RenderPipeline(definition as unknown as PipelineDefinition)
  }

  static async deserialize(data: unknown): Promise<RenderPipeline> {
    return RenderPipeline.createFromDefinition(data)
  }
}

export type RenderStage =
  | 'depth'
  | 'ambient'
  | 'shadowMapping'
  | 'lighting'
  | 'volumetricLighting'
  | 'transmission'
  | 'transparent'
  | 'overlay'
  | 'composite'
