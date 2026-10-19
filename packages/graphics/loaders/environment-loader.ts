import type { EnvironmentDefinition } from '@luz/formats'
import type { ImageLoader, ImageSource } from './image-loader'

export interface Environment {
  irradiance: ImageSource
  radiance: ImageSource
  sky?: ImageSource
  rotation: number
}

export class EnvironmentLoader {
  constructor(private readonly images: ImageLoader) {}

  async load(definition: EnvironmentDefinition): Promise<Environment> {
    const { irradiance: irradiancePath, radiance: radiancePath, sky: skyPath, rotation = 0 } = definition
    const [irradiance, radiance, sky] = await Promise.all([
      this.images.loadSource(irradiancePath),
      this.images.loadSource(radiancePath),
      skyPath ? this.images.loadSource(skyPath) : Promise.resolve(undefined)
    ])

    return { irradiance, radiance, sky, rotation }
  }
}
