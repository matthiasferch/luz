import { expect } from 'chai'
import { Camera, SkeletalAnimation, TransformAnimation, isTransformAnimation } from '../../index'
import { findRegisteredClass } from '@luz/serialization'

describe('Animation class names', () => {
  it('exports distinct runtime classes while preserving their document tags', () => {
    expect(new TransformAnimation().type).to.equal('animation')
    expect(new SkeletalAnimation().type).to.equal('skeletalAnimation')
    expect(TransformAnimation.name).to.equal('TransformAnimation')
    expect(SkeletalAnimation.name).to.equal('SkeletalAnimation')
    expect(findRegisteredClass('animation')).to.equal(TransformAnimation)
    expect(findRegisteredClass('skeletalAnimation')).to.equal(SkeletalAnimation)
    expect(isTransformAnimation(new TransformAnimation())).to.equal(true)
    expect(isTransformAnimation(new Camera())).to.equal(false)
  })
})
