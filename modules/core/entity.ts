import { Serialize } from '@luz/utilities'
import { Transform } from './transform'
import { Component } from './component'

export class Entity extends Transform {
  @Serialize(Component)
  readonly components: Record<string, Component> = {}

  // volume: Volume -- TODO: for visibility determination

  static async deserialize(data: Partial<Entity>) {
    return (await super.deserialize(data)) as Entity
  }

  update(deltaTime: number) {
    super.update(deltaTime)

    Object.values(this.components).forEach((component) => {
      if (component.timestep === 'Variable') {
        component.update(this, deltaTime)
      }
    })
  }

  fixedUpdate(deltaTime: number) {
    Object.values(this.components).forEach((component) => {
      if (component.timestep === 'Fixed') {
        component.update(this, deltaTime)
      }
    })
  }
}
