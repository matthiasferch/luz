import { ResourceScope } from '../resources/resource-scope'
import type { KTXContainer } from '@luz/formats'
import type { Environment } from '../loaders/environment-loader'
import type { ImageSource } from '../loaders/image-loader'
import type { RenderBackend } from '../renderer/render-backend'
import type { Texture } from '../types/texture'
import { getImageDimensions } from '../types/texture-source'
import { type EnvironmentSettings } from './settings'

interface EffectContext {
  readonly backend: RenderBackend
  readonly environmentSettings: EnvironmentSettings
}
export class EnvironmentManager {
  private readonly scope: ResourceScope
  private readonly context: EffectContext

  constructor(context: EffectContext) {
    this.scope = new ResourceScope(context.backend)
    this.context = Object.create(context) as EffectContext

    Object.defineProperty(this.context, 'backend', { value: this.scope.backend })
  }

  destroy(): void {
    this.scope.destroy()
  }
  environmentDiffuseTexture!: Texture
  environmentSpecularTexture!: Texture
  environmentSkyTexture?: Texture
  environmentDiffuseCubeTexture?: Texture
  environmentSpecularCubeTexture?: Texture
  environmentSkyCubeTexture?: Texture
  environmentSpecularCubeMaximumLevelOfDetail: number = 0
  environmentRotation: number = 0
  isCubeEnvironmentEnabled: boolean = false
  ktxDiffuseHeader?: KTXContainer
  ktxSpecularHeader?: KTXContainer
  environmentSpecular2DMaximumLevelOfDetail?: number
  getEnvironmentTextures(): Texture[] {
    return [
      ...new Set(
        [
          this.environmentDiffuseTexture,
          this.environmentSpecularTexture,
          this.environmentSkyTexture,
          this.environmentDiffuseCubeTexture,
          this.environmentSpecularCubeTexture,
          this.environmentSkyCubeTexture
        ].filter((texture): texture is Texture => !!texture && texture !== this.context.backend.defaultTexture)
      )
    ]
  }

  setEnvironment(sources: Environment | null): void {
    const allocations: Texture[] = []

    try {
      if (!sources) {
        const texture = this.context.backend.textures.create({ data: new Uint8Array([0, 0, 0, 255]) })
        const previousTextures = this.getEnvironmentTextures()

        this.environmentDiffuseTexture = texture
        this.environmentSpecularTexture = texture
        this.environmentSkyTexture = undefined
        this.environmentDiffuseCubeTexture = undefined
        this.environmentSpecularCubeTexture = undefined
        this.environmentSkyCubeTexture = undefined
        this.ktxDiffuseHeader = undefined
        this.ktxSpecularHeader = undefined
        this.isCubeEnvironmentEnabled = false
        this.environmentRotation = 0
        this.environmentSpecularCubeMaximumLevelOfDetail = 0
        this.environmentSpecular2DMaximumLevelOfDetail = undefined

        for (const previousTexture of previousTextures) {
          this.context.backend.textures.destroy(previousTexture)
        }

        return
      }

      const { irradiance: diffuseSource, radiance: specularSource, sky: skySource, rotation } = sources
      const { textures } = this.context.backend
      const createTexture = (source: ImageSource, areMipmapsEnabled: boolean): Texture => {
        const texture =
          source.kind === 'ktx'
            ? source.container.numberOfFaces === 6
              ? textures.createCubeFromKTX(source.container)
              : textures.create2DFromKTX(source.container)
            : textures.create({
                data: source.kind === 'image' ? source.image : source.data,
                width: source.kind === 'image' ? getImageDimensions(source.image)[0] : source.width,
                height: source.kind === 'image' ? getImageDimensions(source.image)[1] : source.height,
                filtering: areMipmapsEnabled ? 'trilinear' : 'linear',
                areMipmapsEnabled
              })

        allocations.push(texture)

        return texture
      }
      const diffuseTexture = createTexture(diffuseSource, false)
      const specularTexture = createTexture(specularSource, true)
      const skyTexture = skySource ? createTexture(skySource, true) : undefined

      const previousTextures = this.getEnvironmentTextures()
      const isDiffuseCube = diffuseSource.kind === 'ktx' && diffuseSource.container.numberOfFaces === 6
      const isSpecularCube = specularSource.kind === 'ktx' && specularSource.container.numberOfFaces === 6
      const isSkyCube = skySource?.kind === 'ktx' && skySource.container.numberOfFaces === 6

      this.environmentDiffuseTexture = isDiffuseCube ? this.context.backend.defaultTexture : diffuseTexture
      this.environmentSpecularTexture = isSpecularCube ? this.context.backend.defaultTexture : specularTexture
      this.environmentSkyTexture = isSkyCube ? undefined : skyTexture
      this.environmentDiffuseCubeTexture = isDiffuseCube ? diffuseTexture : undefined
      this.environmentSpecularCubeTexture = isSpecularCube ? specularTexture : undefined
      this.environmentSkyCubeTexture = isSkyCube ? skyTexture : undefined
      this.ktxDiffuseHeader = diffuseSource.kind === 'ktx' ? diffuseSource.container : undefined
      this.ktxSpecularHeader = specularSource.kind === 'ktx' ? specularSource.container : undefined
      this.environmentSpecularCubeMaximumLevelOfDetail = isSpecularCube
        ? Math.max(0, this.ktxSpecularHeader!.numberOfMipmapLevels - 1)
        : 0
      this.environmentSpecular2DMaximumLevelOfDetail =
        !isSpecularCube && this.ktxSpecularHeader
          ? Math.max(0, this.ktxSpecularHeader.numberOfMipmapLevels - 1)
          : undefined
      this.isCubeEnvironmentEnabled = isDiffuseCube && isSpecularCube
      this.environmentRotation = rotation

      for (const texture of previousTextures) {
        textures.destroy(texture)
      }
    } catch (error) {
      for (const texture of allocations) {
        this.context.backend.textures.destroy(texture)
      }

      throw error
    }
  }

  calculateEnvironmentRotation(): number {
    return this.environmentRotation + (this.context.environmentSettings.rotationDegrees * Math.PI) / 180.0
  }
}
