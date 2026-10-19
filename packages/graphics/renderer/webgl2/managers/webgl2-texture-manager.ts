import type { KTXContainer } from '@luz/formats'
import type { Texture } from '../../../types/texture'
import type { SurfaceOptions } from '../../surface'
import { getImageDimensions } from '../../../types/texture-source'
import type { TextureSource } from '../../../types/texture-source'
import type { TextureManager } from '../../render-backend'

export class WebGL2TextureManager implements TextureManager {
  private readonly textures = new Set<Texture>()

  private boundTextures: Record<number, Texture> = {}

  constructor(private gl: WebGL2RenderingContext) {}

  create(surface: SurfaceOptions): Texture {
    const { gl } = this

    const texture = this.createTexture()

    try {
      const { width = 1, height = 1, precision = 8, format = 'color', colorSpace = 'linear' } = surface
      const { tiling = 'none', filtering = 'none', areMipmapsEnabled: areMipmapsEnabled = false } = surface

      texture.width = width
      texture.height = height
      texture.colorSpace = colorSpace
      texture.target = gl.TEXTURE_2D
      texture.areMipmapsEnabled = areMipmapsEnabled

      switch (format) {
        case 'color':
          switch (precision) {
            case 8:
              texture.components = colorSpace === 'sRGB' ? gl.SRGB8_ALPHA8 : gl.RGBA8
              texture.dataFormat = gl.RGBA
              texture.dataType = gl.UNSIGNED_BYTE

              break

            case 16:
              texture.components = gl.RGBA16F
              texture.dataFormat = gl.RGBA
              texture.dataType = gl.HALF_FLOAT
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

        case 'red':
          switch (precision) {
            case 8:
              texture.components = gl.R8
              texture.dataFormat = gl.RED
              texture.dataType = gl.UNSIGNED_BYTE
              break

            case 16:
              texture.components = gl.R16F
              texture.dataFormat = gl.RED
              texture.dataType = gl.HALF_FLOAT
              break

            case 32:
              texture.components = gl.R32F
              texture.dataFormat = gl.RED
              texture.dataType = gl.FLOAT
              break

            default:
              throw new Error(`Invalid texture precision: ${precision}`)
          }

          break

        case 'redGreen':
          switch (precision) {
            case 8:
              texture.components = gl.RG8
              texture.dataFormat = gl.RG
              texture.dataType = gl.UNSIGNED_BYTE
              break

            case 16:
              texture.components = gl.RG16F
              texture.dataFormat = gl.RG
              texture.dataType = gl.HALF_FLOAT
              break

            case 32:
              texture.components = gl.RG32F
              texture.dataFormat = gl.RG
              texture.dataType = gl.FLOAT
              break

            default:
              throw new Error(`Invalid texture precision: ${precision}`)
          }

          break

        case 'alpha':
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

        case 'depth': {
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
          throw new Error(`Invalid texture tiling: ${tiling}`)
      }

      switch (filtering) {
        case 'none':
          gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
          gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, gl.NEAREST)

          break

        case 'linear':
          gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
          gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, areMipmapsEnabled ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR)

          break

        case 'bilinear':
          gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, areMipmapsEnabled ? gl.LINEAR_MIPMAP_NEAREST : gl.LINEAR)

          break

        case 'trilinear':
          gl.texParameteri(target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
          gl.texParameteri(target, gl.TEXTURE_MIN_FILTER, areMipmapsEnabled ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR)

          break
      }

      if (surface.data) {
        this.update(texture, surface.data)
      }

      this.unbindIfBound(texture)

      return texture
    } catch (error) {
      this.destroy(texture)

      throw error
    }
  }

  update(texture: Texture, data: TextureSource, x = 0, y = 0, width?: number, height?: number) {
    const { gl } = this

    this.bind(texture, 0)

    const { target, dataFormat, dataType, areMipmapsEnabled: areMipmapsEnabled } = texture

    if (!ArrayBuffer.isView(data)) {
      gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE)

      const [sourceWidth, sourceHeight] = getImageDimensions(data)

      if (sourceWidth !== texture.width || sourceHeight !== texture.height) {
        texture.width = sourceWidth
        texture.height = sourceHeight

        gl.texImage2D(
          target,
          0,
          texture.components,
          texture.width,
          texture.height,
          0,
          texture.dataFormat,
          texture.dataType,
          null
        )
      }

      gl.texSubImage2D(target, 0, 0, 0, dataFormat, dataType, data)
    } else {
      if (width === undefined) {
        width = texture.width
      }

      if (height === undefined) {
        height = texture.height
      }

      if (width !== texture.width || height !== texture.height) {
        texture.width = width!
        texture.height = height!

        gl.texImage2D(
          target,
          0,
          texture.components,
          texture.width,
          texture.height,
          0,
          texture.dataFormat,
          texture.dataType,
          null
        )
      }

      gl.texSubImage2D(target, 0, x, y, width, height, dataFormat, dataType, data)
    }

    if (areMipmapsEnabled) {
      gl.generateMipmap(target)
    }

    texture.data = data
  }

  private createTexture(): Texture {
    const texture = this.gl.createTexture() as Texture | null

    if (!texture) {
      throw new Error('Unable to allocate texture')
    }

    this.textures.add(texture)

    return texture
  }

  destroy(texture: Texture): void {
    if (!this.textures.delete(texture)) {
      return
    }

    this.unbindIfBound(texture)
    this.gl.deleteTexture(texture)
  }

  destroyAll(): void {
    for (const texture of this.textures) {
      this.destroy(texture)
    }
  }

  bind(texture: Texture, unit: number) {
    const { gl } = this

    if (this.boundTextures[unit] === texture) {
      return
    }

    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(texture.target, texture)

    this.boundTextures[unit] = texture
  }

  invalidateBindings(): void {
    this.boundTextures = {}
  }

  unbindIfBound(texture: Texture) {
    const { gl } = this

    for (const key of Object.keys(this.boundTextures)) {
      const unit = Number(key)

      if (this.boundTextures[unit] === texture) {
        gl.activeTexture(gl.TEXTURE0 + unit)
        gl.bindTexture(texture.target, null)
        delete this.boundTextures[unit]
      }
    }
  }

  createCubeFromKTX(container: KTXContainer): Texture {
    const { gl } = this

    if (!container || container.numberOfFaces !== 6) {
      throw new Error('KTX: only cubemap textures (6 faces) are supported')
    }

    const texture = this.createTexture()

    try {
      texture.target = gl.TEXTURE_CUBE_MAP
      texture.areMipmapsEnabled = (container.numberOfMipmapLevels ?? 1) > 1
      texture.width = container.pixelWidth
      texture.height = container.pixelHeight

      // Pick sized internal format when possible; fall back safely when container provides unsized enums
      const inferInternalFormat = () => {
        const internal = container.glInternalFormat
        const format = container.glFormat
        const type = container.glType

        // If internal equals base format (unsized), infer a sized format from format+type
        if (internal === format) {
          if (format === gl.RGBA) {
            if (type === gl.FLOAT) {
              return gl.RGBA32F
            }

            if (type === gl.HALF_FLOAT || type === 0x8d61) {
              return gl.RGBA16F
            }

            return gl.RGBA8
          }

          if (format === gl.RGB) {
            if (type === gl.FLOAT) {
              return gl.RGB32F
            }

            if (type === gl.HALF_FLOAT || type === 0x8d61) {
              return gl.RGB16F
            }

            return gl.RGB8
          }
        }

        return internal ?? gl.RGBA
      }

      texture.components = inferInternalFormat()
      texture.dataFormat = container.glBaseInternalFormat ?? container.glFormat ?? gl.RGBA
      texture.dataType = container.glType || gl.UNSIGNED_BYTE

      this.bind(texture, 0)
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)
      gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(
        texture.target,
        gl.TEXTURE_MIN_FILTER,
        texture.areMipmapsEnabled ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
      )
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

      const isCompressed = container.glType === 0
      const levels = container.levels

      const faceTargets = [
        gl.TEXTURE_CUBE_MAP_POSITIVE_X,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
        gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
        gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
      ]

      const HALF_FLOAT_OES = 0x8d61
      const createTypedView = (type: number, bytes: Uint8Array): ArrayBufferView => {
        // Normalize HALF_FLOAT_OES to WebGL2 HALF_FLOAT
        const glType = type === HALF_FLOAT_OES ? gl.HALF_FLOAT : type

        switch (glType) {
          case gl.UNSIGNED_BYTE:
            return bytes
          case gl.HALF_FLOAT:
          case gl.UNSIGNED_SHORT:
          case gl.UNSIGNED_SHORT_5_6_5:
          case gl.UNSIGNED_SHORT_4_4_4_4:
          case gl.UNSIGNED_SHORT_5_5_5_1:
            return new Uint16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2)
          case gl.FLOAT:
            return new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4)
          case gl.UNSIGNED_INT:
            return new Uint32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4)
          default:
            return bytes
        }
      }

      const normalizeType = (type: number) => (type === HALF_FLOAT_OES ? gl.HALF_FLOAT : type)

      for (let level = 0; level < levels.length; level++) {
        const { width, height, faces } = levels[level]

        for (let faceIndex = 0; faceIndex < 6; faceIndex++) {
          const targetFace = faceTargets[faceIndex]
          const data = faces[faceIndex]

          if (isCompressed) {
            gl.compressedTexImage2D(targetFace, level, container.glInternalFormat, width, height, 0, data)
          } else {
            const type = normalizeType(container.glType)
            const view = createTypedView(container.glType, data)

            gl.texImage2D(
              targetFace,
              level,
              container.glInternalFormat,
              width,
              height,
              0,
              container.glFormat,
              type,
              view
            )

            const error = gl.getError()

            if (error !== gl.NO_ERROR) {
              console.warn('Cube face upload error', {
                level,
                face: faceIndex,
                width,
                height,
                internal: container.glInternalFormat,
                format: container.glFormat,
                type,
                error
              })
            }
          }
        }
      }

      return texture
    } catch (error) {
      this.destroy(texture)

      throw error
    }
  }

  create2DFromKTX(container: KTXContainer): Texture {
    const { gl } = this

    if (!container || container.numberOfFaces !== 1) {
      throw new Error('KTX: create2DFromKTX expects numberOfFaces = 1')
    }

    const texture = this.createTexture()

    try {
      texture.target = gl.TEXTURE_2D
      texture.width = container.pixelWidth
      texture.height = container.pixelHeight
      texture.areMipmapsEnabled = (container.numberOfMipmapLevels ?? 1) > 1

      const HALF_FLOAT_OES = 0x8d61
      const normalizeType = (type: number) => (type === HALF_FLOAT_OES ? gl.HALF_FLOAT : type)

      const inferInternalFormat = () => {
        const internal = container.glInternalFormat
        const format = container.glFormat
        const type = normalizeType(container.glType)

        if (internal === format) {
          if (format === gl.RGBA) {
            if (type === gl.FLOAT) {
              return gl.RGBA32F
            }

            if (type === gl.HALF_FLOAT) {
              return gl.RGBA16F
            }

            return gl.RGBA8
          }

          if (format === gl.RGB) {
            if (type === gl.FLOAT) {
              return gl.RGB32F
            }

            if (type === gl.HALF_FLOAT) {
              return gl.RGB16F
            }

            return gl.RGB8
          }
        }

        return internal ?? gl.RGBA
      }

      texture.components = inferInternalFormat()
      texture.dataFormat = container.glBaseInternalFormat ?? container.glFormat ?? gl.RGBA
      texture.dataType = normalizeType(container.glType || gl.UNSIGNED_BYTE)

      this.bind(texture, 0)
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
      gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      gl.texParameteri(
        texture.target,
        gl.TEXTURE_MIN_FILTER,
        texture.areMipmapsEnabled ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
      )
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

      const isCompressed = container.glType === 0
      const levels = container.levels

      for (let level = 0; level < levels.length; level++) {
        const { width, height, faces } = levels[level]
        const data = faces[0]

        if (isCompressed) {
          gl.compressedTexImage2D(gl.TEXTURE_2D, level, container.glInternalFormat, width, height, 0, data)
        } else {
          const type = texture.dataType

          let view: ArrayBufferView

          switch (type) {
            case gl.UNSIGNED_BYTE:
              view = data
              break
            case gl.HALF_FLOAT:
            case gl.UNSIGNED_SHORT:
            case gl.UNSIGNED_SHORT_5_6_5:
            case gl.UNSIGNED_SHORT_4_4_4_4:
            case gl.UNSIGNED_SHORT_5_5_5_1:
              view = new Uint16Array(data.buffer, data.byteOffset, data.byteLength / 2)
              break
            case gl.FLOAT:
              view = new Float32Array(data.buffer, data.byteOffset, data.byteLength / 4)
              break
            case gl.UNSIGNED_INT:
              view = new Uint32Array(data.buffer, data.byteOffset, data.byteLength / 4)
              break
            default:
              view = data
          }

          gl.texImage2D(gl.TEXTURE_2D, level, texture.components, width, height, 0, texture.dataFormat, type, view)
        }
      }

      return texture
    } catch (error) {
      this.destroy(texture)

      throw error
    }
  }
}
