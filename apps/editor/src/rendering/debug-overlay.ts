import type { Camera } from '@luz/core'
import { BoundingBox } from '@luz/core'
import { BoundingBoxCalculator, calculateBoundingBoxNormalizedDeviceCoordinateRectangle } from '@luz/graphics'
import { Matrix4 } from '@luz/math'
import type { Body } from '@luz/physics'
import { Cuboid, Cylinder, Ellipsoid, Sphere, calculateColliderBoundingBox, isBody } from '@luz/physics'
import type { Scene } from '@luz/scene'
import { Pool } from '@luz/serialization'
import { DEFAULT_DEBUG_OVERLAY_CATEGORIES, type DebugOverlayCategory, type DebugSettings } from '../settings'
import { layoutDebugAnnotations, type AnnotationInput } from './debug-annotations'

const ANNOTATION_UPDATE_INTERVAL = 1000 / 60
const ANNOTATION_LABEL_HEIGHT = 42
const ANNOTATION_LABEL_MINIMUM_WIDTH = 132
const ANNOTATION_LABEL_MAXIMUM_WIDTH = 420
const ANNOTATION_FADE_DURATION = 240

interface AnnotationElements {
  root: HTMLDivElement
  name: HTMLSpanElement
  component: HTMLSpanElement
  details: HTMLDivElement
  state: HTMLSpanElement
  motionType: HTMLSpanElement
  mass: HTMLSpanElement
  friction: HTMLSpanElement
  collider: HTMLSpanElement
  speed: HTMLSpanElement
  contacts: HTMLSpanElement
  removalTimer?: ReturnType<typeof setTimeout>
}

const annotationBuffers = new Pool({
  createObject: () => ({
    viewProjection: new Matrix4(),
    boundingBox: new BoundingBox(),
    bodyBoundingBoxes: [] as BoundingBox[]
  }),

  resetObject: (buffers) => buffers,
  initialCapacity: 2
})

export class DebugOverlay {
  private readonly boundingBoxCalculator = new BoundingBoxCalculator()
  private readonly annotations = new Map<string, AnnotationElements>()

  private lastAnnotationUpdate = Number.NEGATIVE_INFINITY
  private clearViewportOverlays(): void {
    for (const [key, elements] of this.annotations) {
      this.hideAnnotation(key, elements)
    }

    this.lastAnnotationUpdate = Number.NEGATIVE_INFINITY
  }

  private showAnnotation(elements: AnnotationElements): void {
    if (elements.removalTimer !== undefined) {
      clearTimeout(elements.removalTimer)

      elements.removalTimer = undefined
    }

    elements.root.classList.remove('exiting')
  }

  private hideAnnotation(key: string, elements: AnnotationElements): void {
    if (elements.removalTimer !== undefined) {
      return
    }

    elements.root.classList.add('exiting')

    const remove = () => {
      if (this.annotations.get(key) !== elements || !elements.root.classList.contains('exiting')) {
        return
      }

      if (elements.removalTimer !== undefined) {
        clearTimeout(elements.removalTimer)
      }

      elements.root.remove()
      this.annotations.delete(key)
    }

    elements.root.addEventListener('animationend', remove, { once: true })

    elements.removalTimer = setTimeout(remove, ANNOTATION_FADE_DURATION + 40)
  }

  private ensureAnnotationElements(key: string): AnnotationElements {
    const existingElements = this.annotations.get(key)

    if (existingElements) {
      this.showAnnotation(existingElements)

      return existingElements
    }

    const root = document.createElement('div')

    root.className = 'overlay-annotation'
    root.dataset.entity = key

    const label = document.createElement('div')

    label.className = 'overlay-label'

    const heading = document.createElement('div')

    heading.className = 'overlay-heading'

    const name = document.createElement('span')

    name.className = 'overlay-name'

    const component = document.createElement('span')

    component.className = 'overlay-component overlay-detail'

    const headingDetails = document.createElement('div')

    headingDetails.className = 'overlay-heading-details'

    const details = document.createElement('div')

    details.className = 'overlay-details'

    const state = document.createElement('span')

    state.className = 'overlay-detail overlay-state'

    const motionType = document.createElement('span')

    motionType.className = 'overlay-detail overlay-motion-type'

    const mass = document.createElement('span')

    mass.className = 'overlay-detail overlay-mass'

    const friction = document.createElement('span')

    friction.className = 'overlay-detail overlay-friction'

    const collider = document.createElement('span')

    collider.className = 'overlay-detail'

    const speed = document.createElement('span')

    speed.className = 'overlay-detail'

    const contacts = document.createElement('span')

    contacts.className = 'overlay-detail'

    headingDetails.append(component, motionType, collider)
    heading.append(name, headingDetails)
    details.append(state, mass, friction, speed, contacts)
    label.append(heading, details)
    root.append(label)
    this.overlayRoot?.append(root)

    const created = { root, name, component, details, state, motionType, mass, friction, collider, speed, contacts }

    this.annotations.set(key, created)
    this.showAnnotation(created)

    return created
  }

  private formatColliderName(body: Body): string {
    const { volume } = body

    if (volume instanceof Sphere) {
      return 'Sphere'
    }

    if (volume instanceof Cuboid) {
      return 'Cuboid'
    }

    if (volume instanceof Cylinder) {
      return 'Cylinder'
    }

    if (volume instanceof Ellipsoid) {
      return 'Ellipsoid'
    }

    return volume?.constructor?.name ?? 'Collider'
  }

  private formatMotionTypeName(body: Body): string {
    return body.motionType[0].toUpperCase() + body.motionType.slice(1)
  }

  private renderViewportOverlays(scene: Scene, camera: Camera, categories = DEFAULT_DEBUG_OVERLAY_CATEGORIES) {
    const overlay = this.overlayRoot

    if (!overlay) {
      return
    }

    const now = globalThis.performance?.now() ?? Date.now()

    if (now - this.lastAnnotationUpdate < ANNOTATION_UPDATE_INTERVAL) {
      return
    }

    this.lastAnnotationUpdate = now

    const viewportWidth = overlay.clientWidth
    const viewportHeight = overlay.clientHeight

    if (viewportWidth <= 0 || viewportHeight <= 0) {
      return
    }

    return annotationBuffers.runInScope(() => {
      const { viewMatrix, projectionMatrix } = camera
      const { viewProjection, boundingBox, bodyBoundingBoxes: cachedBoundingBoxes } = annotationBuffers.acquire()

      Matrix4.multiply(projectionMatrix, viewMatrix, viewProjection)

      const calculateRectangle = (boundingBox: BoundingBox) => {
        const projectedRectangle = calculateBoundingBoxNormalizedDeviceCoordinateRectangle(boundingBox, viewProjection)

        if (!projectedRectangle) {
          return null
        }

        const minimumX = Math.max(-1, Math.min(1, projectedRectangle.minimumX))
        const minimumY = Math.max(-1, Math.min(1, projectedRectangle.minimumY))
        const maximumX = Math.max(-1, Math.min(1, projectedRectangle.maximumX))
        const maximumY = Math.max(-1, Math.min(1, projectedRectangle.maximumY))

        const screenX0 = (minimumX + 1) * 0.5 * viewportWidth
        const screenY0 = (minimumY + 1) * 0.5 * viewportHeight
        const screenX1 = (maximumX + 1) * 0.5 * viewportWidth
        const screenY1 = (maximumY + 1) * 0.5 * viewportHeight

        const x = Math.max(0, Math.min(viewportWidth, Math.min(screenX0, screenX1)))
        const y = Math.max(0, Math.min(viewportHeight, Math.min(screenY0, screenY1)))
        const x2 = Math.max(0, Math.min(viewportWidth, Math.max(screenX0, screenX1)))
        const y2 = Math.max(0, Math.min(viewportHeight, Math.max(screenY0, screenY1)))

        const width = Math.max(0, x2 - x)
        const height = Math.max(0, y2 - y)

        if (width <= 0 || height <= 0) {
          return null
        }

        return { x, y, width, height }
      }

      const contactCounts = new Map<Body, number>()

      for (const manifold of scene.collisionManifolds) {
        for (const body of manifold.bodies) {
          if (!body) {
            continue
          }

          contactCounts.set(body, (contactCounts.get(body) ?? 0) + manifold.collisions.length)
        }
      }

      const activeKeys = new Set<string>()
      const layoutInputs: AnnotationInput[] = []

      Array.from(scene.iterateEntries()).forEach(([entityName, entity]) => {
        const bodies = Object.entries(entity.components).filter((entry): entry is [string, Body] => isBody(entry[1]))

        if (bodies.length === 0) {
          return
        }

        const bodyBoundingBoxes = bodies.map(([, body], index) => {
          const destination = cachedBoundingBoxes[index] ?? (cachedBoundingBoxes[index] = new BoundingBox())

          return calculateColliderBoundingBox(body.volume, destination)
        })
        const minimum = bodyBoundingBoxes[0].minimum.copyTo(boundingBox.minimum)
        const maximum = bodyBoundingBoxes[0].maximum.copyTo(boundingBox.maximum)

        for (const boundingBox of bodyBoundingBoxes.slice(1)) {
          minimum.x = Math.min(minimum.x, boundingBox.minimum.x)
          minimum.y = Math.min(minimum.y, boundingBox.minimum.y)
          minimum.z = Math.min(minimum.z, boundingBox.minimum.z)
          maximum.x = Math.max(maximum.x, boundingBox.maximum.x)
          maximum.y = Math.max(maximum.y, boundingBox.maximum.y)
          maximum.z = Math.max(maximum.z, boundingBox.maximum.z)
        }

        const projectedRectangle = calculateRectangle(boundingBox)

        if (!projectedRectangle) {
          return
        }

        // Projection coordinates have their origin at the lower-left, while DOM
        // coordinates start in the upper-left.
        const rectangle = {
          x: projectedRectangle.x,
          y: viewportHeight - (projectedRectangle.y + projectedRectangle.height),
          width: projectedRectangle.width,
          height: projectedRectangle.height
        }
        const [componentName, body] = bodies[0]
        const isPassive = !body.isDynamic && body.motionType !== 'kinematic'
        const isSleeping = !isPassive && body.isSleeping
        const contacts = bodies.reduce(
          (contactCount, [, candidate]) => contactCount + (contactCounts.get(candidate) ?? 0),
          0
        )
        const speed = bodies.reduce(
          (maximumSpeed, [, candidate]) => Math.max(maximumSpeed, candidate.linearVelocity.magnitude),
          0
        )
        const isCulled = bodyBoundingBoxes.every((candidate) => !camera.frustum.intersectsBoundingBox(candidate))
        const state = isPassive ? 'Passive' : isSleeping ? 'Sleeping' : 'Active'
        const category: DebugOverlayCategory = isCulled
          ? 'culled'
          : contacts > 0
            ? 'colliding'
            : isPassive
              ? 'passive'
              : isSleeping
                ? 'sleeping'
                : 'active'

        if (!categories[category]) {
          return
        }

        const motionType = this.formatMotionTypeName(body)
        const mass = `${body.mass.toFixed(2)} kg`
        const friction = `μ ${body.friction.toFixed(2)}`
        const collider = bodies.length === 1 ? this.formatColliderName(body) : `${bodies.length} colliders`
        const contactLabel = `${contacts} ${contacts === 1 ? 'contact' : 'contacts'}`
        const componentLabel = bodies.length === 1 ? componentName : `${bodies.length} bodies`
        const headingText = `${entityName} · ${componentLabel} · ${motionType} · ${collider}`
        const detailText = `${state} · ${mass} · ${friction} · ${speed.toFixed(2)} m/s · ${contactLabel}`

        const elements = this.ensureAnnotationElements(entityName)

        elements.root.classList.toggle('active', !isPassive && !isSleeping)
        elements.root.classList.toggle('passive', isPassive)
        elements.root.classList.toggle('sleeping', isSleeping)
        elements.root.classList.toggle('colliding', contacts > 0)
        elements.root.classList.toggle('culled', isCulled)

        elements.root.style.width = `${Math.round(rectangle.width)}px`
        elements.root.style.height = `${Math.round(rectangle.height)}px`
        elements.root.style.transform = `translate3d(${Math.round(rectangle.x)}px, ${Math.round(rectangle.y)}px, 0)`
        elements.name.textContent = entityName
        elements.component.textContent = componentLabel
        elements.state.textContent = state
        elements.motionType.textContent = motionType
        elements.mass.textContent = mass
        elements.friction.textContent = friction
        elements.collider.textContent = collider
        elements.speed.textContent = `${speed.toFixed(2)} m/s`
        elements.contacts.textContent = contactLabel
        elements.root.title = `${entityName}\n${detailText}`

        const labelWidth = Math.max(
          ANNOTATION_LABEL_MINIMUM_WIDTH,
          Math.min(ANNOTATION_LABEL_MAXIMUM_WIDTH, Math.max(headingText.length, detailText.length) * 6.2 + 18)
        )

        layoutInputs.push({
          key: entityName,
          rectangle,
          labelWidth,
          labelHeight: ANNOTATION_LABEL_HEIGHT
        })
        activeKeys.add(entityName)
      })

      for (const [key, elements] of this.annotations) {
        if (activeKeys.has(key)) {
          continue
        }

        this.hideAnnotation(key, elements)
      }

      const placements = layoutDebugAnnotations(layoutInputs, viewportWidth, viewportHeight)
      const rectanglesByKey = new Map(layoutInputs.map(({ key, rectangle }) => [key, rectangle]))

      for (const { key, x, y } of placements) {
        const elements = this.annotations.get(key)
        const rectangle = rectanglesByKey.get(key)

        if (!elements || !rectangle) {
          continue
        }

        elements.root.style.setProperty('--overlay-label-x', `${Math.round(x - rectangle.x)}px`)
        elements.root.style.setProperty('--overlay-label-y', `${Math.round(y - rectangle.y)}px`)
      }
    })
  }

  constructor(private readonly overlayRoot?: HTMLElement | null) {}

  render(scene: Scene, camera: Camera, settings: DebugSettings): void {
    if (settings.areOverlaysVisible) {
      this.renderViewportOverlays(scene, camera, settings.overlayCategories ?? DEFAULT_DEBUG_OVERLAY_CATEGORIES)
    } else {
      this.clearViewportOverlays()
    }
  }

  destroy(): void {
    this.boundingBoxCalculator.clear()

    for (const elements of this.annotations.values()) {
      clearTimeout(elements.removalTimer)
      elements.root.remove()
    }

    this.annotations.clear()
  }
}
