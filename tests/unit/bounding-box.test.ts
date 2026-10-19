import { expect } from 'chai'
import { BoundingBox, Frustum, Transform } from '@luz/core'
import { Vector3 } from '@luz/math'

describe('Bounding boxes', () => {
  it('updates owned bounds in place, including aliased input points and empty geometry', () => {
    const boundingBox = new BoundingBox([new Vector3([-3, 2, 1]), new Vector3([4, 5, 6])])
    const minimum = boundingBox.minimum
    const maximum = boundingBox.maximum

    expect(BoundingBox.calculateFromPoints([boundingBox.maximum, boundingBox.minimum], boundingBox)).to.equal(
      boundingBox
    )
    expect(boundingBox.minimum.xyz).to.deep.equal([-3, 2, 1])
    expect(boundingBox.maximum.xyz).to.deep.equal([4, 5, 6])
    BoundingBox.calculateFromPoints([new Vector3([1, 2, 3])], boundingBox)
    expect(boundingBox.minimum.xyz).to.deep.equal([1, 2, 3])
    expect(boundingBox.maximum.xyz).to.deep.equal([1, 2, 3])
    BoundingBox.calculateFromPoints([], boundingBox)
    expect(boundingBox.minimum).to.equal(minimum)
    expect(boundingBox.maximum).to.equal(maximum)
    expect(boundingBox.minimum.xyz).to.deep.equal([0, 0, 0])
    expect(boundingBox.maximum.xyz).to.deep.equal([0, 0, 0])
  })
  it('encloses points without including the origin or retaining input vectors', () => {
    const points = [new Vector3([2, -8, 3]), new Vector3([5, -4, 9]), new Vector3([3, -6, 4])]
    const boundingBox = new BoundingBox(points)

    expect(boundingBox.minimum.xyz).to.deep.equal([2, -8, 3])
    expect(boundingBox.maximum.xyz).to.deep.equal([5, -4, 9])
    points[0].set([100, 100, 100])
    expect(boundingBox.minimum.xyz).to.deep.equal([2, -8, 3])
    expect(boundingBox.maximum.xyz).to.deep.equal([5, -4, 9])
  })
  it('creates independent zero bounds for empty or omitted point lists', () => {
    const emptyBoundingBox = new BoundingBox([])
    const defaultBoundingBox = new BoundingBox()

    expect(emptyBoundingBox.minimum.xyz).to.deep.equal([0, 0, 0])
    expect(emptyBoundingBox.maximum.xyz).to.deep.equal([0, 0, 0])
    expect(defaultBoundingBox.minimum.xyz).to.deep.equal([0, 0, 0])
    expect(defaultBoundingBox.maximum.xyz).to.deep.equal([0, 0, 0])

    emptyBoundingBox.minimum.x = 3

    expect(emptyBoundingBox.maximum.x).to.equal(0)
    expect(defaultBoundingBox.minimum.x).to.equal(0)
    expect(Vector3.createZero().x).to.equal(0)
  })
  it('includes touching boxes and rejects separation on every axis in either order', () => {
    const boundingBox = new BoundingBox([new Vector3([-1, -1, -1]), new Vector3([1, 1, 1])])

    expect(BoundingBox.intersects(boundingBox, new BoundingBox())).to.equal(true)

    for (let axis = 0; axis < 3; axis++) {
      for (const offset of [-2, 2]) {
        const otherBoundingBox = new BoundingBox([boundingBox.minimum, boundingBox.maximum])

        otherBoundingBox.minimum[axis] += offset
        otherBoundingBox.maximum[axis] += offset

        expect(BoundingBox.intersects(boundingBox, otherBoundingBox)).to.equal(true)
        expect(BoundingBox.intersects(otherBoundingBox, boundingBox)).to.equal(true)

        otherBoundingBox.minimum[axis] += offset
        otherBoundingBox.maximum[axis] += offset

        expect(BoundingBox.intersects(boundingBox, otherBoundingBox)).to.equal(false)
        expect(BoundingBox.intersects(otherBoundingBox, boundingBox)).to.equal(false)
      }
    }
  })
  it('accepts structural bounds in both intersection and frustum checks', () => {
    const boundingBox: BoundingBox = { minimum: new Vector3([-1, -1, -6]), maximum: new Vector3([1, 1, -4]) }
    const frustum = new Frustum()

    frustum.applyTransform(new Transform())
    expect(frustum.intersectsBoundingBox(boundingBox)).to.equal(true)
    expect(BoundingBox.intersects(boundingBox, new BoundingBox([new Vector3([0, 0, -5])]))).to.equal(true)
  })
})
