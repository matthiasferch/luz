import { describe, expect, it } from 'vitest'
import { TouchNavigation } from '../src/runtime/touch-navigation'

describe('touch navigation', () => {
  it('normalizes one-finger rotation by canvas size and consumes movement once', () => {
    const navigation = new TouchNavigation()

    navigation.start(1, 10, 20)
    navigation.move(1, 40, 80, 300, 600)

    const movement = navigation.capture()

    expect([...movement.rotationDelta]).toEqual([60, 120])
    expect([...movement.panDelta]).toEqual([0, 0])
    expect(movement.dollyDelta).toBe(0)
    expect([...navigation.capture().rotationDelta]).toEqual([0, 0])
    navigation.reset()
    navigation.start(1, 20, 40)
    navigation.move(1, 80, 160, 600, 1200)
    expect([...navigation.capture().rotationDelta]).toEqual([60, 120])
  })
  it('combines midpoint panning and distance-based dolly without rotating', () => {
    const navigation = new TouchNavigation()

    navigation.start(1, 100, 100)
    navigation.start(2, 200, 100)
    navigation.move(1, 80, 130, 600, 800)
    navigation.move(2, 280, 130, 600, 800)

    const movement = navigation.capture()

    expect([...movement.rotationDelta]).toEqual([0, 0])
    expect([...movement.panDelta]).toEqual([30, 30])
    expect(movement.dollyDelta).toBeCloseTo(-2000 * Math.log(2))
    navigation.move(1, 100, 100, 600, 800)
    navigation.move(2, 200, 100, 600, 800)
    expect(navigation.capture().dollyDelta).toBeCloseTo(2000 * Math.log(2))
  })
  it('uses two-dimensional separation and does not dolly during parallel movement', () => {
    const navigation = new TouchNavigation()

    navigation.start(1, 100, 100)
    navigation.start(2, 100, 200)
    navigation.move(1, 120, 130, 600, 800)
    navigation.move(2, 120, 230, 600, 800)

    const movement = navigation.capture()

    expect([...movement.panDelta]).toEqual([20, 30])
    expect(movement.dollyDelta).toBeCloseTo(0)
    navigation.move(2, 120, 330, 600, 800)
    expect(navigation.capture().dollyDelta).toBeLessThan(0)
  })
  it('rebases when fingers are added or removed and retains a completed quick drag', () => {
    const navigation = new TouchNavigation()

    navigation.start(1, 100, 100)
    navigation.start(2, 250, 100)
    expect(navigation.capture().dollyDelta).toBe(0)
    navigation.move(1, 120, 120, 600, 800)
    navigation.move(2, 270, 120, 600, 800)
    navigation.capture()
    navigation.end(2)
    navigation.move(1, 130, 125, 600, 800)
    navigation.end(1)
    expect([...navigation.capture().rotationDelta]).toEqual([10, 5])
    expect(navigation.hasPointers()).toBe(false)
  })
  it('pauses for extra fingers and resumes using their latest positions', () => {
    const navigation = new TouchNavigation()

    navigation.start(1, 100, 100)
    navigation.start(2, 200, 100)
    navigation.move(1, 110, 100, 600, 800)
    navigation.start(3, 300, 100)
    navigation.move(1, 120, 100, 600, 800)
    navigation.move(2, 220, 100, 600, 800)
    expect([...navigation.capture().panDelta]).toEqual([0, 0])
    navigation.end(3)
    navigation.move(1, 130, 110, 600, 800)
    navigation.move(2, 230, 110, 600, 800)
    expect([...navigation.capture().panDelta]).toEqual([10, 10])
  })
  it('avoids unstable pinch distances and discards all movement on reset', () => {
    const navigation = new TouchNavigation()

    navigation.start(1, 100, 100)
    navigation.start(2, 100, 100)
    navigation.move(2, 101, 100, 600, 800)
    navigation.move(2, 200, 100, 600, 800)
    expect(navigation.capture().dollyDelta).toBe(0)
    navigation.move(2, 300, 100, 600, 800)
    navigation.reset()
    navigation.move(1, 200, 200, 600, 800)

    const movement = navigation.capture()

    expect(navigation.getPointerIds()).toEqual([])
    expect([...movement.rotationDelta]).toEqual([0, 0])
    expect([...movement.panDelta]).toEqual([0, 0])
    expect(movement.dollyDelta).toBe(0)
  })
})
