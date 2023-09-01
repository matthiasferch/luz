import { quat, vec3 } from '@luz/vectors'
import { Component } from './component'
import { Body } from './components/body'
import { Camera } from './components/camera'
import { Light } from './components/light'
import { Model } from './components/model'
import { Transform } from './transform'

export class Entity extends Transform {

  components: Record<string, Component> = {}

  // volume: Volume -- TODO: for visibility determination

  get bodies() {
    const components = Object.values(this.components)

    return components.filter(({ type }) => {
      return type === Component.Type.Body
    }) as Body[]
  }

  get models() {
    const components = Object.values(this.components)

    return components.filter(({ type }) => {
      return type === Component.Type.Model
    }) as Model[]
  }

  get cameras() {
    const components = Object.values(this.components)

    return components.filter(({ type }) => {
      return type === Component.Type.Camera
    }) as Camera[]
  }

  get lights() {
    const components = Object.values(this.components)

    return components.filter(({ type }) => {
      return type === Component.Type.Light
    }) as Light[]
  }

  update(deltaTime: number) {
    super.update(deltaTime)

    this.integrateVelocities(deltaTime)

    const components = Object.values(this.components)

    components.forEach((component) => {
      component.update(this, deltaTime)
    })
  }

  private integrateVelocities(deltaTime: number) {
    this.bodies.forEach((body) => {
      const { mass, force, torque, linearVelocity, angularVelocity } = body

      // linear velocity

      linearVelocity.add(vec3.scale(force, mass).scale(deltaTime))

      this.translation.add(vec3.scale(linearVelocity, deltaTime))

      // angular velocity

      // TODO: add torque to angular velocity!

      const axis = vec3.normalize(angularVelocity)
      const angle = angularVelocity.length * deltaTime

      this.rotation.multiply(quat.fromAxisAngle(axis, angle))

      force.reset()
      torque.reset()
    })
  }

  toJSON() {
    const { components } = this

    return { ...super.toJSON(), components }
  }

}