import { expect } from 'chai'
import 'mocha'

import { Transform } from '@luz/core'
import { vec3, vec4 } from '@luz/vectors'

import { Plane } from '../../src/colliders/plane'
import { Ray } from '../../src/colliders/ray'

const { origin } = Transform

describe('Ray', () => {

  it('should detect collision with intersecting plane', () => {

    const ray = new Ray({
      origin: new vec3([0, -1, 0]),
      direction: new vec3([0, 1, 0])
    })

    const plane = new Plane({
      equation: new vec4([0, 1, 0, 0])
    })

    const collision = ray.collide(plane, origin, origin)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([0, 0, 0]))
    expect(collision!.normal).to.deep.equal(new vec3([0, 1, 0]))
    expect(collision!.distance).to.equal(1)

  })

  it('should not detect collision with non-intersecting plane', () => {

    const ray = new Ray({
      origin: new vec3([0, 1, 0]),
      direction: new vec3([1, 0, 0])
    })
    
    const plane = new Plane({
      equation: new vec4([0, 1, 0, 0])
    })

    const collision = ray.collide(plane, origin, origin)

    expect(collision).to.be.null

  })

})