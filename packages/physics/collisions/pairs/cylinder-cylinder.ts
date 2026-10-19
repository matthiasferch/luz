import type { Cylinder } from '../../volumes/cylinder'
import type { Collision } from '../../collision'
import { collideConvexShapes } from '../algorithms/convex-queries'
import { Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'
import { surfaceContactSlop } from '../algorithms/surface-contact'

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 64
})

const parallelCapAlignment = 0.85
const clippingTolerance = 1e-7
const rimSampleCount = 8

// Keep a broad support polygon rather than letting manifold normalization keep
// only the four deepest points along one side of a tilted cap.
const reducePatch = (contacts: Collision[]): Collision[] => {
  if (contacts.length <= 4) {
    return contacts
  }

  const selectedContacts = [
    contacts.reduce((firstContact, secondContact) =>
      secondContact.penetrationDepth > firstContact.penetrationDepth + clippingTolerance ? secondContact : firstContact
    )
  ]
  const separation = vectors.acquire()

  while (selectedContacts.length < 4) {
    let bestContact: Collision | undefined,
      bestScore = -1

    for (const candidate of contacts) {
      if (selectedContacts.includes(candidate)) {
        continue
      }

      let score = Infinity

      for (const existingContact of selectedContacts) {
        score = Math.min(score, Vector3.subtract(candidate.point, existingContact.point, separation).squaredMagnitude)
      }

      if (score > bestScore) {
        bestContact = candidate
        bestScore = score
      }
    }

    selectedContacts.push(bestContact!)
  }

  return selectedContacts
}

const createCapContacts = (reference: Cylinder, incident: Cylinder, outwardNormal: Vector3): Collision[] => {
  const referenceSign = Vector3.calculateDotProduct(reference.axes[2], outwardNormal) > 0 ? 1 : -1
  const incidentSign = Vector3.calculateDotProduct(incident.axes[2], outwardNormal) > 0 ? -1 : 1
  const offset = vectors.acquire()
  const referenceCenter = Vector3.add(
    reference.center,
    Vector3.scale(reference.axes[2], (referenceSign * reference.height) / 2, offset),
    vectors.acquire()
  )
  const incidentCenter = Vector3.add(
    incident.center,
    Vector3.scale(incident.axes[2], (incidentSign * incident.height) / 2, offset),
    vectors.acquire()
  )
  const alignment = Vector3.calculateDotProduct(incident.axes[2], outwardNormal)
  const prefix = `cylinder:cap:${referenceSign}:cap:${incidentSign}`
  const contacts: Collision[] = []
  const radialOffset = vectors.acquire()
  const candidatePoint = vectors.acquire()
  const projectPoint = (point: Vector3, destination: Vector3): Vector3 => {
    Vector3.subtract(point, referenceCenter, destination)

    return destination.subtract(
      Vector3.scale(outwardNormal, Vector3.calculateDotProduct(destination, outwardNormal), offset)
    )
  }

  const addContact = (point: Vector3, feature: string) => {
    const distance = Vector3.calculateDotProduct(Vector3.subtract(point, referenceCenter, offset), outwardNormal)

    if (distance > surfaceContactSlop) {
      return
    }

    projectPoint(point, radialOffset)

    if (radialOffset.magnitude > reference.radius + clippingTolerance) {
      return
    }

    Vector3.add(referenceCenter, radialOffset, candidatePoint)

    if (
      contacts.some(
        (existingContact) =>
          Vector3.subtract(existingContact.point, candidatePoint, offset).magnitude < clippingTolerance
      )
    ) {
      return
    }

    contacts.push({
      point: candidatePoint.copyTo(vectors.acquire()),
      normal: outwardNormal,
      penetrationDepth: Math.max(0, -distance),
      featureId: `${prefix}:${feature}`,
      isRestingContact: true,
      contactType: 'patch'
    })
  }

  const calculateRimPoint = (cylinder: Cylinder, center: Vector3, index: number, destination: Vector3): Vector3 => {
    const angle = (index * 2 * Math.PI) / rimSampleCount

    return center
      .copyTo(destination)
      .add(Vector3.scale(cylinder.axes[0], Math.cos(angle) * cylinder.radius, offset))
      .add(Vector3.scale(cylinder.axes[1], Math.sin(angle) * cylinder.radius, offset))
  }
  const incidentRim = Array.from({ length: rimSampleCount }, (_, index) =>
    calculateRimPoint(incident, incidentCenter, index, vectors.acquire())
  )
  const startOffset = vectors.acquire()
  const endOffset = vectors.acquire()
  const edge = vectors.acquire()
  const clippedPoint = vectors.acquire()

  incidentRim.forEach((point, index) => {
    addContact(point, `incident:${index}`)

    // Clip each projected rim segment against the reference disk. Merely
    // discarding outside samples can miss the entire overlap near an edge.
    const endPoint = incidentRim[(index + 1) % rimSampleCount]

    projectPoint(point, startOffset)
    projectPoint(endPoint, endOffset)
    Vector3.subtract(endOffset, startOffset, edge)

    const quadraticCoefficient = edge.squaredMagnitude,
      linearCoefficient = 2 * Vector3.calculateDotProduct(startOffset, edge)
    const constantCoefficient = startOffset.squaredMagnitude - reference.radius * reference.radius
    const discriminant = linearCoefficient * linearCoefficient - 4 * quadraticCoefficient * constantCoefficient

    if (quadraticCoefficient < 1e-14 || discriminant < 0) {
      return
    }

    for (const sign of [-1, 1]) {
      const fraction = (-linearCoefficient + sign * Math.sqrt(discriminant)) / (2 * quadraticCoefficient)

      if (fraction >= 0 && fraction <= 1) {
        point.copyTo(clippedPoint).add(Vector3.subtract(endPoint, point, edge).scale(fraction))
        addContact(clippedPoint, `clip:${index}:${sign}`)
      }
    }
  })

  // Include the exact lowest rim point for a tilted cap.
  addContact(incident.calculateSupportPoint(Vector3.scale(outwardNormal, -1, offset)), 'support')

  const rimPoint = vectors.acquire()
  const incidentPoint = vectors.acquire()

  // Handle a reference cap contained within the incident cap as well as lenses
  // whose circular boundary lies between the incident rim samples.
  for (let index = 0; index < rimSampleCount; index++) {
    calculateRimPoint(reference, referenceCenter, index, rimPoint)

    const height =
      Vector3.calculateDotProduct(Vector3.subtract(incidentCenter, rimPoint, offset), incident.axes[2]) / alignment

    rimPoint.copyTo(incidentPoint).add(Vector3.scale(outwardNormal, height, offset))

    if (Vector3.subtract(incidentPoint, incidentCenter, offset).magnitude <= incident.radius + clippingTolerance) {
      addContact(incidentPoint, `reference:${index}`)
    }
  }

  return reducePatch(contacts)
}

const calculateCylinderCollisions = (firstCylinder: Cylinder, secondCylinder: Cylinder): Collision[] | null => {
  if (Math.abs(Vector3.calculateDotProduct(firstCylinder.axes[2], secondCylinder.axes[2])) >= parallelCapAlignment) {
    // Use analytic cap planes for shallow support. A nearly coplanar EPA seed
    // can yield an unstable feature normal even though the supporting cap is flat.
    const candidates = [
      { reference: firstCylinder, incident: secondCylinder, sign: 1 },
      { reference: secondCylinder, incident: firstCylinder, sign: -1 }
    ].sort((firstCandidate, secondCandidate) => secondCandidate.reference.radius - firstCandidate.reference.radius)
    const offset = vectors.acquire()
    const outwardNormal = vectors.acquire()
    const radialOffset = vectors.acquire()

    for (const { reference, incident, sign } of candidates) {
      Vector3.subtract(incident.center, reference.center, offset)

      const axialDistance = Vector3.calculateDotProduct(offset, reference.axes[2])

      Vector3.scale(reference.axes[2], axialDistance >= 0 ? 1 : -1, outwardNormal)

      const depth = reference.height / 2 + incident.calculateEffectiveRadius(outwardNormal) - Math.abs(axialDistance)

      if (depth < -clippingTolerance || depth > Math.min(reference.height, incident.height) / 2) {
        continue
      }

      Vector3.subtract(offset, Vector3.scale(reference.axes[2], axialDistance, radialOffset), radialOffset)

      const radialDistance = radialOffset.magnitude

      if (radialDistance > clippingTolerance) {
        radialOffset.scale(1 / radialDistance)

        const radialDepth = reference.radius + incident.calculateEffectiveRadius(radialOffset) - radialDistance

        // Prefer side/edge separation when it requires less displacement.
        if (radialDepth < depth) {
          continue
        }
      }

      const patch = createCapContacts(reference, incident, outwardNormal)

      if (patch.length) {
        return patch.map((contact) => ({
          ...contact,
          point: contact.point.clone(),
          normal: contact.normal.clone().scale(sign)
        }))
      }
    }
  }

  return collideConvexShapes(firstCylinder, secondCylinder)
}

export const collideCylinderWithCylinder = (firstCylinder: Cylinder, secondCylinder: Cylinder): Collision[] | null =>
  vectors.runInScope(() => calculateCylinderCollisions(firstCylinder, secondCylinder))
