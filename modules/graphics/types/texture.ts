import { DeserializationCallbacks } from '@luz/utilities/serializable'

export type SerializedTexture = {
  path?: string
  data?: any

  width: number
  height: number

  format: Texture.Format
  precision: Texture.Precision

  tiling: Texture.Tiling
  filtering: Texture.Filtering

  useMipmaps: boolean
}

export type Texture = WebGLTexture &
  SerializedTexture & {
    target: number

    dataType: number
    dataFormat: number
    components: number
  }

export namespace Texture {
  export type Precision = 8 | 32

  export type Format = 'color' | 'alpha' | 'depth'
  export type Tiling = 'none' | 'repeat' | 'mirror'
  export type Filtering = 'none' | 'linear' | 'bilinear' | 'trilinear'

  export async function deserialize(texture: SerializedTexture, callbacks: DeserializationCallbacks) {
    if ('data' in texture) {
      const { width, height, precision = 8 } = texture

      const data = precision === 8 ? new Uint8Array(texture.data) : new Float32Array(texture.data)

      return callbacks.onDeserializeTexture({ ...texture, width, height, data })
    }

    if ('path' in texture) {
      const { path } = texture

      const data = await new Promise<HTMLImageElement>((resolve) => {
        const image = new Image()

        image.addEventListener('load', () => resolve(image))

        image.src = './assets/' + path
      })

      const { width, height } = data

      return callbacks.onDeserializeTexture({ ...texture, width, height, path, data })
    }

    throw new Error('Textures need to provide either a path or a data property')
  }
}
