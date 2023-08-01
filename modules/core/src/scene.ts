import { Light } from './light'
import { Model } from './model'

export class Scene {

  readonly models: Record<string, Model> = {}

  readonly lights: Record<string, Light> = {}

  update() {
    // models
    const models = Object.values(this.models)
    models.forEach((model) => model.update())

    // lights
    const lights = Object.values(this.lights)
    lights.forEach((light) => light.update())
  }

}