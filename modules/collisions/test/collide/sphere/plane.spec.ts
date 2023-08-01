import { expect } from 'chai'
import 'mocha'

import { Transform } from '@luz/core'
import { vec3, vec4 } from '@luz/vectors'

import { Sphere } from '../../../src/colliders/sphere'
import { Plane } from '../../../src/colliders/plane'

const { origin } = Transform

describe('Sphere', () => {

  it('should detect collision with intersecting plane', () => {

    const sphere = new Sphere({
      center: new vec3([0, 2, 0]),
      radius: 1
    })

    const plane = new Plane({
      equation: new vec4([0, 1, 0, 0])
    })

    const collision = sphere.collide(plane, origin, origin)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([0, 1, 0]))
    expect(collision!.normal).to.deep.equal(new vec3([-0, -1, -0]))
    expect(collision!.distance).to.equal(2)

  })

  it('should not detect collision with non-intersecting plane', () => {

    const sphere = new Sphere({
      center: new vec3([0, -2, 0]),
      radius: 1
    })

    const plane = new Plane({
      equation: new vec4([0, 1, 0, 0])
    })

    const collision = sphere.collide(plane, origin, origin)

    expect(collision).to.be.null

  })

})
