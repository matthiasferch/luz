import { expect } from 'chai'
import { AnimationMixer, TransformAnimation, Transform } from '@luz/core'
import type { PlaybackController } from '@luz/core'
import type { SkeletalDocument } from '@luz/formats'
import { Model } from '@luz/graphics'
import { Matrix4 } from '@luz/math'

interface PlaybackFixture {
  controller: PlaybackController
  advance(deltaTime: number): void
}

const createObjectFixture = async (): Promise<PlaybackFixture> => {
  const createClip = (duration: number): TransformAnimation => {
    const animation = new TransformAnimation()

    animation.duration = duration
    animation.tracks = {
      translation: [
        { time: 0, value: [0, 0, 0] },
        { time: duration, value: [1, 0, 0] }
      ]
    }

    return animation
  }
  const controller = new AnimationMixer(new Transform(), { Alpha: createClip(1), Beta: createClip(2) })

  return {
    controller,
    advance: (deltaTime) => {
      controller.advance(deltaTime)
    }
  }
}

const createSkeletalFixture = async (): Promise<PlaybackFixture> => {
  const createClip = (duration: number): SkeletalDocument => ({
    type: 'skeletalAnimation',
    schemaVersion: 1,
    duration,
    isAutoplayEnabled: false,
    playback: 'once',
    keyframes: {
      Root: {
        translation: [
          { time: 0, value: [0, 0, 0] },
          { time: duration, value: [1, 0, 0] }
        ],
        rotation: [{ time: 0, value: [0, 0, 0, 1] }],
        scale: [{ time: 0, value: [1, 1, 1] }]
      }
    }
  })
  const model = await Model.deserialize(
    {
      type: 'model',
      meshes: {},
      armatures: { Rig: { bones: [{ name: 'Root', bindMatrix: Array.from(Matrix4.createIdentity()) }] } },
      animations: { Alpha: 'alpha.animation.json', Beta: 'beta.animation.json' }
    },
    { Alpha: createClip(1), Beta: createClip(2) }
  )
  const transform = new Transform()

  return { controller: model.animationMixer, advance: (deltaTime) => model.update(transform, deltaTime) }
}

describe('Shared playback controls', () => {
  for (const [kind, createFixture] of [
    ['object', createObjectFixture],
    ['skeletal', createSkeletalFixture]
  ] as const) {
    it(`${kind} supports the same transport, modes, speed, fades and live read-only views`, async () => {
      const { controller, advance } = await createFixture()
      const alpha = controller.animations.Alpha
      const beta = controller.animations.Beta

      expect(alpha.state).to.equal('stopped')
      controller.play('Alpha')
      advance(0.25)
      expect(alpha.state).to.equal('playing')
      expect(alpha.time).to.equal(0.25)
      controller.pause()
      advance(1)
      expect(alpha.state).to.equal('paused')
      expect(alpha.time).to.equal(0.25)
      controller.resume()
      controller.setSpeed(2)
      advance(0.125)
      expect(alpha.time).to.equal(0.5)
      controller.seekProgress(1)
      expect(alpha.time).to.equal(1)
      expect(controller.isPaused).to.equal(true)
      controller.resume()
      expect(alpha.time).to.equal(0)
      advance(2)
      expect(alpha.time).to.equal(1)
      expect(alpha.state).to.equal('paused')
      controller.setPlaybackMode('Alpha', 'loop')
      expect(alpha.playbackMode).to.equal('loop')
      advance(0.625)
      expect(alpha.time).to.equal(0.25)
      controller.setMix({ Alpha: 0.2, Beta: 0.8 }, { transitionDuration: 0.5, isRestartEnabled: true })
      advance(0.25)
      expect(alpha.weight).to.be.closeTo(0.6, 1e-8)
      expect(beta.weight).to.be.closeTo(0.4, 1e-8)
      controller.pause()
      advance(1)
      expect(alpha.weight).to.be.closeTo(0.6, 1e-8)
      controller.resume()
      advance(0.25)
      expect(alpha.weight).to.be.closeTo(0.2, 1e-8)
      expect(beta.weight).to.be.closeTo(0.8, 1e-8)
      controller.stop()

      for (const entry of Object.values(controller.animations)) {
        expect(entry.state).to.equal('stopped')
        expect(entry.weight).to.equal(0)
        expect(entry.time).to.equal(0)
      }

      controller.play('Beta')
      expect(beta.state).to.equal('playing')
      expect(controller.isPaused).to.equal(false)
    })
    it(`${kind} rejects invalid control values before changing playback`, async () => {
      const { controller } = await createFixture()

      controller.play('Alpha')

      const snapshot = JSON.stringify(controller.animations)

      for (const operation of [
        () => controller.play('Missing'),
        () => controller.setMix({ Alpha: -1 }),
        () => controller.setMix({ Alpha: 1 }, { transitionDuration: NaN }),
        () => controller.setSpeed(0),
        () => controller.seekProgress(Infinity),
        () => controller.setPlaybackMode('Missing', 'once')
      ]) {
        expect(operation).to.throw()
        expect(JSON.stringify(controller.animations)).to.equal(snapshot)
      }
    })
    it(`${kind} preserves a paused endpoint when changing modes and resumes outgoing fade clocks`, async () => {
      const { controller, advance } = await createFixture()

      controller.play('Alpha')
      controller.seekProgress(1)
      controller.setPlaybackMode('Alpha', 'loop')
      expect(controller.animations.Alpha.time).to.equal(1)
      expect(controller.animations.Alpha.state).to.equal('paused')
      controller.resume()
      controller.seekProgress(0.5)
      controller.play('Beta', { transitionDuration: 0.5 })
      advance(0.125)
      expect(controller.animations.Alpha.time).to.equal(0.625)
      expect(controller.animations.Beta.time).to.equal(0.125)
      advance(0.375)
      expect(controller.animations.Alpha.state).to.equal('stopped')
      expect(controller.animations.Alpha.time).to.equal(0)
    })
  }
})
