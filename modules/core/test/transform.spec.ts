import { expect } from 'chai'
import 'mocha'

import { mat3, mat4, quat, vec2, vec3, vec4 } from '@luz/vectors'

import { Transform } from '../src/transform'

describe('Transform', () => {

  it('should be initialized properly', () => {

    const transform = new Transform()
  
    transform.update() // calculate matrices

    expect(transform.rotation).to.deep.equal(quat.identity)

    expect(transform.translation).to.deep.equal(vec3.zero)

    expect(transform.direction).to.deep.equal(vec3.forward)

    expect(transform.modelMatrix).to.deep.equal(mat4.identity)

    expect(transform.rotationMatrix).to.deep.equal(mat3.identity)

    expect(transform.inverseTransposeMatrix).to.deep.equal(mat4.identity)

  })

})
