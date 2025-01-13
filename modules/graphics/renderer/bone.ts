import { Serialize, Serializable } from '@luz/utilities'
import { vec3, mat4 } from '@luz/vectors'

export class Bone extends Serializable<Bone> {
  @Serialize()
  readonly name: string = ''

  @Serialize()
  readonly parent: string | null = null

  @Serialize()
  readonly head: vec3 = vec3.zero.copy()

  @Serialize()
  readonly tail: vec3 = vec3.zero.copy()

  @Serialize()
  readonly matrix: mat4 = mat4.identity.copy()

  constructor({ name, parent, head, tail, matrix }: Partial<Bone> = {}) {
    super({ name, parent })

    if (head) {
      this.head.set(head)
    }

    if (tail) {
      this.tail.set(tail)
    }

    if (matrix) {
      this.matrix.set(matrix)
    }
  }
}
