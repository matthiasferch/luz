import { expect } from 'chai'
import 'mocha'

import { Transform } from '@luz/core'
import { vec3 } from '@luz/vectors'

import { Sphere } from '../../src/colliders/sphere'
import { Ray } from '../../src/colliders/ray'

const { origin } = Transform

describe('Sphere', () => {

  it('should detect collision with intersecting ray', () => {

    const sphere = new Sphere({
      center: new vec3([2, 0, 0]),
      radius: 1
    })

    const ray = new Ray({
      origin: new vec3([0, 1, 0]),
      direction: new vec3([1, 0, 0])
    })

    const collision = sphere.collide(ray, origin, origin)

    expect(collision).to.not.be.null
    expect(collision!.contact).to.deep.equal(new vec3([2, 1, 0]))
    expect(collision!.normal).to.deep.equal(new vec3([0, -1, 0]))
    expect(collision!.distance).to.equal(2)

  })

  it('should not detect collision with non-intersecting ray', () => {

    const sphere = new Sphere({
      center: new vec3([0, 0, 0]),
      radius: 1
    })

    const ray = new Ray({
      origin: new vec3([2, 0, 0]),
      direction: new vec3([1, 0, 0])
    })

    const collision = sphere.collide(ray, origin, origin)

    expect(collision).to.be.null

  })

})