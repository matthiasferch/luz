import { Serialized } from '@luz/utilities'
import { Component } from './component'
import { Body } from './components/body'
import { Camera } from './components/camera'
import { Light } from './components/light'
import { Model } from './components/model'
import { Transform } from './transform'

export class Entity extends Transform {
  @Serialized
  readonly components: Record<string, Component> = {}

  // volume: Volume -- TODO: for visibility determination

  get bodies() {
    return this.ofType<Body>('body')
  }

  get models() {
    return this.ofType<Model>('model')
  }

  get cameras() {
    return this.ofType<Camera>('camera')
  }

  get lights() {
    return this.ofType<Light>('light')
  }

  get fixedTimestep() {
    return this.ofTimestep('fixed')
  }

  get variableTimestep() {
    return this.ofTimestep('variable')
  }

  update(deltaTime: number) {
    super.update(deltaTime)

    this.variableTimestep.forEach((component) => {
      component.update(this, deltaTime)
    })
  }

  fixedUpdate(deltaTime: number) {
    this.fixedTimestep.forEach((component) => {
      component.update(this, deltaTime)
    })
  }

  private ofType<T extends Component>(type: Component.Type) {
    const components = Object.values(this.components)

    return components.filter((component) => {
      return component.type === type
    }) as T[]
  }

  private ofTimestep(timestep: Component.Timestep) {
    const components = Object.values(this.components)

    return components.filter((component) => {
      return component.timestep === timestep
    })
  }
}
