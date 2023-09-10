import { Component } from './component'
import { Body } from './components/body'
import { Camera } from './components/camera'
import { Light } from './components/light'
import { Model } from './components/model'
import { Transform } from './transform'

const { Type, Timestep } = Component

export class Entity extends Transform {

  readonly components: Record<string, Component> = {}

  // volume: Volume -- TODO: for visibility determination

  get bodies() {
    return this.withType<Body>(Type.Body)
  }

  get models() {
    return this.withType<Model>(Type.Model)
  }

  get cameras() {
    return this.withType<Camera>(Type.Camera)
  }

  get lights() {
    return this.withType<Light>(Type.Light)
  }

  get fixedTimestep() {
    return this.withTimestep(Timestep.Fixed)
  }

  get variableTimestep() {
    return this.withTimestep(Timestep.Variable)
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

  toJSON() {
    const { components } = this

    return { ...super.toJSON(), components }
  }

  private withType<T>(type: Component.Type) {
    const components = Object.values(this.components)

    return components.filter((component) => {
      return component.type === type
    }) as T[]
  }

  private withTimestep(timestep: Component.Timestep) {
    const components = Object.values(this.components)

    return components.filter((component) => {
      return component.timestep === timestep
    })
  }

}