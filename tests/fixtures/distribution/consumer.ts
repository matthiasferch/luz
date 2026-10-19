import { AnimationLoop, Camera, DebugRenderer, Entity, Scene, SceneRenderer, Vector3 } from 'luz'

const assertCondition = (isValid: boolean, message: string): void => {
  if (!isValid) {
    throw new Error(message)
  }
}

const scene = new Scene()
const entity = new Entity()
const camera = new Camera()

entity.components.camera = camera
scene.entities.view = entity

scene.update(0)
assertCondition(scene.entities.view.components.camera instanceof Camera, 'Camera export preserves identity')
assertCondition(entity.translation instanceof Vector3, 'Entity uses the exported vector class')
assertCondition(typeof SceneRenderer.create === 'function', 'Scene renderer factory is exported')
assertCondition(typeof DebugRenderer.prototype.render === 'function', 'Debug renderer is exported')
assertCondition(typeof AnimationLoop.prototype.start === 'function', 'Browser loop is exported')
assertCondition(!('luz' in globalThis), 'ES module does not create a global engine namespace')
