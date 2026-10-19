import { Quaternion, Vector3 } from '@luz/math'

export class Pose {
  readonly translation = new Vector3()
  readonly rotation = new Quaternion()
  readonly scale = new Vector3([1, 1, 1])

  copyFrom(source: Pick<Pose, 'translation' | 'rotation' | 'scale'>): this {
    this.translation.set(source.translation)
    this.rotation.set(source.rotation)
    this.scale.set(source.scale)

    return this
  }

  clone(): Pose {
    return new Pose().copyFrom(this)
  }

  copyTo(destination: Pose): Pose {
    return destination.copyFrom(this)
  }

  reset(): this {
    this.translation.reset()
    this.rotation.reset()
    this.scale.fill(1)

    return this
  }
}
