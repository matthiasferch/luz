import { expect } from 'chai'
import * as graphics from '@luz/graphics'
import type { RenderModel, RenderTarget } from '@luz/graphics'

describe('Render contracts', () => {
  it('uses ordinary object contracts without runtime constructors', () => {
    const model: RenderModel = { source: new graphics.Model(), materials: {}, primitives: {} }
    const target: RenderTarget = { width: 10, height: 20 }

    expect(Object.getPrototypeOf(model)).to.equal(Object.prototype)
    expect(Object.getPrototypeOf(target)).to.equal(Object.prototype)
    expect(graphics).not.to.have.any.keys('RenderModel', 'RenderTarget', 'BoneWeight')
    expect(graphics.Keyframe).to.be.a('function')
    expect(graphics.RenderStatistics).to.be.a('function')
  })
})
