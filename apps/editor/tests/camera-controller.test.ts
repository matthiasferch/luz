import { describe, expect, it } from 'vitest'
import { TransformAnimation, Camera, Entity, Transform } from '@luz/core'
import { Scene } from '@luz/scene'
import { Quaternion, Vector2, Vector3 } from '@luz/math'
import { CameraController } from '../src/runtime/camera-controller'
import { TouchNavigation } from '../src/runtime/touch-navigation'

const convertRadiansToDegrees = (angle: number) => (angle * 180) / Math.PI

const createFixture = (rotation: Quaternion) => {
  const transform = new Transform({ rotation })
  const delta = new Vector2()
  const buttons: Record<number, boolean> = { 0: true }
  const input = {
    buttons,
    captureNavigation: () => ({
      rotationDelta: buttons[0] ? delta : new Vector2(),
      panDelta: !buttons[0] && (buttons[1] || buttons[2]) ? delta : new Vector2(),
      dollyDelta: 0
    }),

    resetNavigation: () => {}
  }
  const controller = new CameraController(input)
  const camera = new Camera()

  controller.setTransform(transform)

  const updateView = () => {
    transform.update(0)
    camera.update(transform, 0)

    const basis = camera.viewMatrix.clone().invert().toMatrix3()

    return { forward: basis.getColumn(2).normalize().scale(-1), up: basis.getColumn(1).normalize() }
  }

  const drag = (x: number, y: number) => {
    delta.set([x, y])
    controller.update()

    return updateView()
  }

  return { transform, controller, input, updateView, drag }
}

describe('CameraController pitch limits', () => {
  it('applies touch pan and pinch together, drains animated input, and resets pending gestures on reattachment', () => {
    const navigation = new TouchNavigation()
    const input = {
      captureNavigation: () => navigation.capture(),

      resetNavigation: () => navigation.reset()
    }
    const controller = new CameraController(input)
    const transform = new Transform({ rotation: Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2) })

    controller.setTransform(transform)
    navigation.start(1, 100, 100)
    navigation.start(2, 200, 100)
    navigation.move(1, 80, 130, 600, 800)
    navigation.move(2, 280, 130, 600, 800)
    controller.update()
    expect(transform.translation.x).toBeCloseTo(-0.3)
    expect(transform.translation.y).toBeCloseTo(0.3)
    expect(transform.translation.z).toBeCloseTo(-4 * Math.log(2))

    const position = transform.translation.clone()

    navigation.move(1, 40, 100, 600, 800)
    controller.update(true)
    controller.update(false)
    expect([...transform.translation]).toEqual([...position])
    navigation.start(1, 100, 100)
    navigation.move(1, 200, 200, 600, 800)
    controller.setTransform(transform)
    controller.update()
    expect([...transform.translation]).toEqual([...position])
    expect(controller.yaw).toBeCloseTo(0)
    expect(controller.pitch).toBeCloseTo(0)
  })
  it('yields navigation to playing and scrubbed animation without simulation and synchronizes on Stop', () => {
    const scene = new Scene()
    const entity = new Entity()
    const animation = new TransformAnimation()
    const delta = new Vector2([100, 20])
    const input = {
      captureNavigation: () => {
        const movement = delta.clone()

        delta.reset()

        return { rotationDelta: movement, panDelta: new Vector2(), dollyDelta: 0 }
      },

      resetNavigation: () => {}
    }
    const controller = new CameraController(input)

    animation.duration = 1
    animation.tracks.rotation = [
      { time: 0, value: Quaternion.createIdentity().serialize() },
      { time: 1, value: Quaternion.setFromAxisAngle(Vector3.createUp(), 1).serialize() }
    ]
    entity.components.Turn = animation
    scene.entities.Camera = entity

    scene.captureSimulationState()
    controller.setTransform(entity)

    const mixer = entity.animationMixer!

    mixer.play('Turn')
    controller.update(mixer.hasActiveAnimations)
    scene.update(0.25, false)
    expect(delta.magnitude).toBe(0)
    expect(entity.rotation.y).toBeCloseTo(Math.sin(0.125))
    mixer.seekProgress(0.75)
    scene.previewAnimations([entity])
    controller.update(mixer.hasActiveAnimations)
    scene.update(0.25, false)
    expect(entity.rotation.y).toBeCloseTo(Math.sin(0.375))
    mixer.stop()
    controller.update(mixer.hasActiveAnimations)
    expect([...entity.rotation]).toEqual([...Quaternion.createIdentity()])

    const expectedYaw = Quaternion.multiply(
      entity.worldRotation,
      Quaternion.setFromAxisAngle(Vector3.createRight(), -Math.PI / 2)
    ).yaw

    expect(controller.yaw).toBeCloseTo(expectedYaw)
    scene.update(0.25, false)
    expect(mixer.animations.Turn.time).toBe(0)
  })
  it('converts world movement and orientation back into a moving parent pose', () => {
    const parent = new Transform({ translation: new Vector3([10, 20, 30]), scale: new Vector3([2, 3, 4]) })

    parent.rotation.set(Quaternion.setFromAxisAngle(Vector3.createUp(), 0.7))

    const { transform, controller, input, drag } = createFixture(
      Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2)
    )

    transform.parent = parent

    controller.setTransform(transform)

    const start = transform.worldTranslation.clone()
    const rightDirection = transform.worldRotation.toMatrix3().getColumn(0)

    input.buttons[0] = false
    ;(input.buttons as Record<number, boolean>)[1] = true

    drag(10, 0)
    expect(
      Vector3.subtract(transform.worldTranslation, start.clone().add(rightDirection.scale(-0.1))).magnitude
    ).toBeLessThan(1e-5)

    input.buttons[0] = true

    parent.rotation.set(Quaternion.setFromAxisAngle(Vector3.createUp(), 1.1))
    drag(1, 0)

    const view = Quaternion.multiply(
      transform.worldRotation,
      Quaternion.setFromAxisAngle(Vector3.createRight(), -Math.PI / 2)
    )

    expect(view.yaw).toBeCloseTo(1.1 - controller.rotationSpeed, 5)
    expect(transform.rotation.y).not.toBeCloseTo(view.y, 2)
  })
  it('loads the authored Sala view without changing its pose', () => {
    const rotation = new Quaternion([
      0.5735765099525452, 2.660050597569352e-7, 3.036860505289951e-7, 0.8191519975662231
    ])
    const { transform, controller, updateView, drag } = createFixture(rotation)

    expect(convertRadiansToDegrees(controller.pitch)).toBeCloseTo(-20, 3)
    expect(convertRadiansToDegrees(Math.asin(updateView().forward.y))).toBeCloseTo(-20, 3)
    drag(0, 0)
    expect([...transform.rotation]).toEqual([...rotation])

    const moved = drag(0, -1)

    expect(convertRadiansToDegrees(Math.asin(moved.forward.y))).toBeCloseTo(
      -20 + convertRadiansToDegrees(controller.rotationSpeed),
      3
    )
  })

  for (const yaw of [0, 1.1, -2.3]) {
    it('keeps symmetric rendered pitch limits at yaw ' + yaw, () => {
      const rotation = Quaternion.setFromAxisAngle(Vector3.createUp(), yaw).multiply(
        Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2)
      )
      const { drag, updateView } = createFixture(rotation)
      const level = updateView().forward
      const limit = Math.PI / 2 - 0.01

      expect(level.y).toBeCloseTo(0, 6)

      for (const [mouseY, sign] of [
        [-10000, 1],
        [10000, -1]
      ]) {
        const { forward: forwardDirection, up } = drag(0, mouseY)

        expect(convertRadiansToDegrees(Math.asin(forwardDirection.y))).toBeCloseTo(
          sign * convertRadiansToDegrees(limit),
          3
        )
        expect(up.y).toBeGreaterThan(0)
        expect(forwardDirection.x * level.x + forwardDirection.z * level.z).toBeGreaterThan(0)

        const repeated = drag(0, mouseY)

        expect(Vector3.subtract(repeated.forward, forwardDirection).magnitude).toBeLessThan(1e-6)
      }

      expect(drag(0, -10).forward.y).toBeGreaterThan(-Math.sin(limit))
    })
  }

  it('preserves a controlled view when the controller is reattached', () => {
    const { transform, controller, drag, updateView } = createFixture(
      Quaternion.setFromAxisAngle(Vector3.createRight(), Math.PI / 2)
    )
    const before = drag(1450, -120).forward
    const pitch = controller.pitch,
      yaw = controller.yaw

    controller.setTransform(transform)
    expect(controller.pitch).toBeCloseTo(pitch, 5)
    expect(controller.yaw).toBeCloseTo(yaw, 5)
    drag(0, 0)
    expect(Vector3.subtract(updateView().forward, before).magnitude).toBeLessThan(1e-6)
    expect(drag(0, -1).forward.y).toBeGreaterThan(before.y)
  })
})
