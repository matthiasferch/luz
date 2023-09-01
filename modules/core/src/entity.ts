import { quat, vec3 } from '@luz/vectors'
import { Component } from './component'
import { Body } from './components/body'
import { Model } from './components/model'
import { Transform } from './transform'

export class Entity extends Transform {

  readonly type: Entity.Type

  components: Record<string, Component> = {}

  // volume: Volume

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

  update(deltaTime: number) {
    super.update(deltaTime)

    this.integrateVelocities(deltaTime)
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
      const angle = angularVelocity.length * deltaTime // * -0.025

      this.rotation.multiply(quat.fromAxisAngle(axis, angle))

      force.reset()
      torque.reset()
    })
  }

  toJSON() {
    const { type, components } = this

    return { ...super.toJSON(), type, components }
  }

}

export module Entity {

  export enum Type {
    Light = 'light',
    Camera = 'camera'
  }

}