import { expect } from 'chai'
import 'mocha'

import { vec3 } from '../../../vectors/src/vec3'
import { Sphere } from '../../src/colliders/sphere'
import { Transform } from '../../src/transform'
import { Cuboid } from '../../src/colliders/cuboid'

const { origin } = Transform

describe('Sphere', () => {

  it('should detect collision with intersecting cuboid', () => {

    const sphere = new Sphere({
      center: new vec3([2, 0, 0]),
      radius: 1
    })

    const cuboid = new Cuboid({
      minimum: new vec3([-1, -1, -1]),
      maximum: new vec3([1, 1, 1])
    })

    const collision = sphere.collide(cuboid, origin, origin)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([1, 0, 0]))
    expect(collision!.normal).to.deep.equal(new vec3([-1, 0, 0]))
    expect(collision!.distance).to.equal(0)

  })

  it('should not detect collision with non-intersecting cuboid', () => {

    const sphere = new Sphere({
      center: new vec3([4, 0, 0]),
      radius: 1
    })

    const cuboid = new Cuboid({
      minimum: new vec3([-1, -1, -1]),
      maximum: new vec3([1, 1, 1])
    })

    const collision = sphere.collide(cuboid, origin, origin)

    expect(collision).to.be.null

  })

})
