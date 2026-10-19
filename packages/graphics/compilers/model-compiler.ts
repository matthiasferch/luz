import type { Model } from '../model'
import type { RenderBackend } from '../renderer/render-backend'
import type { RenderMaterial } from '../renderer/render-material'
import type { RenderModel } from '../renderer/render-model'
import type { ModelIdentity } from '../loaders/model-loader'
import type { Primitive } from '../types/primitive'
import type { Mesh } from '../renderer/mesh'
import type { MaterialCompiler } from './material-compiler'
import type { MeshCompiler } from './mesh-compiler'

interface CompiledAsset {
  materials: Record<string, RenderMaterial>
  primitives: Record<string, Primitive>
}

interface AssetRequest {
  promise: Promise<CompiledAsset>
  referenceCount: number
  key?: string
  asset?: CompiledAsset
}

interface ModelAllocation {
  model: RenderModel
  request: AssetRequest
  generation: number
}

export class ModelCompiler {
  private readonly compiledModels = new Map<Model, ModelAllocation>()
  private readonly compiledAssets = new Map<string, AssetRequest>()
  private readonly pendingModels = new Map<Model, { key?: string; promise: Promise<RenderModel> }>()
  private readonly revisions = new WeakMap<Model, symbol>()
  private readonly meshIds = new WeakMap<Mesh, number>()

  private generation = 0
  private nextMeshId = 0

  constructor(
    private readonly backend: RenderBackend,
    private readonly materials: MaterialCompiler,
    private readonly meshes: MeshCompiler
  ) {}

  compile(model: Model, identity?: ModelIdentity): Promise<RenderModel> {
    const geometryKey = this.getGeometryKey(model)
    const key = identity ? JSON.stringify([identity.url, identity.fingerprint, geometryKey]) : undefined
    const existingModel = this.compiledModels.get(model)
    const pendingModel = this.pendingModels.get(model)

    if (key && existingModel?.request.key === key && existingModel.generation === this.generation) {
      this.revisions.delete(model)
      this.pendingModels.delete(model)

      return Promise.resolve(existingModel.model)
    }

    if (key && pendingModel?.key === key) {
      return pendingModel.promise
    }

    const revision = Symbol()

    this.revisions.set(model, revision)

    const promise = this.compileModel(model, key, geometryKey, revision, this.generation)
    const request = { key, promise }
    const removeRequest = () => {
      if (this.pendingModels.get(model) === request) {
        this.pendingModels.delete(model)
      }
    }

    this.pendingModels.set(model, request)
    promise.then(removeRequest, removeRequest)

    return promise
  }

  private async compileModel(
    model: Model,
    key: string | undefined,
    geometryKey: string,
    revision: symbol,
    generation: number
  ): Promise<RenderModel> {
    let request = key ? this.compiledAssets.get(key) : undefined

    if (!request) {
      const newRequest: AssetRequest = { key, referenceCount: 0, promise: this.compileAsset(model) }

      request = newRequest

      if (key) {
        this.compiledAssets.set(key, newRequest)
      }

      newRequest.promise.then(
        (asset) => {
          newRequest.asset = asset
        },
        () => {
          if (key && this.compiledAssets.get(key) === newRequest) {
            this.compiledAssets.delete(key)
          }
        }
      )
    }

    request.referenceCount += 1

    try {
      const asset = await request.promise

      if (
        generation !== this.generation ||
        this.revisions.get(model) !== revision ||
        this.getGeometryKey(model) !== geometryKey
      ) {
        throw new Error('Model compilation was invalidated')
      }

      const renderModel: RenderModel = { source: model, materials: asset.materials, primitives: asset.primitives }
      const previousAllocation = this.compiledModels.get(model)

      this.compiledModels.set(model, { model: renderModel, request, generation })

      if (previousAllocation) {
        this.releaseAsset(previousAllocation.request)
      }

      return renderModel
    } catch (error) {
      this.releaseAsset(request)

      throw error
    }
  }

  private getGeometryKey(model: Model): string {
    return JSON.stringify(
      Object.entries(model.meshes).map(([name, mesh]) => {
        if (mesh.geometryRevision === 0) {
          return [name, 0]
        }

        let id = this.meshIds.get(mesh)

        if (id === undefined) {
          id = this.nextMeshId++

          this.meshIds.set(mesh, id)
        }

        return [name, id, mesh.geometryRevision]
      })
    )
  }

  private async compileAsset(model: Model): Promise<CompiledAsset> {
    const asset: CompiledAsset = { materials: {}, primitives: {} }
    const results = await Promise.allSettled(
      Object.entries(model.materials).map(async ([name, material]) => {
        asset.materials[name] = await this.materials.compile(material)
      })
    )

    try {
      const failure = results.find((result) => result.status === 'rejected')

      if (failure?.status === 'rejected') {
        throw failure.reason
      }

      for (const [name, mesh] of Object.entries(model.meshes)) {
        const material = asset.materials[mesh.material] ?? this.backend.defaultMaterial

        asset.primitives[name] = this.meshes.compile(mesh, material)
      }

      return asset
    } catch (error) {
      this.destroyAsset(asset)

      throw error
    }
  }

  private releaseAsset(request: AssetRequest): void {
    request.referenceCount -= 1

    if (request.referenceCount > 0) {
      return
    }

    if (request.key && this.compiledAssets.get(request.key) === request) {
      this.compiledAssets.delete(request.key)
    }

    if (request.asset) {
      this.destroyAsset(request.asset)
    }
  }

  private destroyAsset(asset: CompiledAsset): void {
    for (const primitive of Object.values(asset.primitives)) {
      this.backend.primitives.destroy(primitive)
    }

    for (const material of Object.values(asset.materials)) {
      this.materials.release(material)
    }
  }

  release(model: Model): void {
    const allocation = this.compiledModels.get(model)

    this.revisions.delete(model)
    this.pendingModels.delete(model)
    this.compiledModels.delete(model)

    if (allocation) {
      this.releaseAsset(allocation.request)
    }
  }

  beginReload(): void {
    this.generation += 1

    this.compiledAssets.clear()
    this.pendingModels.clear()
  }

  clear(): void {
    this.beginReload()

    for (const model of this.compiledModels.keys()) {
      this.release(model)
    }
  }

  requireCompiledModel(model: Model): RenderModel {
    const allocation = this.compiledModels.get(model)

    if (!allocation) {
      throw new Error('Model has not been compiled')
    }

    return allocation.model
  }
}
