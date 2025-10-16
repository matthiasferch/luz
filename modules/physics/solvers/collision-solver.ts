import { vec3 } from '@luz/vectors'
import { Broadphase } from '../broadphase/broadphase'
import { CollisionManifold } from '../collision'
import { Biped, isBiped } from '@luz/core'

const { sqrt, sign, abs, max, cos, PI } = Math

const contactRestVelocity: number = 0.002
const penetrationTolerance: number = 0.001

const baumgarteFactor: number = 0.2
const groundSlopeThreshold: number = 45
const bipedCorrectionIncrement: number = 0.02

const positionCorrectionFactor: number = 0.25
const positionCorrectionThreshold: number = 0.005
const positionCorrectionThresholdStatic: number = 0.02

export class CollisionSolver {
  static updateBipedGroundState(collisionManifolds: CollisionManifold[]) {
    collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      const b1IsBiped = isBiped(b1)
      const b2IsBiped = b2 ? isBiped(b2) : false

      if (!b1IsBiped && !b2IsBiped) {
        return
      }

      collisions.forEach(({ contact, normal }) => {
        const isGroundSlope = normal.y >= cos((groundSlopeThreshold * PI) / 180)

        if (b1IsBiped) {
          const r1 = vec3.subtract(contact, b1.volume.center, new vec3())

          if (r1.y < 0 && isGroundSlope) {
            (b1 as Biped).onGround = true
          }
        }

        if (b2 && b2IsBiped) {
          const r2 = vec3.subtract(contact, b2.volume.center, new vec3())

          if (r2.y < 0 && isGroundSlope) {
            (b2 as Biped).onGround = true
          }
        }
      })
    })
  }

  static solveVelocities(collisionManifolds: CollisionManifold[], frameRate: number) {
    collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      collisions.forEach(({ contact, normal: collisionNormal, distance }) => {
        const normal = Broadphase.calculateOrientedNormal(collisionNormal, contact, b1, b2)

        const b1Contact = vec3.subtract(contact, b1.volume.center, new vec3())
        const b2Contact = vec3.add(b1.linearVelocity, vec3.cross(b1.angularVelocity, b1Contact, new vec3()), new vec3())

        const p2 = b2 ? vec3.subtract(contact, b2.volume.center, new vec3()) : null
        const v2 = b2 ? vec3.add(b2.linearVelocity, vec3.cross(b2.angularVelocity, p2!, new vec3()), new vec3()) : null

        const relativeVelocity = v2 ? vec3.subtract(v2, b2Contact, new vec3()) : vec3.subtract(vec3.zero, b2Contact, new vec3())

        const velocityAlongNormal = vec3.dot(relativeVelocity, normal)

        if (velocityAlongNormal > 0) {
          return
        }

        const tangent = vec3.subtract(relativeVelocity, vec3.scale(normal, velocityAlongNormal, new vec3()))

        const tangentLength = tangent.length // length before normalization
        const tangentDirection = tangentLength > 0 ? tangent.normalize() : vec3.zero

        const r1 = b1.restitution ?? 0
        const r2 = b2 ? (b2.restitution ?? r1) : r1

        const restitution = abs(velocityAlongNormal) < contactRestVelocity ? 0 : max(r1, r2)

        const depth = max(distance - penetrationTolerance, 0)
        const depthBias = (baumgarteFactor / frameRate) * depth

        const impulseScalar = max(-((1.0 + restitution) * velocityAlongNormal) + depthBias, 0)

        const b1IsBiped = isBiped(b1)
        const b2IsBiped = b2 ? isBiped(b2) : false

        const b1InverseMass = b1IsBiped && b2 ? 0 : (b1.mass > 0 ? 1.0 / b1.mass : 0)
        const b2InverseMass = b2 ? (b2IsBiped ? 0 : (b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0)) : 0

        const totalInverseMass = b1InverseMass + b2InverseMass

        if (totalInverseMass === 0) {
          return
        }

        const b1InverseInertia = b1.volume.inverseInertia
        const b2InverseInertia = b2 ? b2.volume.inverseInertia : null

        const computeEffectiveMass = (direction: vec3) => {
          let effectiveMass = totalInverseMass

          if (b1InverseMass > 0) {
            const b1CrossDirection = vec3.cross(b1Contact, direction, new vec3())
            const b1AngularComponent = vec3.cross(b1InverseInertia.transform(b1CrossDirection, new vec3()), b1Contact, new vec3())

            effectiveMass += vec3.dot(b1AngularComponent, direction)
          }

          if (b2 && b2InverseMass > 0 && p2 && b2InverseInertia) {
            const b2CrossDirection = vec3.cross(p2, direction, new vec3())
            const b2AngularComponent = vec3.cross(b2InverseInertia.transform(b2CrossDirection, new vec3()), p2, new vec3())

            effectiveMass += vec3.dot(b2AngularComponent, direction)
          }

          return effectiveMass
        }

        const normalEffectiveMass = computeEffectiveMass(normal)

        if (normalEffectiveMass <= 0) {
          return
        }

        const normalImpulseMagnitude = impulseScalar > 0 ? impulseScalar / normalEffectiveMass : 0

        if (normalImpulseMagnitude > 0) {
          const normalImpulse = vec3.scale(normal, normalImpulseMagnitude, new vec3())

          if (b1InverseMass > 0) {
            b1.linearVelocity.subtract(vec3.scale(normalImpulse, b1InverseMass, new vec3()))
            b1.angularVelocity.subtract(b1InverseInertia.transform(vec3.cross(b1Contact, normalImpulse, new vec3()), new vec3()))
          }

          if (b2 && b2InverseMass > 0 && p2 && b2InverseInertia) {
            b2.linearVelocity.add(vec3.scale(normalImpulse, b2InverseMass, new vec3()))
            b2.angularVelocity.add(b2InverseInertia.transform(vec3.cross(p2, normalImpulse, new vec3()), new vec3()))
          }
        }

        if (tangentLength > 0) {
          const frictionEffectiveMass = computeEffectiveMass(tangentDirection)

          if (frictionEffectiveMass > 0) {
            let tangentImpulse = -vec3.dot(relativeVelocity, tangentDirection) / frictionEffectiveMass

            const impulseMagnitude = abs(normalImpulseMagnitude)

            const b1Friction = b1.friction ?? 0
            const b2Friction = b2 ? (b2.friction ?? b1Friction) : b1Friction

            const friction = sqrt(max(b1Friction, 0) * max(b2Friction, 0))

            if (abs(tangentImpulse) > (friction * 1.5) * impulseMagnitude) {
              tangentImpulse = sign(tangentImpulse) * friction * impulseMagnitude
            }

            if (tangentImpulse !== 0) {
              const frictionImpulse = vec3.scale(tangentDirection, tangentImpulse, new vec3())

              if (b1InverseMass > 0) {
                b1.linearVelocity.subtract(vec3.scale(frictionImpulse, b1InverseMass, new vec3()))
                b1.angularVelocity.subtract(b1InverseInertia.transform(vec3.cross(b1Contact, frictionImpulse, new vec3()), new vec3()))
              }

              if (b2 && b2InverseMass > 0 && p2 && b2InverseInertia) {
                b2.linearVelocity.add(vec3.scale(frictionImpulse, b2InverseMass, new vec3()))
                b2.angularVelocity.add(b2InverseInertia.transform(vec3.cross(p2, frictionImpulse, new vec3()), new vec3()))
              }
            }
          }
        }
      })
    })
  }

  static solvePositions(collisionManifolds: CollisionManifold[]) {
    let appliedCorrection = false

    collisionManifolds.forEach(({ bodies, collisions }) => {
      const [b1, b2] = bodies

      let maximumDepth = 0

      let chosenNormal: vec3 | null = null
      let chosenContact: vec3 | null = null

      for (const { contact, normal, distance } of collisions) {
        const depth = max(distance - penetrationTolerance, 0)

        if (depth > maximumDepth) {
          maximumDepth = depth
          chosenContact = contact

          chosenNormal = Broadphase.calculateOrientedNormal(normal, contact, b1, b2)
        }
      }

      if (!chosenNormal || !chosenContact || maximumDepth <= 0) {
        return
      }

      const b1IsBiped = isBiped(b1)
      const b2IsBiped = b2 ? isBiped(b2) : false

      const b1InverseMass = b1IsBiped && b2 ? 0 : (b1.mass > 0 ? 1.0 / b1.mass : 0)
      const b2InverseMass = b2 ? (b2IsBiped ? 0 : (b2 ? (b2.mass > 0 ? 1.0 / b2.mass : 0) : 0)) : 0

      const totalInverseMass = b1InverseMass + b2InverseMass

      if (totalInverseMass === 0) {
        return
      }

      let correctionMagnitude = (maximumDepth * positionCorrectionFactor) / totalInverseMass

      let correctionStepThreshold = positionCorrectionThreshold

      if (!b2) {
        correctionStepThreshold = max(correctionStepThreshold, positionCorrectionThresholdStatic)
      }

      if (b2 && b1IsBiped && b2InverseMass > 0) {
        correctionStepThreshold = max(correctionStepThreshold, bipedCorrectionIncrement / b2InverseMass)
      } else if (b2IsBiped && b1InverseMass > 0) {
        correctionStepThreshold = max(correctionStepThreshold, bipedCorrectionIncrement / b1InverseMass)
      }

      if (correctionMagnitude > correctionStepThreshold) {
        correctionMagnitude = correctionStepThreshold
      }

      const correction = vec3.scale(chosenNormal, correctionMagnitude, new vec3())

      if (b1InverseMass > 0) {
        b1.applyPositionCorrection(vec3.scale(correction, -b1InverseMass, new vec3()))

        appliedCorrection = true
      }

      if (b2 && b2InverseMass > 0) {
        b2.applyPositionCorrection(vec3.scale(correction, +b2InverseMass, new vec3()))

        appliedCorrection = true
      }
    })

    return appliedCorrection
  }
}
