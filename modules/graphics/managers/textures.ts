import { Texture } from '../types/texture'

export class Textures {

  private textures: Texture[] = []

  private boundTextures: { [index: number]: Texture } = {}

  constructor(private gl: WebGL2RenderingContext) { }

  create(target: number, format: number, width: number, height: number, filtering: Texture.Filtering, tiling: Texture.Tiling, mipmaps: boolean): Texture {
    let texture = this.gl.createTexture() as Texture

    texture.target = target
    texture.format = format

    texture.width = width
    texture.height = height

    texture.tiling = tiling
    texture.filtering = filtering

    texture.useMipmaps = mipmaps

    let sourceFormat: number

    switch (texture.format) {
      case this.gl.RGBA:
      case this.gl.RGBA32F:
        sourceFormat = this.gl.RGBA

        break

      case this.gl.LUMINANCE:
        sourceFormat = this.gl.LUMINANCE

        break

      case this.gl.DEPTH_COMPONENT32F:
        sourceFormat = this.gl.DEPTH_COMPONENT

        break
    }

    switch (texture.format) {
      case this.gl.RGBA32F:
      case this.gl.DEPTH_COMPONENT32F:
        texture.type = this.gl.FLOAT

        break

      default:
        texture.type = this.gl.UNSIGNED_BYTE

        break
    }

    this.bind(texture, 0)

    this.gl.texImage2D(texture.target, 0, texture.format, width, height, 0, sourceFormat, texture.type, null)

    switch (texture.tiling) {
      case Texture.Tiling.None:
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

        break

      case Texture.Tiling.Both:
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)

        break

      case Texture.Tiling.Horizontal:
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_S, this.gl.REPEAT)
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE)

        break

      case Texture.Tiling.Vertical:
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE)
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_WRAP_T, this.gl.REPEAT)

        break
    }

    switch (texture.filtering) {
      case Texture.Filtering.None:
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST)

        break

      case Texture.Filtering.Linear:
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST)
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_MIN_FILTER, mipmaps ? this.gl.LINEAR_MIPMAP_NEAREST : this.gl.LINEAR)

        break

      case Texture.Filtering.Bilinear:
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_MIN_FILTER, mipmaps ? this.gl.LINEAR_MIPMAP_NEAREST : this.gl.LINEAR)

        break

      case Texture.Filtering.Trilinear:
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR)
        this.gl.texParameteri(texture.target, this.gl.TEXTURE_MIN_FILTER, mipmaps ? this.gl.LINEAR_MIPMAP_LINEAR : this.gl.LINEAR)

        break
    }

    this.textures.push(texture)

    return texture
  }

  update(texture: Texture, source: any, x = 0, y = 0, width?: number, height?: number) {
    if (width === undefined) {
      width = texture.width
    }

    if (height === undefined) {
      height = texture.width
    }

    this.bind(texture, 0)

    this.gl.texSubImage2D(texture.target, 0, x, y, width, height, texture.format, texture.type, source)

    if (texture.useMipmaps) {
      this.gl.generateMipmap(texture.target)
    }
  }

  private bind(texture: Texture, unit: number) {
    if (this.boundTextures[unit] === texture) {
      return
    }

    this.gl.activeTexture(this.gl.TEXTURE0 + unit)
    this.gl.bindTexture(texture.target, texture)

    this.boundTextures[unit] = texture
  }

}