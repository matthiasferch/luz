import { expect } from 'chai'
import { BoundingBox, Frustum, Transform } from '@luz/core'
import { Quaternion, Vector3 } from '@luz/math'

const createFrustum = () => {
  const frustum = new Frustum()

  frustum.clipPlanes.set([1, 10])
  frustum.applyTransform(new Transform())

  return frustum
}

const createBoundingBox = (x: number, y: number, z: number, radius = 0.1) =>
  new BoundingBox([
    new Vector3([x - radius, y - radius, z - radius]),
    new Vector3([x + radius, y + radius, z + radius])
  ])

const copyFrustum = (source: Frustum) => {
  const frustum = new Frustum()

  frustum.aspect = source.aspect
  frustum.fieldOfView = source.fieldOfView

  source.clipPlanes.copyTo(frustum.clipPlanes)
  source.center.copyTo(frustum.center)
  source.axes.forEach((axis, index) => axis.copyTo(frustum.axes[index]))

  return frustum
}

describe('Frustum geometry cache', () => {
  it('fills reusable vertex destinations without exposing the cache or changing owned snapshots', () => {
    const frustum = createFrustum()
    const ownedVertices = frustum.calculateVertices()
    const snapshot = ownedVertices.map((vertex) => vertex.clone())
    const destination = [new Vector3([99, 99, 99])]
    const firstDestination = destination[0]

    expect(frustum.calculateVertices(destination)).to.equal(destination)
    expect(destination).to.have.lengthOf(8)
    expect(destination[0]).to.equal(firstDestination)
    expect(destination).to.deep.equal(snapshot)

    const destinationVertices = destination.slice()

    frustum.fieldOfView = 45
    frustum.aspect = 2

    frustum.applyTransform(
      new Transform({
        translation: new Vector3([3, 2, 1]),
        rotation: Quaternion.setFromEulerAngles(0.2, -0.4, 0.6)
      })
    )
    destination.push(new Vector3())
    expect(frustum.calculateVertices(destination)).to.equal(destination)
    expect(destination).to.have.lengthOf(8)
    expect(destination).to.deep.equal(frustum.calculateVertices())
    destination.forEach((vertex, index) => expect(vertex).to.equal(destinationVertices[index]))
    expect(ownedVertices).to.deep.equal(snapshot)

    const refreshedSnapshot = frustum.calculateVertices()

    destination.forEach((vertex) => vertex.reset())
    expect(frustum.calculateVertices()).to.deep.equal(refreshedSnapshot)
    expect(ownedVertices).to.deep.equal(snapshot)
  })
  it('preserves all six clipping planes, including boxes touching the near and far planes', () => {
    const frustum = createFrustum()

    expect(frustum.calculateVertices().map((vertex) => vertex.xyz)).to.deep.equal([
      [1, 1, -1],
      [1, -1, -1],
      [-1, 1, -1],
      [-1, -1, -1],
      [10, 10, -10],
      [10, -10, -10],
      [-10, 10, -10],
      [-10, -10, -10]
    ])
    expect(frustum.intersectsBoundingBox(createBoundingBox(0, 0, -5))).to.equal(true)
    expect(frustum.intersectsBoundingBox(createBoundingBox(0, 0, -0.5, 0.5))).to.equal(true)
    expect(frustum.intersectsBoundingBox(createBoundingBox(0, 0, -10.5, 0.5))).to.equal(true)

    for (const position of [
      [-6, 0, -5],
      [6, 0, -5],
      [0, -6, -5],
      [0, 6, -5],
      [0, 0, 0],
      [0, 0, -11]
    ]) {
      expect(frustum.intersectsBoundingBox(createBoundingBox(position[0], position[1], position[2]))).to.equal(false)
    }
  })

  const changes: Array<{ name: string; updateFrustum(frustum: Frustum): void }> = [
    {
      name: 'aspect',
      updateFrustum: (frustum) => {
        frustum.aspect = 2
      }
    },
    {
      name: 'fieldOfView',
      updateFrustum: (frustum) => {
        frustum.fieldOfView = 60
      }
    },
    {
      name: 'near clip distance',
      updateFrustum: (frustum) => {
        frustum.clipPlanes.x = 0.25
      }
    },
    {
      name: 'far clip distance',
      updateFrustum: (frustum) => {
        frustum.clipPlanes.y = 25
      }
    },
    {
      name: 'center',
      updateFrustum: (frustum) => {
        frustum.center.set([2, 3, -7])
      }
    },
    {
      name: 'horizontal axis',
      updateFrustum: (frustum) => {
        frustum.axes[0].set([2, 0.1, 0.2])
      }
    },
    {
      name: 'vertical axis',
      updateFrustum: (frustum) => {
        frustum.axes[1].set([0.1, 3, 0.2])
      }
    },
    {
      name: 'depth axis',
      updateFrustum: (frustum) => {
        frustum.axes[2].set([0.1, 0.2, 2])
      }
    }
  ]

  for (const { name, updateFrustum } of changes) {
    it(`refreshes cached geometry after direct changes to the ${name}`, () => {
      const frustum = createFrustum()
      const previousVertices = frustum.calculateVertices()

      frustum.calculatePlanes()
      updateFrustum(frustum)

      const expectedFrustum = copyFrustum(frustum)

      expect(frustum.calculateVertices()).not.to.deep.equal(previousVertices)
      expect(frustum.calculateVertices()).to.deep.equal(expectedFrustum.calculateVertices())
      expect(frustum.calculatePlanes()).to.deep.equal(expectedFrustum.calculatePlanes())

      for (const x of [-12, -4, 0, 4, 12]) {
        for (const y of [-12, 0, 12]) {
          for (const z of [-25, -10, -5, 0]) {
            const boundingBox = createBoundingBox(x, y, z)

            expect(frustum.intersectsBoundingBox(boundingBox)).to.equal(
              expectedFrustum.intersectsBoundingBox(boundingBox)
            )
          }
        }
      }
    })
  }

  it('refreshes after transformed, mirrored and scaled poses without changing earlier results', () => {
    const frustum = createFrustum()
    const vertices = frustum.calculateVertices()
    const planes = frustum.calculatePlanes()
    const vertexSnapshot = vertices.map((vertex) => vertex.clone())
    const planeSnapshot = planes.map(({ normal, distance }) => ({ normal: normal.clone(), distance }))

    for (const scale of [new Vector3([1, 1, 1]), new Vector3([-2, 3, 0.5])]) {
      const transform = new Transform({
        translation: new Vector3([4, -2, 3]),
        rotation: Quaternion.setFromEulerAngles(0.3, -0.6, 0.2),
        scale
      })
      const expectedFrustum = createFrustum()

      frustum.applyTransform(transform)
      expectedFrustum.applyTransform(transform)
      expect(frustum.calculateVertices()).to.deep.equal(expectedFrustum.calculateVertices())
      expect(frustum.calculatePlanes()).to.deep.equal(expectedFrustum.calculatePlanes())
      expect(vertices).to.deep.equal(vertexSnapshot)
      expect(planes).to.deep.equal(planeSnapshot)
    }
  })
  it('keeps returned geometry independent of the cache and other frustums', () => {
    const frustum = createFrustum()
    const expectedFrustum = createFrustum()
    const vertices = frustum.calculateVertices()
    const planes = frustum.calculatePlanes()
    const otherFrustum = createFrustum()

    vertices[0].reset()
    vertices.pop()
    planes[0].normal.reset()

    planes[0].distance = 1000

    planes.pop()

    otherFrustum.fieldOfView = 20

    otherFrustum.calculatePlanes()
    expect(frustum.calculateVertices()).to.deep.equal(expectedFrustum.calculateVertices())
    expect(frustum.calculatePlanes()).to.deep.equal(expectedFrustum.calculatePlanes())
    expect(frustum.intersectsBoundingBox(createBoundingBox(0, 0, -5))).to.equal(true)
  })
  it('excludes cached geometry from serialized data and rebuilds after deserialization', async () => {
    const frustum = createFrustum()
    const serializedFrustum = frustum.serialize()

    frustum.calculatePlanes()
    expect(frustum.serialize()).to.deep.equal(serializedFrustum)

    const restoredFrustum = (await Frustum.deserialize(serializedFrustum)) as Frustum

    restoredFrustum.applyTransform(new Transform())
    expect(restoredFrustum.calculateVertices()).to.deep.equal(frustum.calculateVertices())
    expect(restoredFrustum.calculatePlanes()).to.deep.equal(frustum.calculatePlanes())
  })
})
