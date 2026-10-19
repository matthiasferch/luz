import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Camera, Entity, Transform } from '@luz/core'
import { Matrix4, Vector3 } from '@luz/math'
import { Body, Cuboid } from '@luz/physics'
import { Pool } from '@luz/serialization'
import { Scene } from '@luz/scene'
import { DebugOverlay } from '../src/rendering/debug-overlay'

const createFixture = () => {
  const root = document.createElement('div')

  Object.defineProperties(root, {
    clientWidth: { value: 800, writable: true },
    clientHeight: { value: 600, writable: true }
  })

  const scene = new Scene()
  const camera = new Camera()
  const overlay = new DebugOverlay(root)

  Matrix4.createPerspective(90, 4 / 3, 1, 20, camera.projectionMatrix)

  camera.frustum.aspect = 4 / 3

  camera.frustum.clipPlanes.set([1, 20])
  camera.frustum.applyTransform(new Transform())

  for (const [name, bodyCount] of [
    ['Crate', 2],
    ['Box', 1]
  ] as const) {
    const entity = new Entity()

    entity.translation.set([0, 0, -5])
    entity.refreshWorldTransform()

    for (let bodyIndex = 0; bodyIndex < bodyCount; bodyIndex++) {
      const body = new Body({ mass: 1 })

      body.volume = new Cuboid({ origin: new Vector3([bodyIndex * 2, 0, 0]) })
      entity.components[`body${bodyIndex}`] = body

      body.applyTransform(entity)
    }

    scene.entities[name] = entity
  }

  return { scene, camera, overlay, root }
}

const renderAnnotations = ({ overlay, scene, camera }: ReturnType<typeof createFixture>) => {
  Object.assign(overlay, { lastAnnotationUpdate: Number.NEGATIVE_INFINITY })
  Reflect.get(overlay, 'renderViewportOverlays').call(overlay, scene, camera)
}

const getAnnotationState = (root: HTMLElement) =>
  Array.from(root.children, (element) => ({
    markup: element.outerHTML
  }))

describe('Viewport annotation pooling', () => {
  const acquireObject = Pool.prototype.acquire
  const releaseObject = Pool.prototype.release
  const acquiredBuffers = new Set<unknown>()
  const borrowedObjects = new Set<unknown>()

  beforeEach(() => {
    acquiredBuffers.clear()
    borrowedObjects.clear()
    vi.spyOn(Pool.prototype, 'acquire').mockImplementation(function (this: Pool<unknown>) {
      const object = acquireObject.call(this)

      expect(borrowedObjects.has(object)).toBe(false)
      borrowedObjects.add(object)

      if (object && typeof object === 'object' && 'bodyBoundingBoxes' in object) {
        acquiredBuffers.add(object)
      }

      return object
    })
    vi.spyOn(Pool.prototype, 'release').mockImplementation(function (this: Pool<unknown>, object: unknown) {
      expect(borrowedObjects.delete(object)).toBe(true)
      releaseObject.call(this, object)
    })
  })
  afterEach(() => {
    vi.restoreAllMocks()
    expect(borrowedObjects.size).toBe(0)
  })
  it('reuses bounds across entities and refreshes annotations after body removal, resize and camera changes', () => {
    const fixture = createFixture()

    renderAnnotations(fixture)

    const crate = fixture.root.querySelector<HTMLElement>('[data-entity="Crate"]')!
    const box = fixture.root.querySelector<HTMLElement>('[data-entity="Box"]')!
    const initialState = getAnnotationState(fixture.root)
    const compoundWidth = Number.parseFloat(crate.style.width)

    expect(crate.textContent).toContain('2 bodies')
    expect(compoundWidth).toBeGreaterThan(Number.parseFloat(box.style.width))

    for (let iteration = 0; iteration < 10; iteration++) {
      renderAnnotations(fixture)
      expect(getAnnotationState(fixture.root)).toEqual(initialState)
      expect(borrowedObjects.size).toBe(0)
    }

    expect(acquiredBuffers.size).toBe(1)

    delete fixture.scene.entities.Crate.components.body1
    renderAnnotations(fixture)

    const singleWidth = Number.parseFloat(crate.style.width)

    expect(singleWidth).toBeLessThan(compoundWidth)
    expect(singleWidth).toBe(Number.parseFloat(box.style.width))
    expect(crate.textContent).not.toContain('2 bodies')
    expect(fixture.root.querySelector('[data-entity="Crate"]')).toBe(crate)
    Object.assign(fixture.root, { clientWidth: 1600, clientHeight: 1200 })
    renderAnnotations(fixture)
    expect(Math.abs(Number.parseFloat(crate.style.width) - 2 * singleWidth)).toBeLessThanOrEqual(1)
    Matrix4.createPerspective(60, 4 / 3, 1, 20, fixture.camera.projectionMatrix)
    renderAnnotations(fixture)
    expect(Number.parseFloat(crate.style.width)).toBeGreaterThan(2 * singleWidth)

    delete fixture.scene.entities.Crate
    renderAnnotations(fixture)
    expect(crate.classList.contains('exiting')).toBe(true)
    crate.dispatchEvent(new Event('animationend'))
    expect(fixture.root.querySelector('[data-entity="Crate"]')).toBeNull()
    expect(fixture.root.querySelector('[data-entity="Box"]')).toBe(box)
    expect(acquiredBuffers.size).toBe(1)
  })
  it('releases annotation buffers after DOM creation fails and recovers on the next render', () => {
    const fixture = createFixture()

    vi.spyOn(document, 'createElement').mockImplementationOnce(() => {
      throw new Error('annotation creation failed')
    })
    expect(() => renderAnnotations(fixture)).toThrow('annotation creation failed')
    expect(borrowedObjects.size).toBe(0)
    renderAnnotations(fixture)
    expect(fixture.root.querySelector('[data-entity="Crate"]')).not.toBeNull()
    expect(fixture.root.querySelector('[data-entity="Box"]')).not.toBeNull()
    expect(acquiredBuffers.size).toBe(1)
  })
  it('preserves outer projection and bounds when another viewport renders during a visibility check', () => {
    const fixture = createFixture()
    const nestedFixture = createFixture()

    renderAnnotations(fixture)
    Matrix4.createPerspective(60, 4 / 3, 1, 20, nestedFixture.camera.projectionMatrix)

    delete nestedFixture.scene.entities.Crate.components.body1

    const initialState = getAnnotationState(fixture.root)
    const intersectsBoundingBox = fixture.camera.frustum.intersectsBoundingBox

    vi.spyOn(fixture.camera.frustum, 'intersectsBoundingBox').mockImplementationOnce(function (boundingBox) {
      const outerBuffers = [...borrowedObjects]
      const snapshots = outerBuffers.map((buffers) => JSON.stringify(buffers))

      expect(outerBuffers.length).toBeGreaterThan(0)
      renderAnnotations(nestedFixture)
      expect([...borrowedObjects]).toEqual(outerBuffers)
      expect(outerBuffers.map((buffers) => JSON.stringify(buffers))).toEqual(snapshots)

      return intersectsBoundingBox.call(fixture.camera.frustum, boundingBox)
    })
    renderAnnotations(fixture)
    expect(getAnnotationState(fixture.root)).toEqual(initialState)
    expect(getAnnotationState(nestedFixture.root)).not.toEqual(initialState)
    expect(acquiredBuffers.size).toBe(2)
  })
})
