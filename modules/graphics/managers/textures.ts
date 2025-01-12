import { Texture } from '../types/texture'
import { Surface } from '../renderer/surface'

export class Textures {
  private textures: Texture[] = []

  private boundTextures: Record<number, Texture> = {}

  constructor(private gl: WebGL2RenderingContext) {}

  create(surface: Omit<Partial<Surface>, 'texture'>): Texture {
    const { gl } = this

    const texture = gl.createTexture() as Texture

    const { width = 1, height = 1, precision = 8, format = 'Color' } = surface
    const { tiling = 'None', filtering = 'None', useMipmaps = false } = surface

    texture.width = width
    texture.height = height

    texture.target = gl.TEXTURE_2D

    switch (format) {
      case 'Color':
        switch (precision) {
          case 8:
            texture.components = gl.RGBA
            texture.dataFormat = gl.RGBA
            texture.dataType = gl.UNSIGNED_BYTE

            break

          case 32:
            texture.components = gl.RGBA32F
            texture.dataFormat = gl.RGBA
            texture.dataType = gl.FLOAT

            break

          default:
            throw new Error(`Invalid texture precision: ${precision}`)
        }

        break

      case 'Alpha':
        switch (precision) {
          case 8:
            texture.components = gl.ALPHA
            texture.dataFormat = gl.ALPHA
            texture.dataType = gl.UNSIGNED_BYTE

            break

          case 32:
            texture.components = gl.ALPHA
            texture.dataFormat = gl.ALPHA
            texture.dataType = gl.FLOAT

            break

          default:
            throw new Error(`Invalid texture precision: ${precision}`)
        }

        break

      case 'Depth': {
        switch (precision) {
          case 24:
            texture.components = gl.DEPTH_COMPONENT24
            texture.dataFormat = gl.DEPTH_COMPONENT
            texture.dataType = gl.UNSIGNED_INT

            break

          case 32:
            texture.components = gl.DEPTH_COMPONENT32F
            texture.dataFormat = gl.DEPTH_COMPONENT
            texture.dataType = gl.FLOAT

            break

          default:
            throw new Error(`Invalid texture precision: ${precision}`)
        }

        break
      }

      default:
        throw new Error(`Invalid texture format: ${format}`)
    }

    this.bind(texture, 0)

    const { target, components, dataFormat, dataType } = texture

    gl.texImage2D(target, 0, components, width, height, 0, dataFormat, dataType, null)

    switch (tiling) {
      case 'None':
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        break

      case 'Repeat':
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.REPEAT)
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.REPEAT)

        break

      case 'Mirror':
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)

        break

      default:
        throw new Error(`Invalid texture tiling: ${tiling}`)
    }

    switch (filtering) {
      case 'None':
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

        break

      case 'Linear':
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, useMipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR)

        break

      case 'Bilinear':
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, useMipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR)

        break

      case 'Trilinear':
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, useMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR)

        break
    }

    if (surface.data) {
      this.update(texture, surface.data)
    }

    this.textures.push(texture)

    console.log('Created texture:', texture)

    return texture
  }

  update(texture: Texture, data: any, x = 0, y = 0, width?: number, height?: number) {
    const { gl } = this

    if (width === undefined) {
      width = texture.width
    }

    if (height === undefined) {
      height = texture.width
    }

    this.bind(texture, 0)

    const { target, components, dataType, useMipmaps } = texture

    gl.texSubImage2D(target, 0, x, y, width, height, components, dataType, data)

    if (useMipmaps) {
      gl.generateMipmap(target)
    }

    console.log('Updated texture:', texture)

    texture.data = data
  }

  private bind(texture: Texture, unit: number) {
    const { gl } = this

    if (this.boundTextures[unit] === texture) {
      return
    }

    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(texture.target, texture)

    this.boundTextures[unit] = texture

    console.log('Bound texture:', texture, 'to unit:', unit)
  }
}
