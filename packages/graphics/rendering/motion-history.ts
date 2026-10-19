import type { Transform } from '@luz/core'
import { Matrix4 } from '@luz/math'
import type { Scene } from '@luz/scene'
import type { ModelCompiler } from '../compilers/model-compiler'
import { isModel } from '../model'
import type { RenderModel } from '../renderer/render-model'

export function captureEntityMotionHistory(
  scene: Scene,
  previousModels: WeakMap<Transform, Matrix4>,
  previousBones: WeakMap<RenderModel, Float32Array>,
  models: ModelCompiler
): void {
  for (const entity of scene.collectEntities()) {
    const previousModelMatrix = previousModels.get(entity) ?? new Matrix4()

    entity.modelMatrix.copyTo(previousModelMatrix)
    previousModels.set(entity, previousModelMatrix)

    for (const component of Object.values(entity.components)) {
      if (!isModel(component) || !component.boneMatrices) {
        continue
      }

      const model = models.requireCompiledModel(component)

      let bones = previousBones.get(model)

      if (!bones || bones.length !== component.boneMatrices.length) {
        bones = new Float32Array(component.boneMatrices.length)

        previousBones.set(model, bones)
      }

      bones.set(component.boneMatrices)
    }
  }
}
