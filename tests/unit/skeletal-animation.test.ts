import type { PlaybackMode } from '@luz/formats'
import { expect } from 'chai'
import { Model, ModelLoader } from '@luz/graphics'
import { Transform } from '@luz/core'
import { Matrix4 } from '@luz/math'

const createDefinition = (playback?: PlaybackMode): any => ({
  type: 'model',
  armatures: {
    Rig: {
      bones: Array.from({ length: 65 }, (_, index) => ({
        name: `Bone${index}`,
        parent: '',
        bindMatrix: Array.from(Matrix4.createIdentity())
      }))
    }
  },
  animations: {
    Timeline: {
      type: 'skeletalAnimation',
      schemaVersion: 1,
      duration: 1,
      ...(playback ? { playback } : {}),
      keyframes: Object.fromEntries(
        Array.from({ length: 65 }, (_, index) => [
          `Bone${index}`,
          {
            translation: [
              { time: 0, value: [0, 0, 0] },
              { time: 1, value: [2, 0, 0] }
            ],
            rotation: [{ time: 0, value: [0, 0, 0, 1] }],
            scale: [{ time: 0, value: [1, 1, 1] }]
          }
        ])
      )
    }
  },
  meshes: {
    Triangle: {
      vertices: [0, 0, 0, 0, 0, 1, 0, 0],
      weights: [{ vertex: 0, indices: [64, 0, 0, 0], weights: [1, 0, 0, 0] }]
    }
  }
})

const createModel = async (definition: any): Promise<Model> => {
  const { animations, ...model } = definition
  const references = Object.fromEntries(Object.keys(animations).map((name) => [name, `${name}.animation.json`]))

  return Model.deserialize({ ...model, animations: references }, animations)
}

describe('Skeletal playback', () => {
  it('preserves rotations between opposite-sign keyframes', async () => {
    const definition = createDefinition('loop')

    definition.animations.Timeline.keyframes.Bone0.rotation = [
      { time: 0, value: [0, 0, 0, 1] },
      { time: 1, value: [0, 0, 0, -1] }
    ]

    const model = await createModel(definition)

    model.update(new Transform(), 0.5)
    expect([...model.boneMatrices!.subarray(0, 12)]).to.deep.equal([...Matrix4.createIdentity()].slice(0, 12))
  })
  it('keeps exported action clips stopped, selects clips and crossfades independent instances', async () => {
    const definition = createDefinition('loop')

    definition.animations.Wave = structuredClone(definition.animations.Timeline)
    definition.animations.Wave.isAutoplayEnabled = false

    for (const tracks of Object.values(definition.animations.Wave.keyframes) as any[]) {
      tracks.translation = [{ time: 0, value: [4, 0, 0] }]
    }

    const model = await createModel(definition)
    const otherModel = await createModel(definition)

    expect(model.animations.Wave.state).to.equal('stopped')
    model.animationMixer.play('Wave', { transitionDuration: 1 })
    model.update(new Transform(), 0.5)
    expect(model.animations.Timeline.weight).to.equal(0.5)
    expect(model.animations.Wave.weight).to.equal(0.5)
    expect(model.boneMatrices![12]).to.be.closeTo(2.5, 1e-6)
    expect(otherModel.animations.Wave.state).to.equal('stopped')
    model.update(new Transform(), 0.5)
    expect(model.animations.Timeline.state).to.equal('stopped')
    expect(model.boneMatrices![12]).to.equal(4)
    model.animationMixer.setMix({})
    model.update(new Transform(), 0)
    expect(Array.from(model.boneMatrices!.subarray(0, 16))).to.deep.equal(Array.from(Matrix4.createIdentity()))
    expect(() => model.animationMixer.setMix({ absent: 1 })).to.throw('Invalid animation weight')
    expect(() => model.animationMixer.setMix({ Wave: NaN })).to.throw('Invalid animation weight')
    expect(() => model.animationMixer.play('Wave', { transitionDuration: -1 })).to.throw('transition duration')
  })
  it('plays explicit autoplay clips once and overrides playback independently without changing asset defaults', async () => {
    const definition = createDefinition()

    definition.animations.Timeline.isAutoplayEnabled = true

    const model = await createModel(definition)
    const otherModel = await createModel(definition)
    const animation = model.animations.Timeline
    const serialized = animation.serialize()

    expect(animation.state).to.equal('playing')
    model.update(new Transform(), 2)
    expect(animation.time).to.equal(1)
    expect(model.boneMatrices![12]).to.equal(2)
    model.animationMixer.setPlaybackMode('Timeline', 'loop')
    model.update(new Transform(), 0.25)
    expect(animation.time).to.equal(0.25)
    model.animationMixer.setPlaybackMode('Timeline', 'once')
    expect(animation.time).to.equal(0.25)
    model.update(new Transform(), 2)
    expect(animation.state).to.equal('paused')
    model.animationMixer.setPlaybackMode('Timeline', 'loop')
    model.animationMixer.setMix({})
    model.animationMixer.setPlaybackMode('Timeline', 'once')
    expect(animation.state).to.equal('stopped')
    model.animationMixer.setPlaybackMode('Timeline', 'loop')
    model.animationMixer.play('Timeline')
    model.update(new Transform(), 1.5)
    expect(animation.time).to.equal(0.5)
    expect(animation.serialize()).to.deep.equal(serialized)
    expect(otherModel.animations.Timeline.playbackMode).to.equal('once')
    expect(otherModel.animations.Timeline.time).to.equal(0)
    expect(() => model.animationMixer.setPlaybackMode('missing', 'loop')).to.throw('Unknown animation')
    expect(() => model.animationMixer.setPlaybackMode('Timeline', 'invalid' as any)).to.throw('playback mode')
  })
  it('preserves manual playback and asset defaults through serialization after runtime overrides', async () => {
    for (const mode of [undefined, 'loop', 'once'] as const) {
      const model = await createModel(createDefinition(mode))
      const serialized = model.animations.Timeline.serialize()

      model.animationMixer.setPlaybackMode('Timeline', mode === 'loop' ? 'once' : 'loop')
      expect(model.animations.Timeline.serialize()).to.deep.equal(serialized)

      const savedDefinition = createDefinition(mode)

      Object.assign(savedDefinition.animations.Timeline, { isAutoplayEnabled: serialized.isAutoplayEnabled })

      const reloadedModel = await createModel(savedDefinition)

      expect(reloadedModel.animations.Timeline.playbackMode).to.equal(mode ?? 'once')
      expect(reloadedModel.animations.Timeline.state).to.equal(mode === undefined ? 'stopped' : 'playing')
    }
  })
  it('pauses fades and playback, seeks exact endpoints, resumes, and applies per-instance speed', async () => {
    const definition = createDefinition('loop')

    definition.animations.Other = structuredClone(definition.animations.Timeline)
    definition.animations.Other.isAutoplayEnabled = false

    const model = await createModel(definition)
    const otherModel = await createModel(definition)
    const serialized = model.animations.Timeline.serialize()

    model.animationMixer.play('Other', { transitionDuration: 1 })
    model.update(new Transform(), 0.25)
    model.animationMixer.pause()
    model.update(new Transform(), 2)
    expect(model.animations.Other.weight).to.equal(0.25)
    expect(model.animations.Other.time).to.equal(0.25)
    model.animationMixer.seekProgress(1)
    model.update(new Transform(), 3)
    expect(model.boneMatrices![12]).to.equal(2)
    expect(model.animations.Other.time).to.equal(1)
    model.animationMixer.resume()
    model.animationMixer.setSpeed(2)
    model.update(new Transform(), 0.25)
    expect(model.animations.Other.time).to.equal(0.5)
    expect(otherModel.animationMixer.speed).to.equal(1)
    expect(otherModel.animations.Timeline.time).to.equal(0)
    expect(model.animations.Timeline.serialize()).to.deep.equal(serialized)
    expect(model.serialize()).not.to.have.property('playbackSpeed')
    expect(model.serialize()).not.to.have.property('isPlaybackPaused')
    expect(() => model.animationMixer.seekProgress(NaN)).to.throw('progress')
    expect(() => model.animationMixer.seekProgress(1.1)).to.throw('progress')
    expect(() => model.animationMixer.setSpeed(0)).to.throw('speed')
    expect(() => model.animationMixer.setSpeed(Infinity)).to.throw('speed')
    model.animationMixer.setMix({ Other: 1 })
    model.animationMixer.pause()
    model.animationMixer.play('Other')
    expect(model.animationMixer.isPaused).to.equal(false)
  })
  it('blends rotations using normalized weights and handles antipodal quaternions', async () => {
    const definition = createDefinition('once')

    definition.animations.Turn = structuredClone(definition.animations.Timeline)

    for (const tracks of Object.values(definition.animations.Turn.keyframes) as any[]) {
      tracks.rotation = [{ time: 0, value: [0, 0, Math.sqrt(0.5), Math.sqrt(0.5)] }]
    }

    const model = await createModel(definition)

    model.animationMixer.setMix({ Timeline: 0.5, Turn: 0.5 })
    model.update(new Transform(), 0)
    expect(model.boneMatrices![0]).to.be.closeTo(Math.sqrt(0.5), 1e-6)
    expect(model.boneMatrices![1]).to.be.closeTo(Math.sqrt(0.5), 1e-6)

    for (const tracks of Object.values(definition.animations.Turn.keyframes) as any[]) {
      tracks.rotation[0].value = tracks.rotation[0].value.map((value: number) => -value)
    }

    const oppositeModel = await createModel(definition)

    oppositeModel.animationMixer.setMix({ Timeline: 0.5, Turn: 0.5 })
    oppositeModel.update(new Transform(), 0)
    expect(Array.from(oppositeModel.boneMatrices!)).to.deep.equal(Array.from(model.boneMatrices!))
  })
  it('allocates the full skeleton, initializes playback, holds Once endpoints, and keeps loads independent', async () => {
    const definition = createDefinition('once')
    const loader = new ModelLoader(async (url) =>
      url.endsWith('.animation.json')
        ? definition.animations.Timeline
        : { ...definition, animations: { Timeline: './Timeline.animation.json' } }
    )
    const firstModel = await loader.load('https://fixture.test/rig.model.json')
    const secondModel = await loader.load('https://fixture.test/rig.model.json')

    expect(firstModel.animations.Timeline.playback).to.equal('once')
    expect(firstModel.animations.Timeline.state).to.equal('playing')
    firstModel.update(new Transform(), 2)
    firstModel.update(new Transform(), 1)
    expect(firstModel.animations.Timeline.time).to.equal(1)
    expect(firstModel.animations.Timeline.state).to.equal('paused')
    expect(firstModel.boneMatrices![64 * 16 + 12]).to.equal(2)
    expect(secondModel.boneMatrices![64 * 16 + 12]).to.equal(0)
    expect(firstModel.armatures.Rig.bones[0]).not.to.equal(secondModel.armatures.Rig.bones[0])
  })
  it('wraps looping clips and keeps clips without autoplay stopped at the bind pose', async () => {
    const looping = await createModel(createDefinition('loop'))

    expect(looping.animations.Timeline.playback).to.equal('loop')
    expect(looping.animations.Timeline.state).to.equal('playing')
    looping.update(new Transform(), 1.25)
    expect(looping.animations.Timeline.time).to.equal(0.25)
    expect(looping.boneMatrices![12]).to.equal(0.5)

    const definition = createDefinition()

    definition.armatures.Rig.bones[0].bindMatrix[12] = 3

    const model = await createModel(definition)

    model.update(new Transform(), 0.5)
    expect(model.animations.Timeline.state).to.equal('stopped')
    expect(Array.from(model.boneMatrices!.subarray(0, 16))).to.deep.equal(Array.from(Matrix4.createIdentity()))
  })

  for (const [label, corrupt] of Object.entries({
    duplicate: (data: any) => {
      data.armatures.Rig.bones[1].name = 'Bone0'
    },

    cycle: (data: any) => {
      data.armatures.Rig.bones[0].parent = 'Bone0'
    },

    missingParent: (data: any) => {
      data.armatures.Rig.bones[0].parent = 'absent'
    },

    singularBind: (data: any) => {
      data.armatures.Rig.bones[0].bindMatrix.fill(0)
    },

    nonfiniteBind: (data: any) => {
      data.armatures.Rig.bones[0].bindMatrix[0] = NaN
    },

    missingTrack: (data: any) => {
      delete data.animations.Timeline.keyframes.Bone0
    },

    emptyTrack: (data: any) => {
      data.animations.Timeline.keyframes.Bone0.translation = []
    },

    invalidTime: (data: any) => {
      data.animations.Timeline.keyframes.Bone0.translation[1].time = 0
    },

    invalidBone: (data: any) => {
      data.meshes.Triangle.weights[0].indices[0] = 65
    },

    invalidVertex: (data: any) => {
      data.meshes.Triangle.weights[0].vertex = 1
    },

    invalidWeights: (data: any) => {
      data.meshes.Triangle.weights[0].weights[0] = 0.2
    }
  })) {
    it(`rejects ${label} before rendering`, async () => {
      const definition = createDefinition('once')

      corrupt(definition)

      let error: unknown

      try {
        await createModel(definition)
      } catch (caughtError) {
        error = caughtError
      }

      expect(error).to.be.instanceOf(Error)
    })
  }
})
