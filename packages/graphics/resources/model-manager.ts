import type { Scene } from '@luz/scene'
import { MaterialCompiler } from '../compilers/material-compiler'
import { MeshCompiler } from '../compilers/mesh-compiler'
import { ModelCompiler } from '../compilers/model-compiler'
import { TextureCompiler, type SurfaceResolver } from '../compilers/texture-compiler'
import { ModelLoader } from '../loaders/model-loader'
import { readBinary, readJson } from '../loaders/resource-readers'
import type { Model } from '../model'
import { isModel } from '../model'
import type { RenderBackend } from '../renderer/render-backend'

export interface ResourceOptions {
  resolveSurface: SurfaceResolver
  readJson?: (url: string, signal?: AbortSignal) => Promise<unknown>
  readBinary?: (url: string, signal?: AbortSignal) => Promise<ArrayBuffer>
}
export type CompilationProgress = (completed: number, total: number) => void
export class ModelManager {
  readonly compiler: ModelCompiler
  readonly loader: ModelLoader

  private readonly textures: TextureCompiler
  private readonly materials: MaterialCompiler
  private readonly requests = new AbortController()
  constructor(backend: RenderBackend, options: ResourceOptions) {
    this.textures = new TextureCompiler(backend, options.resolveSurface)
    this.materials = new MaterialCompiler(this.textures, backend.maximumTextureUnits)
    this.compiler = new ModelCompiler(backend, this.materials, new MeshCompiler(backend))
    this.loader = new ModelLoader(
      (url) => (options.readJson ?? readJson)(url, this.requests.signal),
      (url) => (options.readBinary ?? readBinary)(url, this.requests.signal)
    )
  }

  async load(path: string): Promise<Model> {
    this.requests.signal.throwIfAborted()

    const model = await this.loader.load(path)

    await this.compile(model)

    return model
  }

  async compile(model: Model): Promise<void> {
    this.requests.signal.throwIfAborted()

    await this.compiler.compile(model, this.loader.findAssetIdentity(model))
    this.requests.signal.throwIfAborted()
  }

  async prepareScene(scene: Scene, onProgress?: CompilationProgress): Promise<void> {
    const models = scene
      .collectEntities()
      .flatMap((entity) => Object.values(entity.components))
      .filter(isModel)

    let completed = 0

    onProgress?.(completed, models.length)

    const results = await Promise.allSettled(
      models.map(async (model) => {
        await this.compile(model)

        completed += 1

        onProgress?.(completed, models.length)
      })
    )
    const failure = results.find((result) => result.status === 'rejected')

    if (failure || this.requests.signal.aborted) {
      this.releaseScene(scene)
      throw failure?.status === 'rejected' ? failure.reason : this.requests.signal.reason
    }
  }

  releaseScene(scene: Scene): void {
    for (const entity of scene.collectEntities()) {
      for (const component of Object.values(entity.components)) {
        if (isModel(component)) {
          this.compiler.release(component)
        }
      }
    }
  }

  beginReload(): void {
    this.loader.beginReload()
    this.compiler.beginReload()
    this.textures.beginReload()
  }

  destroy(): void {
    this.requests.abort()
    this.loader.beginReload()
    this.compiler.clear()
    this.materials.clear()
    this.textures.clear()
  }
}
