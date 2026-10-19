import { expect } from 'chai'
import { Vector3 } from '@luz/math'
import { CollisionSolver, PhysicsWorld, Polygon, Ray, raycastCollider } from '@luz/physics'

describe('Physics ownership', () => {
  it('owns solver state per world and exposes no static solver forwarding', () => {
    const firstWorld = new PhysicsWorld()
    const secondWorld = new PhysicsWorld()

    expect(firstWorld.solver).not.to.equal(secondWorld.solver)
    expect(CollisionSolver).not.to.have.any.keys('beginVelocityFrame', 'solveVelocities', 'solvePositions')
  })
  it('rebuilds polygon caches through validated vertex replacement and serialization', async () => {
    const vertices = [new Vector3([-2, 0, -2]), new Vector3([0, 0, 2]), new Vector3([2, 0, -2])]
    const polygon = new Polygon({ vertices })
    const vertexView = polygon.vertices
    const edgeView = polygon.edges
    const triangleView = polygon.triangles
    const ray = new Ray({ origin: new Vector3([0, 3, 0]), direction: Vector3.createDown() })

    polygon.vertices = vertices.map((vertex) => vertex.clone().add(new Vector3([0, 1, 0])))

    expect(polygon.vertices).to.equal(vertexView)
    expect(polygon.edges).to.equal(edgeView)
    expect(polygon.triangles).to.equal(triangleView)
    expect(triangleView[0].every((vertex) => vertex.y === 1)).to.equal(true)
    expect(raycastCollider(ray, polygon)!.distance).to.equal(2)
    expect(vertices.every((vertex) => vertex.y === 0)).to.equal(true)

    const serialized = polygon.serialize()

    expect(() => polygon.setVertices([Vector3.createZero()])).to.throw()
    expect(polygon.serialize()).to.deep.equal(serialized)
    expect(raycastCollider(ray, polygon)!.distance).to.equal(2)

    const restored = await Polygon.deserialize(JSON.parse(JSON.stringify(serialized)))

    expect(restored.serialize()).to.deep.equal(serialized)
    expect(restored.triangles.length).to.equal(1)
    expect(raycastCollider(ray, restored)!.distance).to.equal(2)
  })
})
