import type { Quaternion, Vector3 } from '@luz/math'

export interface RigidPose {
  translation: Vector3
  rotation: Quaternion
}
