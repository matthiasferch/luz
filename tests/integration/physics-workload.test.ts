import { expect } from 'chai'
import { Entity } from '@luz/core'
import { Biped, Body } from '@luz/physics'
import { Scene } from '@luz/scene'
import { Cuboid, Plane, Ray, Sphere } from '@luz/physics'
import { Vector3 } from '@luz/math'

const addBody = (scene: Scene, name: string, position: number[], body = new Body()) => {
  const entity = new Entity()

  entity.translation.set(position)

  body.volume = new Sphere({ radius: 0.5 })
  entity.components.body = body
  scene.entities[name] = entity

  return { body, entity }
}

describe('Physics workload', () => {
  it('skips static-only contacts while retaining static shapes in queries', () => {
    const scene = new Scene()

    addBody(scene, 'first', [0, 0.25, 0], new Body({ mass: 0, motionType: 'static' }))
    addBody(scene, 'second', [0.5, 0.25, 0], new Body({ mass: 0, motionType: 'static' }))

    scene.colliders.floor = new Plane()

    scene.update(1 / 60)
    expect(scene.physics.statistics.narrowphasePairs).to.equal(0)
    expect(scene.collisionManifolds).to.have.length(0)
    expect(
      scene.physics.raycastAll(new Ray({ origin: new Vector3([0, 2, 0]), direction: Vector3.createDown() })).length
    ).to.be.greaterThan(1)
  })
  it('reuses sleeping support contacts and preserves biped grounding', () => {
    const scene = new Scene()
    const { body } = addBody(scene, 'actor', [0, 0.5, 0], new Biped())

    scene.colliders.floor = new Plane()

    for (let frame = 0; frame < 180; frame++) {
      scene.update(1 / 60)
    }

    expect(body.isSleeping).to.equal(true)
    expect((body as Biped).isGrounded).to.equal(true)

    const contact = scene.collisionManifolds[0]

    expect(contact).not.to.equal(undefined)

    for (let frame = 0; frame < 30; frame++) {
      scene.update(1 / 60)
      expect(scene.physics.statistics.narrowphasePairs).to.equal(0)
      expect(scene.physics.statistics.velocityConstraints).to.equal(0)
      expect(scene.collisionManifolds[0]).to.equal(contact)
      expect((body as Biped).isGrounded).to.equal(true)
    }

    body.volume.collisionMask = 0

    scene.update(1 / 60)
    expect(body.isSleeping).to.equal(false)
    expect((body as Biped).isGrounded).to.equal(false)
    expect(scene.collisionManifolds).to.have.length(0)
  })
  it('invalidates cached contacts when a sleeping shape changes', () => {
    const scene = new Scene()
    const { body } = addBody(scene, 'actor', [0, 0.5, 0])

    scene.colliders.floor = new Plane()

    for (let frame = 0; frame < 180; frame++) {
      scene.update(1 / 60)
    }

    body.volume = new Sphere({ radius: 0.1 })

    scene.update(1 / 60)
    expect(body.isSleeping).to.equal(false)
    expect(scene.collisionManifolds).to.have.length(0)
    expect(body.linearVelocity.y).to.be.lessThan(0)
  })
  it('wakes a sleeper when its kinematic support is teleported away without velocity', () => {
    const scene = new Scene()
    const passenger = addBody(scene, 'passenger', [0, 0.75, 0])
    const platform = addBody(scene, 'platform', [0, 0, 0])

    platform.body.volume = new Cuboid({ extents: new Vector3([2, 0.25, 2]) })
    platform.body.motionType = 'kinematic'

    for (let frame = 0; frame < 180; frame++) {
      scene.update(1 / 60)
    }

    expect(passenger.body.isSleeping).to.equal(true)

    platform.entity.translation.x = 10

    scene.update(1 / 60)
    expect(passenger.body.isSleeping).to.equal(false)
    expect(passenger.body.linearVelocity.y).to.be.lessThan(0)
    expect(scene.collisionManifolds).to.have.length(0)
  })
  it('rechecks corrected bodies while reusing unrelated contacts and discovering new ones', () => {
    const scene = new Scene()

    scene.gravity.reset()

    const firstBody = addBody(scene, 'first', [0, 0.6, 0])
    const secondBody = addBody(scene, 'second', [5, 0.5, 0])

    scene.colliders.floor = new Plane()

    let iteration = 0
    let unchangedContact: unknown

    scene.physics.solver.solvePositions = (manifolds, _supportedBodies, changedBodies) => {
      if (iteration++ === 0) {
        unchangedContact = manifolds.find((manifold) => manifold.bodies[0] === secondBody.body)

        firstBody.body.applyPositionCorrection(new Vector3([0, -0.2, 0]))
        changedBodies!.add(firstBody.body)

        return true
      }

      expect(manifolds.find((manifold) => manifold.bodies[0] === secondBody.body)).to.equal(unchangedContact)
      expect(manifolds.some((manifold) => manifold.bodies[0] === firstBody.body)).to.equal(true)

      return false
    }

    scene.update(1 / 60)
    expect(iteration).to.equal(2)
    expect(scene.physics.statistics.narrowphasePairs).to.equal(3)
    expect(scene.physics.statistics.narrowphasePasses).to.equal(2)
  })
})
