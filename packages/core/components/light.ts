import { Serialize, Uniform, Register } from '@luz/serialization'
import { Matrix4, Vector2, Vector3 } from '@luz/math'
import { BoundingBox } from '../bounding-box'
import { Component } from '../component'
import { Transform } from '../transform'
import { Camera } from './camera'
import { LightType } from '@luz/formats'

const pointDirections = [
  new Vector3([1, 0, 0]),
  new Vector3([-1, 0, 0]),
  new Vector3([0, 1, 0]),
  new Vector3([0, -1, 0]),
  new Vector3([0, 0, 1]),
  new Vector3([0, 0, -1])
]
const pointUpDirections = [
  new Vector3([0, -1, 0]),
  new Vector3([0, -1, 0]),
  new Vector3([0, 0, 1]),
  new Vector3([0, 0, -1]),
  new Vector3([0, -1, 0]),
  new Vector3([0, -1, 0])
]

@Register('light')
export class Light extends Component {
  readonly type = 'light'
  readonly timestep: Component.Timestep = 'variable'

  @Serialize()
  lightType: LightType = 'spot'

  @Serialize()
  aspect: number = 1

  // Degrees, full cone angle.
  @Uniform()
  @Serialize()
  coneAngle: number = 90

  @Uniform()
  @Serialize()
  readonly clipPlanes: Vector2 = new Vector2([1, 100])

  @Uniform()
  @Serialize()
  readonly shadowSize: Vector2 = new Vector2([20, 20])

  @Uniform()
  get isDirectional(): boolean {
    return this.lightType === 'directional'
  }

  @Uniform()
  get isPoint(): boolean {
    return this.lightType === 'point'
  }

  @Serialize()
  isVisible: boolean = true

  // World units; directional illumination is unbounded.
  @Uniform()
  @Serialize()
  range: number = 6.0

  // Degrees between outer and inner cone angles.
  @Uniform()
  @Serialize()
  coneFalloff: number = 10.0

  @Uniform()
  @Serialize()
  intensity: number = 1.0

  @Uniform()
  @Serialize()
  volumetricIntensity: number = 0.0

  @Uniform()
  @Serialize()
  volumetricDensity: number = 0.02

  @Uniform()
  @Serialize()
  volumetricAnisotropy: number = 0.35

  @Uniform()
  @Serialize()
  volumetricNoiseScale: number = 1.5

  @Uniform()
  @Serialize()
  volumetricNoiseSpeed: number = 0.002

  @Uniform()
  @Serialize()
  volumetricNoiseStrength: number = 0.6

  @Uniform()
  @Serialize()
  softness: number = 1.0

  @Uniform()
  @Serialize()
  readonly color: Vector3 = Vector3.createOne()

  @Uniform()
  readonly translation = new Vector3()

  @Uniform()
  readonly direction = new Vector3()

  @Uniform()
  readonly textureMatrix = new Matrix4()

  readonly shadowCamera = new Camera()

  boundingBox: BoundingBox | null = null

  private readonly biasMatrix = new Matrix4()
  private readonly shadowTransform = new Transform()
  private readonly pointTarget = new Vector3()
  private readonly singleCamera = [this.shadowCamera]
  private readonly pointCameras: Camera[] = []

  get shadowCameras(): readonly Camera[] {
    if (!this.isPoint) {
      return this.singleCamera
    }

    if (this.pointCameras.length === 0) {
      this.pointCameras.push(this.shadowCamera, ...Array.from({ length: 5 }, () => new Camera()))
    }

    return this.pointCameras
  }

  constructor() {
    super()

    this.translation = new Vector3()
    this.direction = new Vector3()

    this.biasMatrix.translate(new Vector3([0.5, 0.5, 0.5]))
    this.biasMatrix.scale(new Vector3([0.5, 0.5, 0.5]))
  }

  serialize(): Record<string, unknown> {
    const data = super.serialize()

    if (this.lightType !== 'spot') {
      delete data.coneAngle
      delete data.coneFalloff
    }

    return data
  }

  static async deserialize(data: unknown): Promise<Light> {
    if (
      !data ||
      typeof data !== 'object' ||
      !('lightType' in data) ||
      (data.lightType !== 'spot' && data.lightType !== 'directional' && data.lightType !== 'point')
    ) {
      throw new Error('Light requires lightType to be spot, directional or point')
    }

    for (const property of ['coneAngle', 'coneFalloff'] as const) {
      if (data.lightType === 'spot') {
        const value = (data as Record<string, unknown>)[property]

        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
          throw new Error(`Spot light requires ${property} to be a nonnegative finite number`)
        }
      } else if (property in data) {
        throw new Error(`Light ${property} is only supported for spot lights`)
      }
    }

    for (const property of ['clipPlanes', 'shadowSize'] as const) {
      if (property in data) {
        const value = (data as Record<string, unknown>)[property]

        if (
          !Array.isArray(value) ||
          value.length !== 2 ||
          !value.every((entry) => typeof entry === 'number' && Number.isFinite(entry) && entry > 0)
        ) {
          throw new Error(`Light ${property} must contain two positive finite numbers`)
        }
      }
    }

    const light = (await super.deserialize(data)) as Light

    if (!Number.isFinite(light.range) || light.range <= 0) {
      throw new Error('Light range must be a positive finite number')
    }

    if (light.lightType === 'spot' && (light.coneAngle <= 0 || light.coneAngle >= 180)) {
      throw new Error('Spot light coneAngle must be between 0 and 180 degrees, exclusively')
    }

    if (light.lightType === 'spot' && light.coneFalloff > light.coneAngle) {
      throw new Error('Spot light coneFalloff must not exceed coneAngle')
    }

    if (
      !Array.from(light.clipPlanes).every(Number.isFinite) ||
      light.clipPlanes.x <= 0 ||
      light.clipPlanes.y <= light.clipPlanes.x
    ) {
      throw new Error('Light clipPlanes must have a positive near distance and a greater far distance')
    }

    if (!Array.from(light.shadowSize).every((value) => Number.isFinite(value) && value > 0)) {
      throw new Error('Light shadowSize must contain positive finite dimensions')
    }

    return light
  }

  update(transform: Transform, deltaTime: number) {
    transform.worldTranslation.copyTo(this.translation)

    if (this.isPoint) {
      this.updatePointShadows()

      return
    }

    const camera = this.shadowCamera

    camera.fieldOfView = this.coneAngle
    camera.aspect = this.isDirectional ? this.shadowSize.x / this.shadowSize.y : this.aspect
    camera.orthographicHeight = this.isDirectional ? this.shadowSize.y : 0

    camera.clipPlanes.set(this.clipPlanes)

    if (this.isDirectional) {
      this.shadowTransform.translation.set(transform.worldTranslation)
      this.shadowTransform.rotation.set(transform.worldRotation)
      this.shadowTransform.update(deltaTime)
      camera.update(this.shadowTransform, deltaTime)
    } else {
      camera.update(transform, deltaTime)
    }

    camera.frustum.axes[2].copyTo(this.direction).normalize()
    this.biasMatrix.copyTo(this.textureMatrix)
    this.textureMatrix.multiply(camera.projectionMatrix)
    this.textureMatrix.multiply(camera.viewMatrix)

    this.boundingBox = new BoundingBox(camera.frustum.calculateVertices())
  }

  private updatePointShadows(): void {
    this.shadowCameras.forEach((camera, index) => {
      camera.aspect = 1
      camera.fieldOfView = 90
      camera.orthographicHeight = 0

      camera.clipPlanes.set(this.clipPlanes)
      Vector3.add(this.translation, pointDirections[index], this.pointTarget)
      Matrix4.createLookAtTransform(
        this.translation,
        this.pointTarget,
        pointUpDirections[index],
        this.shadowTransform.modelMatrix
      )
      camera.updateFromMatrix(this.shadowTransform.modelMatrix)
    })
    this.direction.reset()

    this.boundingBox ??= new BoundingBox()

    for (const axis of ['x', 'y', 'z'] as const) {
      this.boundingBox.minimum[axis] = this.translation[axis] - this.range
      this.boundingBox.maximum[axis] = this.translation[axis] + this.range
    }
  }
}

export const isLight = (component: Component): component is Light => {
  return component.type === 'light'
}
