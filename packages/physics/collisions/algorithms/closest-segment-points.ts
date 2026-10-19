import { Epsilon, Vector3 } from '@luz/math'
import { Pool } from '@luz/serialization'

const vectors = new Pool({
  createObject: () => new Vector3(),

  resetObject: (vector) => vector.reset(),
  initialCapacity: 8
})

export const findClosestSegmentPoints = (
  firstStart: Vector3,
  firstEnd: Vector3,
  secondStart: Vector3,
  secondEnd: Vector3,
  firstDestination = new Vector3(),
  secondDestination = new Vector3()
): [Vector3, Vector3] =>
  vectors.runInScope(() => {
    const firstDirection = Vector3.subtract(firstEnd, firstStart, vectors.acquire())
    const secondDirection = Vector3.subtract(secondEnd, secondStart, vectors.acquire())
    const startOffset = Vector3.subtract(firstStart, secondStart, vectors.acquire())
    const firstLengthSquared = Vector3.calculateDotProduct(firstDirection, firstDirection)
    const secondLengthSquared = Vector3.calculateDotProduct(secondDirection, secondDirection)
    const secondProjection = Vector3.calculateDotProduct(secondDirection, startOffset)

    let firstFraction = 0
    let secondFraction = 0

    if (firstLengthSquared <= Epsilon && secondLengthSquared <= Epsilon) {
      firstStart.copyTo(firstDirection)
      secondStart.copyTo(secondDirection)

      return [firstDirection.copyTo(firstDestination), secondDirection.copyTo(secondDestination)]
    }

    if (firstLengthSquared <= Epsilon) {
      secondFraction = Math.max(0, Math.min(1, secondProjection / secondLengthSquared))
    } else {
      const firstProjection = Vector3.calculateDotProduct(firstDirection, startOffset)

      if (secondLengthSquared <= Epsilon) {
        firstFraction = Math.max(0, Math.min(1, -firstProjection / firstLengthSquared))
      } else {
        const directionAlignment = Vector3.calculateDotProduct(firstDirection, secondDirection)
        const denominator = firstLengthSquared * secondLengthSquared - directionAlignment * directionAlignment

        if (Math.abs(denominator) > Epsilon) {
          firstFraction = Math.max(
            0,
            Math.min(1, (directionAlignment * secondProjection - firstProjection * secondLengthSquared) / denominator)
          )
        }

        secondFraction = (directionAlignment * firstFraction + secondProjection) / secondLengthSquared

        if (secondFraction < 0) {
          secondFraction = 0
          firstFraction = Math.max(0, Math.min(1, -firstProjection / firstLengthSquared))
        } else if (secondFraction > 1) {
          secondFraction = 1
          firstFraction = Math.max(0, Math.min(1, (directionAlignment - firstProjection) / firstLengthSquared))
        }
      }
    }

    Vector3.add(firstStart, Vector3.scale(firstDirection, firstFraction, firstDirection), firstDirection)
    Vector3.add(secondStart, Vector3.scale(secondDirection, secondFraction, secondDirection), secondDirection)

    return [firstDirection.copyTo(firstDestination), secondDirection.copyTo(secondDestination)]
  })
