import { expect } from 'chai'
import 'mocha'

import { vec3 } from '../../../../vectors/src/vec3'
import { Transform } from '../../../src/transform'
import { Cuboid } from '../../../src/colliders/cuboid'
import { Plane } from '../../../src/colliders/plane'
import { vec4 } from '../../../../vectors/src/vec4'

const { origin } = Transform

describe('Cuboid', () => {

  it('should detect collision with intersecting plane', () => {

    const cuboid = new Cuboid({
      minimum: new vec3([-1, -1, -1]),
      maximum: new vec3([1, 1, 1])
    })

    const plane = new Plane({
      equation: new vec4([0, 1, 0, 0])
    })

    const collision = cuboid.collide(plane, origin, origin)

    expect(collision).to.not.be.null
    // cuboid-plane collision has no well-defined contact point!
    expect(collision!.normal).to.deep.equal(new vec3([0, 1, 0]))
    expect(collision!.distance).to.equal(1)

  })

  it('should not detect collision with non-intersecting plane', () => {

    const cuboid = new Cuboid({
      minimum: new vec3([-1, -1, -1]),
      maximum: new vec3([1, 1, 1])
    })

    const plane = new Plane({
      equation: new vec4([0, -1, 0, 0])
    })

    const collision = cuboid.collide(plane, origin, origin)

    expect(collision).to.be.null

  })

})