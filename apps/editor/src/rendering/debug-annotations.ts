import type { Rectangle } from '@luz/core'

export interface AnnotationInput {
  key: string
  rectangle: Rectangle
  labelWidth: number
  labelHeight: number
}

export interface AnnotationLayout {
  key: string
  x: number
  y: number
}

const clamp = (value: number, minimumValue: number, maximumValue: number): number =>
  Math.max(minimumValue, Math.min(maximumValue, value))

const intersects = (firstRectangle: Rectangle, secondRectangle: Rectangle, gap: number): boolean =>
  firstRectangle.x < secondRectangle.x + secondRectangle.width + gap &&
  firstRectangle.x + firstRectangle.width + gap > secondRectangle.x &&
  firstRectangle.y < secondRectangle.y + secondRectangle.height + gap &&
  firstRectangle.y + firstRectangle.height + gap > secondRectangle.y

export const layoutDebugAnnotations = (
  annotations: AnnotationInput[],
  viewportWidth: number,
  viewportHeight: number,
  gap = 6
): AnnotationLayout[] => {
  const placed: Array<AnnotationLayout & { width: number; height: number }> = []
  const ordered = [...annotations].sort((firstAnnotation, secondAnnotation) => {
    const firstY = firstAnnotation.rectangle.y - firstAnnotation.labelHeight - gap
    const secondY = secondAnnotation.rectangle.y - secondAnnotation.labelHeight - gap

    return (
      firstY - secondY ||
      firstAnnotation.rectangle.x - secondAnnotation.rectangle.x ||
      firstAnnotation.key.localeCompare(secondAnnotation.key)
    )
  })

  for (const annotation of ordered) {
    const maximumX = Math.max(0, viewportWidth - annotation.labelWidth)
    const maximumY = Math.max(0, viewportHeight - annotation.labelHeight)
    const preferredY = annotation.rectangle.y - annotation.labelHeight - gap

    let x = clamp(annotation.rectangle.x, 0, maximumX)
    let y = clamp(preferredY, 0, maximumY)

    for (let attempt = 0; attempt <= placed.length; attempt++) {
      const candidate = { x, y, width: annotation.labelWidth, height: annotation.labelHeight }
      const overlap = placed.find((existingAnnotation) => intersects(candidate, existingAnnotation, gap))

      if (!overlap) {
        break
      }

      const below = overlap.y + overlap.height + gap

      if (below <= maximumY) {
        y = below
      } else {
        y = clamp(overlap.y - annotation.labelHeight - gap, 0, maximumY)
        x = clamp(overlap.x + overlap.width + gap, 0, maximumX)
      }
    }

    placed.push({ key: annotation.key, x, y, width: annotation.labelWidth, height: annotation.labelHeight })
  }

  return placed.map(({ key, x, y }) => ({ key, x, y }))
}
