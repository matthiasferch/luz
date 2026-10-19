import { ColorSpace, TextureFiltering, TextureFormat, TexturePrecision, TextureTiling } from '@luz/formats'
import type { SurfaceDefinition } from '@luz/formats'
import { Serializable, Serialize } from '@luz/serialization'
import type { PixelData, TextureSource } from '../types/texture-source'

export interface SurfaceOptions extends Omit<SurfaceDefinition, 'data'> {
  data?: TextureSource
}

export class Surface extends Serializable {
  @Serialize()
  path?: string

  data?: TextureSource

  @Serialize()
  width: number = 1

  @Serialize()
  height: number = 1

  @Serialize()
  format: TextureFormat = 'color'

  @Serialize()
  colorSpace?: ColorSpace

  @Serialize()
  precision: TexturePrecision = 8

  @Serialize()
  tiling: TextureTiling = 'none'

  @Serialize()
  filtering: TextureFiltering = 'none'

  @Serialize()
  areMipmapsEnabled: boolean = false

  constructor(options: SurfaceOptions = {}) {
    super()

    this.path = options.path
    this.data = options.data
    this.width = options.width ?? 1
    this.height = options.height ?? 1
    this.format = options.format ?? 'color'
    this.colorSpace = options.colorSpace
    this.precision = options.precision ?? 8
    this.tiling = options.tiling ?? 'none'
    this.filtering = options.filtering ?? 'none'
    this.areMipmapsEnabled = options.areMipmapsEnabled ?? false
  }

  serialize(): Record<string, unknown> {
    const definition = super.serialize()

    if (this.data !== undefined) {
      if (ArrayBuffer.isView(this.data)) {
        if (Array.from(this.data).some((value) => !Number.isFinite(value))) {
          throw new Error('Surface pixel data must contain finite numbers')
        }

        definition.data = Array.from(this.data)
      } else if (!this.path) {
        throw new Error('An image-backed surface requires a path for serialization')
      }
    }

    return definition
  }

  static createFromDefinition(data: unknown): Surface {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      throw new Error('Surface requires an object definition')
    }

    const definition = data as Record<string, unknown>
    const fields = [
      'path',
      'data',
      'width',
      'height',
      'format',
      'colorSpace',
      'precision',
      'tiling',
      'filtering',
      'areMipmapsEnabled'
    ]

    if (Object.keys(definition).some((key) => !fields.includes(key))) {
      throw new Error('Unknown surface definition field')
    }

    for (const key of ['width', 'height']) {
      const value = definition[key]

      if (value !== undefined && (typeof value !== 'number' || !Number.isInteger(value) || value <= 0)) {
        throw new Error(`Surface ${key} must be a positive integer`)
      }
    }

    for (const [key, values] of Object.entries({
      precision: [8, 16, 24, 32],
      format: ['color', 'red', 'redGreen', 'alpha', 'depth'],
      colorSpace: ['linear', 'sRGB'],
      tiling: ['none', 'repeat', 'mirror'],
      filtering: ['none', 'linear', 'bilinear', 'trilinear']
    })) {
      if (definition[key] !== undefined && !(values as readonly unknown[]).includes(definition[key])) {
        throw new Error(`Invalid surface ${key}`)
      }
    }

    if (definition.path !== undefined && typeof definition.path !== 'string') {
      throw new Error('Surface path must be a string')
    }

    if (definition.areMipmapsEnabled !== undefined && typeof definition.areMipmapsEnabled !== 'boolean') {
      throw new Error('Surface areMipmapsEnabled must be a boolean')
    }

    const precision = (definition.precision ?? 8) as TexturePrecision
    const values = definition.data

    let pixels: PixelData | undefined

    if (values !== undefined) {
      const maximumValue = precision === 8 ? 255 : precision === 16 ? 65535 : 0xffffffff

      if (
        !Array.isArray(values) ||
        values.some(
          (value: unknown) =>
            typeof value !== 'number' ||
            !Number.isFinite(value) ||
            (precision === 32
              ? !Number.isFinite(Math.fround(value))
              : !Number.isInteger(value) || value < 0 || value > maximumValue)
        )
      ) {
        throw new Error(`Surface data requires a numeric pixel array for precision ${precision}`)
      }

      switch (precision) {
        case 8:
          pixels = new Uint8Array(values)
          break

        // The document stores IEEE 754 binary16 bit patterns.
        case 16:
          pixels = new Uint16Array(values)
          break

        case 24:
          pixels = new Uint32Array(values)
          break

        case 32:
          pixels = new Float32Array(values)
          break
      }
    }

    return new Surface({ ...(definition as SurfaceDefinition), data: pixels })
  }

  static async deserialize(data: unknown): Promise<Surface> {
    return Surface.createFromDefinition(data)
  }
}
