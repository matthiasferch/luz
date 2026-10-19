import { Serialize, Serializable } from '@luz/serialization'

export abstract class Collider extends Serializable {
  @Serialize()
  collisionGroup: number = 1

  @Serialize()
  collisionMask: number = 0xffffffff

  @Serialize()
  abstract readonly type: string

  validate(): void {}

  static async deserialize(data: unknown): Promise<Collider> {
    const collider = (await super.deserialize(data)) as Collider

    collider.validate()

    return collider
  }
}

export const canCollide = (firstCollider: Collider, secondCollider: Collider): boolean =>
  (firstCollider.collisionGroup & secondCollider.collisionMask) !== 0 &&
  (secondCollider.collisionGroup & firstCollider.collisionMask) !== 0

export const assertPositiveDimensions = (...values: number[]): void => {
  if (values.some((value) => !Number.isFinite(value) || value <= 0)) {
    throw new Error('Shape dimensions must be positive and finite')
  }
}

export namespace Collider {
  export type Type = 'ray' | 'plane' | 'polygon' | 'sphere' | 'cuboid' | 'ellipsoid' | 'cylinder'
}
