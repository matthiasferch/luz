import { Texture, SerializedTexture } from '../types/texture'

export class Textures {
  private textures: Texture[] = []

  private boundTextures: Record<number, Texture> = {}

  constructor(private gl: WebGL2RenderingContext) {}

  create(properties: Partial<SerializedTexture>): Texture {
    const { gl } = this

    const texture = gl.createTexture() as Texture

    const defaultProperties: SerializedTexture = {
      width: 1,
      height: 1,
      format: 'color',
      precision: 8,
      tiling: 'none',
      filtering: 'none',
      useMipmaps: false
    }

    properties = { ...defaultProperties, ...properties }

    Object.assign(texture, properties)

    texture.target = gl.TEXTURE_2D

    switch (texture.format) {
      case 'color':
        switch (texture.precision) {
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
            throw new Error(`Invalid texture precision: ${texture.precision}`)
        }

        break

      case 'alpha':
        switch (texture.precision) {
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
            throw new Error(`Invalid texture precision: ${texture.precision}`)
        }

        break

      case 'depth': {
        switch (texture.precision) {
          case 8:
            texture.components = gl.DEPTH_COMPONENT
            texture.dataFormat = gl.DEPTH_COMPONENT
            texture.dataType = gl.UNSIGNED_BYTE

            break

          case 32:
            texture.components = gl.DEPTH_COMPONENT32F
            texture.dataFormat = gl.DEPTH_COMPONENT
            texture.dataType = gl.FLOAT

            break

          default:
            throw new Error(`Invalid texture precision: ${texture.precision}`)
        }

        break
      }

      default:
        throw new Error(`Invalid texture format: ${texture.format}`)
    }

    this.bind(texture, 0)

    const { target, width, height, components, dataFormat, dataType, data } = texture

    gl.texImage2D(target, 0, components, width, height, 0, dataFormat, dataType, null)

    switch (texture.tiling) {
      case 'none':
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

        break

      case 'repeat':
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.REPEAT)
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.REPEAT)

        break

      case 'mirror':
        gl.texParameteri(target, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT)
        gl.texParameteri(target, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT)

        break

      default:
        throw new Error(`Invalid texture tiling: ${texture.tiling}`)
    }

    switch (texture.filtering) {
      case 'none':
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

        break

      case 'linear':
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, texture.useMipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR)

        break

      case 'bilinear':
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, texture.useMipmaps ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR)

        break

      case 'trilinear':
        gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, texture.useMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR)

        break
    }

    if (data) {
      this.update(texture, data)
    }

    this.textures.push(texture)

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

    console.log(target, x, y, width, height, components, dataType, data)

    gl.texSubImage2D(target, 0, x, y, width, height, components, dataType, data)

    if (useMipmaps) {
      gl.generateMipmap(target)
    }

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
  }
}
