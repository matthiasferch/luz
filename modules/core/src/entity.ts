import { Component } from './component'
import { Body } from './components/body'
import { Camera } from './components/camera'
import { Light } from './components/light'
import { Model } from './components/model'
import { Transform } from './transform'

export class Entity extends Transform {

  readonly components: Record<string, Component> = {}

  // volume: Volume -- TODO: for visibility determination

  get bodies() {
    return this.componentsOfType<Body>(Component.Type.Body)
  }

  get models() {
    return this.componentsOfType<Model>(Component.Type.Model)
  }

  get cameras() {
    return this.componentsOfType<Camera>(Component.Type.Camera)
  }

  get lights() {
    return this.componentsOfType<Light>(Component.Type.Light)
  }

  update(deltaTime: number) {
    super.update(deltaTime)

    const components = Object.values(this.components)

    components.forEach((component) => {
      component.update(this, deltaTime)
    })
  }

  toJSON() {
    const { components } = this

    return { ...super.toJSON(), components }
  }

  private componentsOfType<T>(type: Component.Type) {
    const components = Object.values(this.components)

    return components.filter((component) => {
      return component.type === type
    }) as T[]
  }

}