import { expect } from 'chai'
import { Camera, Light, Projector, Transform, isCamera } from '@luz/core'
import { collectUniformProperties } from '@luz/serialization'
import { Quaternion, Vector3 } from '@luz/math'

describe('Core: Projector', () => {
  it('shares projection behavior without treating lights as cameras', () => {
    const camera = new Camera()
    const light = new Light()
    const transform = new Transform({
      translation: new Vector3([2, 3, 4]),
      rotation: Quaternion.setFromEulerAngles(0.4, -0.2, 0.1)
    })

    transform.update(0)
    camera.update(transform, 0)
    light.update(transform, 0)
    expect(camera).to.be.instanceOf(Projector)
    expect(light.shadowCamera).to.be.instanceOf(Projector)
    expect(light).not.to.be.instanceOf(Camera)
    expect(light.volumetricIntensity).to.equal(0)
    expect(isCamera(camera)).to.equal(true)
    expect(isCamera(light)).to.equal(false)
    expect(Array.from(light.shadowCamera.viewMatrix)).to.deep.equal(Array.from(camera.viewMatrix))
    expect(Array.from(light.shadowCamera.projectionMatrix)).to.deep.equal(Array.from(camera.projectionMatrix))
    expect(Array.from(light.shadowCamera.reconstructionMatrix)).to.deep.equal(Array.from(camera.reconstructionMatrix))

    const correction = Quaternion.setFromAxisAngle(Vector3.createRight(), -Math.PI / 2)
    const correctedDirection = Quaternion.multiply(transform.rotation, correction)
      .transformVector3(Vector3.createForward())
      .normalize()

    expect(Vector3.subtract(light.direction, correctedDirection).magnitude).to.be.lessThan(1e-6)
    expect(Array.from(light.direction)).not.to.deep.equal(Array.from(transform.direction))
    expect(light.shadowCamera.frustum.calculateVertices().map((vertex) => Array.from(vertex))).to.deep.equal(
      camera.frustum.calculateVertices().map((vertex) => Array.from(vertex))
    )
  })
  it('preserves inherited projector serialization metadata', () => {
    const camera = new Camera()
    const light = new Light()

    camera.aspect = 1.5
    camera.fieldOfView = 75

    camera.clipPlanes.set([0.25, 250])

    light.aspect = 2
    light.coneAngle = 60

    light.clipPlanes.set([0.5, 500])

    light.volumetricIntensity = 0.4
    light.volumetricDensity = 0.03
    light.volumetricNoiseSpeed = 0.004

    const serializedCamera = camera.serialize() as Record<string, unknown>
    const serializedLight = light.serialize() as Record<string, unknown>

    expect(serializedCamera).to.deep.include({
      type: 'camera',
      aspect: 1.5,
      fieldOfView: 75
    })
    expect(serializedCamera.clipPlanes).to.deep.equal([0.25, 250])
    expect(serializedLight).to.deep.include({
      type: 'light',
      aspect: 2,
      coneAngle: 60,
      volumetricIntensity: 0.4,
      volumetricDensity: 0.03,
      volumetricNoiseSpeed: 0.004
    })
    expect(serializedLight.clipPlanes).to.deep.equal([0.5, 500])
  })
  it('serializes Blender-compatible camera depth-of-field optics', () => {
    const camera = new Camera()

    camera.isDepthOfFieldEnabled = true
    camera.focusDistance = 4.5
    camera.focalLength = 85
    camera.sensorHeight = 24
    camera.fStop = 1.8

    expect(camera.serialize()).to.deep.include({
      type: 'camera',
      isDepthOfFieldEnabled: true,
      focusDistance: 4.5,
      focalLength: 85,
      sensorHeight: 24,
      fStop: 1.8
    })

    const defaults = new Camera()

    expect(defaults.isDepthOfFieldEnabled).to.equal(false)
    expect(defaults.focusDistance).to.equal(10)
    expect(defaults.focalLength).to.equal(50)
    expect(defaults.sensorHeight).to.equal(32)
    expect(defaults.fStop).to.equal(2.8)
  })
  it('keeps camera optics out of the shared projector uniform set', () => {
    const projectorUniforms = collectUniformProperties(Projector).map(({ key }) => key)
    const cameraUniforms = collectUniformProperties(Camera).map(({ key }) => key)

    expect(projectorUniforms).not.to.include('sensorHeight')
    expect(projectorUniforms).not.to.include('focusDistance')
    expect(cameraUniforms).to.include.members(['sensorHeight', 'focusDistance', 'focalLength', 'fStop'])
  })
})
