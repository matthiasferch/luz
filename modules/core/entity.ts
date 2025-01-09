import { Serialize } from '@luz/utilities'
import { Body } from './components/body'
import { Camera } from './components/camera'
import { Light } from './components/light'
import { Model } from './components/model'
import { Transform } from './transform'

export class Entity extends Transform {
  @Serialize(Body)
  readonly bodies: Record<string, Body> = {}

  @Serialize(Light)
  readonly lights: Record<string, Light> = {}

  @Serialize(Model)
  readonly models: Record<string, Model> = {}

  @Serialize(Camera)
  readonly cameras: Record<string, Camera> = {}

  // volume: Volume -- TODO: for visibility determination

  update(deltaTime: number) {
    super.update(deltaTime)

    Object.values(this.models).forEach((model) => {
      model.update(this, deltaTime)
    })

    Object.values(this.lights).forEach((light) => {
      light.update(this, deltaTime)
    })

    Object.values(this.cameras).forEach((camera) => {
      camera.update(this, deltaTime)
    })
  }

  fixedUpdate(deltaTime: number) {
    Object.values(this.bodies).forEach((body) => {
      body.update(this, deltaTime)
    })
  }
}
