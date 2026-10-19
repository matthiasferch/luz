import { Entity } from '@luz/core'
import { isBody } from '@luz/physics'
import { Scene } from '@luz/scene'
import { readDefinition } from '@luz/serialization'
import { ModelLoader, type JsonReader } from './model-loader'

export class EntityLoader {
  private readonly sources = new Map<string, Promise<unknown>>()

  constructor(
    readonly models = new ModelLoader(),
    private readonly loadJson: JsonReader = async (url) => {
      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Failed to load entity document '${url}': ${response.status}`)
      }

      return response.json()
    }
  ) {}

  beginReload(): void {
    this.sources.clear()
    this.models.beginReload()
  }

  async loadEntity(url: string): Promise<Entity> {
    const absoluteUrl = this.resolveAbsoluteUrl(url)

    return this.loadEntityData(await this.loadSourceDocument(absoluteUrl), absoluteUrl)
  }

  async loadScene(url: string): Promise<Scene> {
    const absoluteUrl = this.resolveAbsoluteUrl(url)

    return this.loadSceneData(await this.loadSourceDocument(absoluteUrl), absoluteUrl)
  }

  async loadEntityData(data: unknown, url: string): Promise<Entity> {
    const absoluteUrl = this.resolveAbsoluteUrl(url)

    return this.createEntityNode(data, absoluteUrl, [absoluteUrl])
  }

  async loadSceneData(data: unknown, url: string): Promise<Scene> {
    const absoluteUrl = this.resolveAbsoluteUrl(url)
    const definition = readDefinition(data, `Scene '${absoluteUrl}'`)
    const nodes = definition.entities === undefined ? {} : readDefinition(definition.entities, 'Scene entities')
    const entities = Object.fromEntries(
      await Promise.all(
        Object.entries(nodes).map(async ([name, node]) => [
          name,
          await this.createEntityNode(node, absoluteUrl, [absoluteUrl])
        ])
      )
    )
    const scene = await Scene.deserialize({ ...definition, entities })

    if (scene.environment) {
      for (const key of ['sky', 'radiance', 'irradiance'] as const) {
        scene.environment[key] = new URL(scene.environment[key], absoluteUrl).toString()
      }
    }

    return scene
  }

  private async createEntityNode(value: unknown, documentUrl: string, chain: string[]): Promise<Entity> {
    const data = readDefinition(value, `Invalid entity in '${documentUrl}'`)

    Entity.validateDefinition(data)

    if (data.colliders) {
      throw new Error(
        `Attached polygon colliders in '${documentUrl}' are unsupported. Use scene-level static colliders or a root body.`
      )
    }

    if (data.entity !== undefined) {
      const unsupported = Object.keys(data).filter(
        (key) => !['entity', 'translation', 'rotation', 'scale', '$schema'].includes(key)
      )

      if (unsupported.length) {
        throw new Error(
          `Entity reference in '${documentUrl}' cannot override ${unsupported.join(', ')}; only root translation, rotation and scale are supported.`
        )
      }

      if (typeof data.entity !== 'string') {
        throw new Error(`Invalid entity reference in '${documentUrl}'`)
      }

      const url = new URL(data.entity, documentUrl).toString()

      if (chain.includes(url)) {
        throw new Error(`Recursive entity reference: ${[...chain, url].join(' -> ')}`)
      }

      const source = await this.loadSourceDocument(url)
      const entity = await this.createEntityNode(source, url, [...chain, url])

      if (
        data.scale !== undefined &&
        Object.values(entity.components).some(isBody) &&
        Array.from(data.scale as ArrayLike<number>).some((value, index) => Math.abs(value - entity.scale[index]) > 1e-6)
      ) {
        throw new Error(
          `Cannot override the scale of root-body asset '${url}': collider dimensions are baked. Export a separate asset with the desired scale.`
        )
      }

      for (const key of ['translation', 'rotation', 'scale'] as const) {
        if (data[key] !== undefined) {
          entity[key].set(data[key] as ArrayLike<number>)
        }
      }

      for (const [, node] of entity.iterateEntries()) {
        node.updateTransform()
      }

      return entity
    }

    const components = Object.fromEntries(
      await Promise.all(
        Object.entries(data.components === undefined ? {} : readDefinition(data.components, 'Entity components')).map(
          async ([name, component]) => {
            if (typeof component === 'string') {
              if (!/\.model\.json(?:[?#].*)?$/i.test(component)) {
                throw new Error(`Unsupported component reference '${component}' in '${documentUrl}'`)
              }

              return [name, await this.models.load(new URL(component, documentUrl).toString())]
            }

            if (component && typeof component === 'object' && 'type' in component && component.type === 'model') {
              return [name, await this.models.loadData(component, documentUrl)]
            }

            return [name, structuredClone(component)]
          }
        )
      )
    )
    const children = Object.fromEntries(
      await Promise.all(
        Object.entries(data.children === undefined ? {} : readDefinition(data.children, 'Entity children')).map(
          async ([name, child]) => [name, await this.createEntityNode(child, documentUrl, chain)]
        )
      )
    )

    return Entity.deserialize({ ...data, components, children })
  }

  private resolveAbsoluteUrl(url: string): string {
    return new URL(url, typeof document === 'undefined' ? 'http://localhost/' : document.baseURI).toString()
  }

  private loadSourceDocument(url: string): Promise<unknown> {
    let source = this.sources.get(url)

    if (!source) {
      source = this.loadJson(url)

      this.sources.set(url, source)
      source.catch(() => {
        if (this.sources.get(url) === source) {
          this.sources.delete(url)
        }
      })
    }

    return source
  }
}
