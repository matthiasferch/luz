import { vec3 } from '@luz/vectors'
import { Broadphase } from '../broadphase/broadphase'
import { CollisionManifold } from '../collision'

export type SolverOptions = {
  frameRate: number
  contactRestVelocity: number
  penetrationTolerance: number
  baumgarteFactor: number
  positionCorrectionFactor: number
  positionCorrectionPerStep: number
  positionCorrectionPerStepStatic: number
  bipedDynamicCorrectionPerStep: number
  groundMinNormalY: number
}

export class CollisionResolver {
  constructor(private defaults?: Partial<SolverOptions>) { }

  updateBipedGroundState(manifolds: CollisionManifold[], groundMinNormalY: number) {
    manifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies
      const b1IsBiped = b1.type === 'Biped'
      const b2IsBiped = b2 ? b2.type === 'Biped' : false
      if (!b1IsBiped && !b2IsBiped) return

      collisions.forEach(({ contact, normal }) => {
        const isGroundish = normal.y >= groundMinNormalY
        if (b1IsBiped) {
          const r1 = vec3.subtract(contact, b1.volume.center, new vec3())
          if (r1.y < 0 && isGroundish) {
            ; (b1 as any).onGround = true
          }
        }
        if (b2 && b2IsBiped) {
          const r2 = vec3.subtract(contact, b2.volume.center, new vec3())
          if (r2.y < 0 && isGroundish) {
            ; (b2 as any).onGround = true
          }
        }
      })
    })
  }

  solveVelocities(manifolds: CollisionManifold[], opts: SolverOptions) {
    const {
      frameRate,
      contactRestVelocity,
      penetrationTolerance,
      baumgarteFactor,
    } = { ...this.defaults, ...opts }

    manifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      collisions.forEach(({ contact, normal: collisionNormal, distance }) => {
        const normal = Broadphase.orientNormalForPair(collisionNormal, contact, b1, b2)

        const r1 = vec3.subtract(contact, b1.volume.center, new vec3())
        const contactVelocity1 = vec3.add(
          b1.linearVelocity,
          vec3.cross(b1.angularVelocity, r1, new vec3()),
          new vec3()
        )

        const r2 = b2 ? vec3.subtract(contact, b2.volume.center, new vec3()) : null
        const contactVelocity2 = b2
          ? vec3.add(b2.linearVelocity, vec3.cross(b2.angularVelocity, r2!, new vec3()), new vec3())
          : null

        const relativeVelocity = contactVelocity2
          ? vec3.subtract(contactVelocity2, contactVelocity1, new vec3())
          : vec3.subtract(vec3.zero, contactVelocity1, new vec3())

        const velocityAlongNormal = vec3.dot(relativeVelocity, normal)
        if (velocityAlongNormal > 0) return

        const tangent = vec3.subtract(relativeVelocity, vec3.scale(normal, velocityAlongNormal, new vec3()))
        const tangentLength = tangent.length
        const tangentDirection = tangentLength > 0 ? tangent.normalize() : vec3.zero

        const e1 = (b1 as any).restitution ?? 0
        const e2 = b2 ? ((b2 as any).restitution ?? e1) : e1
        const mixedRestitution = Math.max(e1, e2)
        const restitution = Math.abs(velocityAlongNormal) < contactRestVelocity ? 0 : mixedRestitution
        const depth = Math.max(distance - penetrationTolerance, 0)
        const bias = (baumgarteFactor / frameRate) * depth
        const impulseScalar = Math.max(-((1.0 + restitution) * velocityAlongNormal) + bias, 0)

        const b1IsBiped = b1.type === 'Biped'
        const b2IsBiped = b2 ? b2.type === 'Biped' : false
        const invMass1Base = b1.mass > 0 ? 1.0 / b1.mass : 0
        const invMass2Base = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0
        const inverseMass1 = b1IsBiped && b2 ? 0 : invMass1Base
        const inverseMass2 = b2 ? (b2IsBiped ? 0 : invMass2Base) : 0
        const totalInverseMass = inverseMass1 + inverseMass2
        if (totalInverseMass === 0) return

        const inverseInertia1 = b1.volume.inverseInertia
        const inverseInertia2 = b2 ? b2.volume.inverseInertia : null

        const computeEffectiveMass = (direction: vec3) => {
          let denominator = totalInverseMass
          if (inverseMass1 > 0) {
            const r1CrossDir = vec3.cross(r1, direction, new vec3())
            const angularComponent1 = vec3.cross(inverseInertia1.transform(r1CrossDir, new vec3()), r1, new vec3())
            denominator += vec3.dot(angularComponent1, direction)
          }
          if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
            const r2CrossDir = vec3.cross(r2, direction, new vec3())
            const angularComponent2 = vec3.cross(inverseInertia2.transform(r2CrossDir, new vec3()), r2, new vec3())
            denominator += vec3.dot(angularComponent2, direction)
          }
          return denominator
        }

        const normalEffectiveMass = computeEffectiveMass(normal)
        if (normalEffectiveMass <= 0) return

        const normalImpulseMagnitude = impulseScalar > 0 ? impulseScalar / normalEffectiveMass : 0
        if (normalImpulseMagnitude > 0) {
          const normalImpulse = vec3.scale(normal, normalImpulseMagnitude, new vec3())
          if (inverseMass1 > 0) {
            b1.linearVelocity.subtract(vec3.scale(normalImpulse, inverseMass1, new vec3()))
            const angularImpulse1 = inverseInertia1.transform(vec3.cross(r1, normalImpulse, new vec3()), new vec3())
            b1.angularVelocity.subtract(angularImpulse1)
          }
          if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
            b2.linearVelocity.add(vec3.scale(normalImpulse, inverseMass2, new vec3()))
            const angularImpulse2 = inverseInertia2.transform(vec3.cross(r2, normalImpulse, new vec3()), new vec3())
            b2.angularVelocity.add(angularImpulse2)
          }
        }

        if (tangentLength > 0) {
          const frictionEffectiveMass = computeEffectiveMass(tangentDirection)
          if (frictionEffectiveMass > 0) {
            let jt = -vec3.dot(relativeVelocity, tangentDirection) / frictionEffectiveMass
            const jn = Math.abs(normalImpulseMagnitude)
            const mu1 = (b1 as any).friction ?? 0
            const mu2 = b2 ? ((b2 as any).friction ?? mu1) : mu1
            const mu = Math.sqrt(Math.max(mu1, 0) * Math.max(mu2, 0))
            const mu_s = mu * 1.5
            const mu_d = mu
            if (Math.abs(jt) > mu_s * jn) {
              jt = Math.sign(jt) * mu_d * jn
            }
            if (jt !== 0) {
              const frictionImpulse = vec3.scale(tangentDirection, jt, new vec3())
              if (inverseMass1 > 0) {
                b1.linearVelocity.subtract(vec3.scale(frictionImpulse, inverseMass1, new vec3()))
                const angularImpulse1 = inverseInertia1.transform(vec3.cross(r1, frictionImpulse, new vec3()), new vec3())
                b1.angularVelocity.subtract(angularImpulse1)
              }
              if (b2 && inverseMass2 > 0 && r2 && inverseInertia2) {
                b2.linearVelocity.add(vec3.scale(frictionImpulse, inverseMass2, new vec3()))
                const angularImpulse2 = inverseInertia2.transform(vec3.cross(r2, frictionImpulse, new vec3()), new vec3())
                b2.angularVelocity.add(angularImpulse2)
              }
            }
          }
        }
      })
    })
  }

  solvePositions(manifolds: CollisionManifold[], opts: SolverOptions): boolean {
    const {
      penetrationTolerance,
      positionCorrectionFactor,
      positionCorrectionPerStep,
      positionCorrectionPerStepStatic,
      bipedDynamicCorrectionPerStep,
    } = { ...this.defaults, ...opts }

    let appliedCorrection = false

    manifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      let maxDepth = 0
      let chosenNormal: vec3 | null = null
      let chosenContact: vec3 | null = null

      for (const { contact, normal: nIn, distance } of collisions) {
        const depth = Math.max(distance - penetrationTolerance, 0)
        if (depth > maxDepth) {
          maxDepth = depth
          chosenContact = contact
          chosenNormal = Broadphase.orientNormalForPair(nIn, contact, b1, b2)
        }
      }

      if (!chosenNormal || !chosenContact || maxDepth <= 0) {
        return
      }

      const b1IsBiped = b1.type === 'Biped'
      const b2IsBiped = b2 ? b2.type === 'Biped' : false

      const invMass1Base = b1.mass > 0 ? 1.0 / b1.mass : 0
      const invMass2Base = b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0

      const inverseMass1 = b1IsBiped && b2 ? 0 : invMass1Base
      const inverseMass2 = b2 ? (b2IsBiped ? 0 : invMass2Base) : 0
      const totalInverseMass = inverseMass1 + inverseMass2
      if (totalInverseMass === 0) return

      let correctionMagnitude = (maxDepth * positionCorrectionFactor) / totalInverseMass

      let perStepClamp = positionCorrectionPerStep
      if (!b2) {
        perStepClamp = Math.max(perStepClamp, positionCorrectionPerStepStatic)
      }
      if (b2 && b1IsBiped && inverseMass2 > 0) {
        perStepClamp = Math.max(perStepClamp, bipedDynamicCorrectionPerStep / inverseMass2)
      } else if (b2IsBiped && inverseMass1 > 0) {
        perStepClamp = Math.max(perStepClamp, bipedDynamicCorrectionPerStep / inverseMass1)
      }
      if (correctionMagnitude > perStepClamp) {
        correctionMagnitude = perStepClamp
      }

      const correction = vec3.scale(chosenNormal, correctionMagnitude, new vec3())
      if (inverseMass1 > 0) {
        b1.applyPositionCorrection(vec3.scale(correction, -inverseMass1, new vec3()))
        appliedCorrection = true
      }
      if (b2 && inverseMass2 > 0) {
        b2.applyPositionCorrection(vec3.scale(correction, +inverseMass2, new vec3()))
        appliedCorrection = true
      }
    })

    return appliedCorrection
  }
}
