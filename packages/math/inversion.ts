export function hasUsableDeterminant(values: ArrayLike<number>, dimension: number, determinant: number): boolean {
  let scale = 1

  for (let column = 0; column < dimension; column++) {
    let squaredMagnitude = 0

    for (let row = 0; row < dimension; row++) {
      squaredMagnitude += values[column * dimension + row] ** 2
    }

    scale *= Math.sqrt(squaredMagnitude)
  }

  // Compare against the column-volume bound so uniform rescaling preserves invertibility.
  return Number.isFinite(determinant) && Math.abs(determinant) > Number.EPSILON * dimension * scale
}
