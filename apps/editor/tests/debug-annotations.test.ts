import { describe, expect, it } from 'vitest'
import { Camera, Transform, Entity } from '@luz/core'
import { Body } from '@luz/physics'
import { Scene } from '@luz/scene'
import { Cuboid } from '@luz/physics'
import { Vector3 } from '@luz/math'
import { DebugOverlay } from '../src/rendering/debug-overlay'
import { layoutDebugAnnotations } from '../src/rendering/debug-annotations'

const makeScene = (data: any): Scene => {
  const scene = new Scene()

  for (const [name, entity] of Object.entries(data.entities)) {
    scene.entities[name] = Object.assign(new Entity(), entity)
  }

  return scene
}

describe('Debug annotation layout', () => {
  it('clamps labels to the viewport', () => {
    const [label] = layoutDebugAnnotations(
      [
        {
          key: 'edge',
          rectangle: { x: 190, y: 2, width: 20, height: 20 },
          labelWidth: 80,
          labelHeight: 30
        }
      ],
      200,
      100
    )

    expect(label).toEqual({ key: 'edge', x: 120, y: 0 })
  })
  it('separates labels with the same preferred position deterministically', () => {
    const labels = layoutDebugAnnotations(
      [
        { key: 'second', rectangle: { x: 20, y: 60, width: 20, height: 20 }, labelWidth: 80, labelHeight: 24 },
        { key: 'first', rectangle: { x: 20, y: 60, width: 20, height: 20 }, labelWidth: 80, labelHeight: 24 }
      ],
      200,
      120,
      6
    )

    expect(labels).toEqual([
      { key: 'first', x: 20, y: 30 },
      { key: 'second', x: 20, y: 60 }
    ])
  })
  it('keeps stable input ordering independent of scene enumeration order', () => {
    const rectangle = { x: 10, y: 50, width: 10, height: 10 }
    const forwardLayout = layoutDebugAnnotations(
      [
        { key: 'a', rectangle, labelWidth: 50, labelHeight: 20 },
        { key: 'b', rectangle, labelWidth: 50, labelHeight: 20 }
      ],
      160,
      100
    )
    const reverse = layoutDebugAnnotations(
      [
        { key: 'b', rectangle, labelWidth: 50, labelHeight: 20 },
        { key: 'a', rectangle, labelWidth: 50, labelHeight: 20 }
      ],
      160,
      100
    )

    expect(reverse).toEqual(forwardLayout)
  })
  it('retains entity elements between frames and clears them when disabled', async () => {
    const root = document.createElement('div')

    Object.defineProperties(root, {
      clientWidth: { value: 800 },
      clientHeight: { value: 600 }
    })

    const transform = new Transform()

    transform.update(0)

    const body = new Body({ mass: 1 })

    ;(body as unknown as { volume: Cuboid }).volume = new Cuboid({ extents: new Vector3([0.25, 0.25, 0.25]) })

    body.applyTransform(transform)

    const overlay = new DebugOverlay(root)
    const scene = makeScene({
      entities: { Crate: { components: { Body: body } } },
      colliders: {},
      collisionManifolds: []
    })
    const camera = new Camera()

    overlay.render(scene as never, camera, { areOverlaysVisible: true } as never)

    const annotation = root.querySelector('[data-entity="Crate"]')

    expect(annotation).not.toBeNull()
    expect(annotation?.textContent).toContain('Active')
    expect(annotation?.textContent).toContain('Dynamic')
    expect(annotation?.textContent).toContain('1.00 kg')
    expect(annotation?.textContent).toContain('μ 0.20')
    expect(annotation?.textContent).toContain('Cuboid')

    const heading = annotation?.querySelector('.overlay-heading')
    const details = annotation?.querySelector('.overlay-details')

    expect(heading?.textContent).toContain('Dynamic')
    expect(heading?.textContent).toContain('Cuboid')
    expect(details?.textContent).not.toContain('Dynamic')
    expect(details?.textContent).not.toContain('Cuboid')
    overlay.render(scene as never, camera, { areOverlaysVisible: true } as never)
    expect(root.querySelector('[data-entity="Crate"]')).toBe(annotation)
    overlay.render(scene as never, camera, { areOverlaysVisible: false } as never)
    expect(annotation?.classList.contains('exiting')).toBe(true)
    annotation?.dispatchEvent(new Event('animationend'))
    expect(root.childElementCount).toBe(0)
  })
  it('shows explicit motion types in the annotation', async () => {
    const root = document.createElement('div')

    Object.defineProperties(root, {
      clientWidth: { value: 800 },
      clientHeight: { value: 600 }
    })

    const makeBody = (mass: number, motionType: Body['motionType']) => {
      const transform = new Transform()

      transform.update(0)

      const body = new Body({ mass, motionType })

      ;(body as unknown as { volume: Cuboid }).volume = new Cuboid({ extents: new Vector3([0.25, 0.25, 0.25]) })

      body.applyTransform(transform)

      return body
    }
    const overlay = new DebugOverlay(root)

    overlay.render(
      makeScene({
        entities: {
          Static: { components: { Body: makeBody(1, 'static') } },
          Kinematic: { components: { Body: makeBody(1, 'kinematic') } },
          Dynamic: { components: { Body: makeBody(1, 'dynamic') } }
        },
        colliders: {},
        collisionManifolds: []
      }),
      new Camera(),
      { areOverlaysVisible: true } as never
    )

    const staticAnnotation = root.querySelector<HTMLElement>('[data-entity="Static"]')!
    const kinematicAnnotation = root.querySelector<HTMLElement>('[data-entity="Kinematic"]')!
    const dynamicAnnotation = root.querySelector<HTMLElement>('[data-entity="Dynamic"]')!

    expect(staticAnnotation.querySelector('.overlay-motion-type')?.textContent).toBe('Static')
    expect(staticAnnotation.classList.contains('passive')).toBe(true)
    expect(kinematicAnnotation.querySelector('.overlay-motion-type')?.textContent).toBe('Kinematic')
    expect(kinematicAnnotation.classList.contains('active')).toBe(true)
    expect(dynamicAnnotation.querySelector('.overlay-motion-type')?.textContent).toBe('Dynamic')
  })
  it('omits annotations whose displayed category is disabled', async () => {
    const root = document.createElement('div')

    Object.defineProperties(root, {
      clientWidth: { value: 800 },
      clientHeight: { value: 600 }
    })

    const transform = new Transform()

    transform.update(0)

    const body = new Body({ mass: 1 })

    ;(body as unknown as { volume: Cuboid }).volume = new Cuboid({ extents: new Vector3([0.25, 0.25, 0.25]) })

    body.applyTransform(transform)

    const overlay = new DebugOverlay(root)

    overlay.render(
      makeScene({
        entities: { Crate: { components: { Body: body } } },
        colliders: {},
        collisionManifolds: []
      }),
      new Camera(),
      {
        areOverlaysVisible: true,
        overlayCategories: { active: false, passive: true, sleeping: true, colliding: true, culled: true }
      } as never
    )
    expect(root.querySelector('[data-entity="Crate"]')).toBeNull()
  })
})
