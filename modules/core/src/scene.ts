import { Entity } from './entity'

export class Scene {

  readonly entities: Record<string, Entity> = {}

  update() {
    const entities = Object.values(this.entities)
    entities.forEach((entity) => entity.update())
  }

}