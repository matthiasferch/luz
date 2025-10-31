import { Texture } from '../../../types/texture'
import { Surface } from '../../surface'
import { TextureManager } from '../../renderer'

export class WebGL2TextureManager implements TextureManager {
  private textures: Texture[] = []

  private boundTextures: Record<number, Texture> = {}

  constructor(private gl: WebGL2RenderingContext) { }

  create(surface: Partial<Surface>): Texture {
    const { gl } = this

    const texture = gl.createTexture() as Texture

    const { width = 1, height = 1, precision = 8, format = 'Color' } = surface
    const { tiling = 'None', filtering = 'None', useMipmaps = false } = surface

    texture.width = width
    texture.height = height

    texture.target = gl.TEXTURE_2D
    texture.useMipmaps = useMipmaps

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

    return texture
  }

  update(texture: Texture, data: any, x = 0, y = 0, width?: number, height?: number) {
    const { gl } = this

    this.bind(texture, 0)

    const { target, dataFormat, dataType, useMipmaps } = texture

    const isImageLike =
      (typeof ImageBitmap !== 'undefined' && data instanceof ImageBitmap) ||
      (typeof HTMLImageElement !== 'undefined' && data instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement !== 'undefined' && data instanceof HTMLCanvasElement) ||
      (typeof HTMLVideoElement !== 'undefined' && data instanceof HTMLVideoElement)

    if (isImageLike) {
      const srcW = (data as any).width
      const srcH = (data as any).height

      // Reallocate storage if size changed
      if (srcW !== texture.width || srcH !== texture.height) {
        texture.width = srcW
        texture.height = srcH
        gl.texImage2D(target, 0, texture.components, texture.width, texture.height, 0, texture.dataFormat, texture.dataType, null)
      }

      // Use TexImageSource overload (no width/height parameters)
      gl.texSubImage2D(target, 0, 0, 0, dataFormat, dataType, data)
    } else {
      // Typed/buffer data path
      if (width === undefined) width = texture.width
      if (height === undefined) height = texture.height

      // Reallocate storage if size changed
      if (width !== texture.width || height !== texture.height) {
        texture.width = width!
        texture.height = height!
        gl.texImage2D(target, 0, texture.components, texture.width, texture.height, 0, texture.dataFormat, texture.dataType, null)
      }

      gl.texSubImage2D(target, 0, x, y, width!, height!, dataFormat, dataType, data)
    }

    if (useMipmaps) {
      gl.generateMipmap(target)
    }

    texture.data = data
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

  // Create a cubemap texture from a parsed KTX container (v1).
  // The container object is expected to provide glType/glFormat/glInternalFormat,
  // numberOfFaces (6), numberOfMipmapLevels, pixelWidth/Height and per-level face data.
  createCubeFromKTX(container: any): Texture {
    const { gl } = this

    if (!container || container.numberOfFaces !== 6) {
      throw new Error('KTX: only cubemap textures (6 faces) are supported')
    }

    const texture = gl.createTexture() as Texture

    texture.target = gl.TEXTURE_CUBE_MAP
    texture.useMipmaps = (container.numberOfMipmapLevels ?? 1) > 1
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
          if (type === gl.FLOAT) return gl.RGBA32F
          if (type === gl.HALF_FLOAT || type === 0x8D61 /* HALF_FLOAT_OES */) return gl.RGBA16F
          return gl.RGBA8
        }
        if (format === gl.RGB) {
          if (type === gl.FLOAT) return gl.RGB32F
          if (type === gl.HALF_FLOAT || type === 0x8D61) return gl.RGB16F
          return gl.RGB8
        }
      }
      return internal ?? gl.RGBA
    }

    texture.components = inferInternalFormat()
    texture.dataFormat = container.glBaseInternalFormat ?? container.glFormat ?? gl.RGBA
    texture.dataType = container.glType || gl.UNSIGNED_BYTE

    this.bind(texture, 0)

    // Default parameters: clamp and filtered depending on mipmaps
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(texture.target, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)
    gl.texParameteri(texture.target, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(
      texture.target,
      gl.TEXTURE_MIN_FILTER,
      texture.useMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
    )

    // Ensure tight packing for uncompressed
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

    const isCompressed = (container.glType === 0)
    const levels = container.levels as Array<{ width: number, height: number, faces: Uint8Array[] }>

    const faceTargets = [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
    ]

    const HALF_FLOAT_OES = 0x8D61
    const toTypedView = (type: number, bytes: Uint8Array): ArrayBufferView => {
      // Normalize HALF_FLOAT_OES to WebGL2 HALF_FLOAT
      const glType = (type === HALF_FLOAT_OES) ? gl.HALF_FLOAT : type

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
          // Fallback: upload raw bytes
          return bytes
      }
    }

    const normalizeType = (type: number) => (type === HALF_FLOAT_OES ? gl.HALF_FLOAT : type)

    // Convert a Uint16Array of IEEE 754 half-floats to Float32Array
    const halfToFloat32Array = (src: Uint16Array): Float32Array => {
      const out = new Float32Array(src.length)
      for (let i = 0; i < src.length; i++) {
        const h = src[i]
        const s = (h & 0x8000) >> 15
        const e = (h & 0x7C00) >> 10
        const f = h & 0x03FF
        let v: number
        if (e === 0) {
          v = (f ? Math.pow(2, -24) * f : 0)
        } else if (e === 0x1F) {
          v = f ? NaN : Infinity
        } else {
          v = Math.pow(2, e - 15) * (1 + f / 1024)
        }
        out[i] = s ? -v : v
      }
      return out
    }

    for (let level = 0; level < levels.length; level++) {
      const { width, height, faces } = levels[level]
      for (let f = 0; f < 6; f++) {
        const targetFace = faceTargets[f]
        const data = faces[f]
        if (isCompressed) {
          gl.compressedTexImage2D(targetFace, level, container.glInternalFormat, width, height, 0, data)
        } else {
          const type = normalizeType(container.glType)
          const view = toTypedView(container.glType, data)
          gl.texImage2D(targetFace, level, container.glInternalFormat, width, height, 0, container.glFormat, type, view)
          const err = gl.getError()
          if (err !== gl.NO_ERROR) {
            // tslint:disable-next-line: no-console
            console.warn('Cube face upload error', { level, face: f, width, height, internal: container.glInternalFormat, format: container.glFormat, type, err })
          }
        }
      }
    }

    return texture
  }

  // Create a 2D texture from a parsed KTX container (v1) with faces=1.
  create2DFromKTX(container: any): Texture {
    const { gl } = this

    if (!container || container.numberOfFaces !== 1) {
      throw new Error('KTX: create2DFromKTX expects numberOfFaces = 1')
    }

    const texture = gl.createTexture() as Texture
    texture.target = gl.TEXTURE_2D
    texture.width = container.pixelWidth
    texture.height = container.pixelHeight
    texture.useMipmaps = (container.numberOfMipmapLevels ?? 1) > 1

    const HALF_FLOAT_OES = 0x8D61
    const normalizeType = (type: number) => (type === HALF_FLOAT_OES ? gl.HALF_FLOAT : type)

    const inferInternalFormat = () => {
      const internal = container.glInternalFormat
      const format = container.glFormat
      const type = normalizeType(container.glType)
      if (internal === format) {
        if (format === gl.RGBA) {
          if (type === gl.FLOAT) return gl.RGBA32F
          if (type === gl.HALF_FLOAT) return gl.RGBA16F
          return gl.RGBA8
        }
        if (format === gl.RGB) {
          if (type === gl.FLOAT) return gl.RGB32F
          if (type === gl.HALF_FLOAT) return gl.RGB16F
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
      texture.useMipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
    )

    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)

    const isCompressed = (container.glType === 0)
    const levels = container.levels as Array<{ width: number, height: number, faces: Uint8Array[] }>

    for (let level = 0; level < levels.length; level++) {
      const { width, height, faces } = levels[level]
      const data = faces[0]
      if (isCompressed) {
        gl.compressedTexImage2D(gl.TEXTURE_2D, level, container.glInternalFormat, width, height, 0, data)
      } else {
        const type = texture.dataType
        let view: ArrayBufferView
        // select view based on type
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
  }
}
