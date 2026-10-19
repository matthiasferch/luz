import { expect } from 'chai'
import { EntityLoader, Model, ModelLoader } from '@luz/graphics'
import { Transform } from '@luz/core'
import { Matrix4 } from '@luz/math'
import type { SkeletalDocument } from '@luz/formats'

const createAnimation = (distance = 2): SkeletalDocument => ({
  type: 'skeletalAnimation',
  schemaVersion: 1,
  duration: 1,
  isAutoplayEnabled: false,
  keyframes: {
    Root: {
      translation: [
        { time: 0, value: [0, 0, 0] },
        { time: 1, value: [distance, 0, 0] }
      ],
      rotation: [{ time: 0, value: [0, 0, 0, 1] }],
      scale: [{ time: 0, value: [1, 1, 1] }]
    }
  }
})

const createModel = (animations: Record<string, string> = { Walk: '../animations/walk.animation.json' }): any => ({
  type: 'model',
  meshes: {},
  armatures: { Rig: { bones: [{ name: 'Root', parent: '', bindMatrix: Array.from(Matrix4.createIdentity()) }] } },
  animations
})

const expectFailure = async (operation: Promise<unknown>, message: string): Promise<void> => {
  let failure: unknown

  try {
    await operation
  } catch (error) {
    failure = error
  }

  expect(failure).to.be.instanceOf(Error)
  expect((failure as Error).message).to.include(message)
}

describe('Animation documents', () => {
  it('shares concurrent document requests across overlapping clip sets and aliases while isolating playback', async () => {
    const requests: string[] = []
    const clip = createAnimation()
    const loader = new ModelLoader(async (url) => {
      requests.push(url)

      if (url.endsWith('.animation.json')) {
        return clip
      }

      return url.endsWith('joints.model.json')
        ? createModel({ Walk: '../animations/walk.animation.json', March: '../animations/walk.animation.json' })
        : createModel({ Move: '../animations/walk.animation.json', Other: '../animations/other.animation.json' })
    })
    const [joints, surface, repeated] = await Promise.all([
      loader.load('https://fixture.test/models/joints.model.json'),
      loader.load('https://fixture.test/models/surface.model.json'),
      loader.load('https://fixture.test/models/joints.model.json')
    ])

    expect(requests.filter((url) => url.endsWith('walk.animation.json'))).to.have.length(1)
    expect(requests.filter((url) => url.endsWith('other.animation.json'))).to.have.length(1)
    expect(joints.animations.Walk).not.to.equal(surface.animations.Move)
    expect(joints.animations.Walk).not.to.equal(joints.animations.March)
    expect(joints.animations.Walk.keyframes.Root.translation[0].value).not.to.equal(
      repeated.animations.Walk.keyframes.Root.translation[0].value
    )
    joints.animationMixer.play('Walk')
    joints.update(new Transform(), 0.5)
    expect(joints.boneMatrices![12]).to.equal(1)
    expect(joints.animations.March.time).to.equal(0)
    expect(surface.animations.Move.time).to.equal(0)
    expect(repeated.animations.Walk.time).to.equal(0)
    expect(clip).to.deep.equal(createAnimation())
    expect(joints.serialize().animations).to.deep.equal(
      createModel({ Walk: '../animations/walk.animation.json', March: '../animations/walk.animation.json' }).animations
    )

    const serialized = joints.serialize()
    const roundTrip = await loader.loadData(serialized, 'https://fixture.test/models/joints.model.json')

    expect(roundTrip.animations.Walk.time).to.equal(0)
    expect(roundTrip.serialize()).to.deep.equal(serialized)
  })
  it('resolves inline model clips relative to the containing entity or scene', async () => {
    const requests: string[] = []
    const models = new ModelLoader(async (url) => {
      requests.push(url)

      return createAnimation()
    })
    const loader = new EntityLoader(models)
    const definition = { components: { Visual: createModel() } }
    const entity = await loader.loadEntityData(definition, 'https://fixture.test/entities/character.entity.json')
    const scene = await loader.loadSceneData(
      { entities: { Character: definition } },
      'https://fixture.test/scenes/world.scene.json'
    )

    expect(requests).to.deep.equal(['https://fixture.test/animations/walk.animation.json'])
    expect((entity.components.Visual as Model).animations.Walk.duration).to.equal(1)
    expect((scene.entities.Character.components.Visual as Model).animations.Walk).not.to.equal(
      (entity.components.Visual as Model).animations.Walk
    )
  })
  it('invalidates clip caches and fingerprints on reload without changing existing instances', async () => {
    let distance = 2
    let animationRequestCount = 0

    const loader = new ModelLoader(async (url) => {
      if (url.endsWith('.animation.json')) {
        animationRequestCount += 1

        return createAnimation(distance)
      }

      return createModel()
    })
    const original = await loader.load('https://fixture.test/models/character.model.json')

    distance = 4

    loader.beginReload()

    const updated = await loader.load('https://fixture.test/models/character.model.json')

    expect(animationRequestCount).to.equal(2)
    expect(loader.findAssetIdentity(original)!.fingerprint).not.to.equal(loader.findAssetIdentity(updated)!.fingerprint)
    expect(original.animations.Walk.keyframes.Root.translation[1].value[0]).to.equal(2)
    expect(updated.animations.Walk.keyframes.Root.translation[1].value[0]).to.equal(4)
  })
  it('retries failed and malformed clip requests without requiring a reload', async () => {
    let animationRequestCount = 0

    const loader = new ModelLoader(async (url) => {
      if (!url.endsWith('.animation.json')) {
        return createModel()
      }

      animationRequestCount += 1

      if (animationRequestCount === 1) {
        throw new Error('missing document')
      }

      if (animationRequestCount === 2) {
        return { ...createAnimation(), schemaVersion: 2 }
      }

      return createAnimation()
    })
    const url = 'https://fixture.test/models/character.model.json'

    await expectFailure(
      loader.load(url),
      "Model 'https://fixture.test/models/character.model.json', animation 'Walk' ('https://fixture.test/animations/walk.animation.json'): missing document"
    )

    await expectFailure(loader.load(url), 'schemaVersion 1')

    const model = await loader.load(url)

    expect(model.animations.Walk.duration).to.equal(1)
    expect(animationRequestCount).to.equal(3)
  })
  it('keeps a pending older model load from populating the new reload cache', async () => {
    let releaseModel: () => void = () => {}
    let modelRequestCount = 0
    let animationRequestCount = 0

    const pendingModel = new Promise<void>((resolve) => {
      releaseModel = resolve
    })
    const loader = new ModelLoader(async (url) => {
      if (url.endsWith('.animation.json')) {
        animationRequestCount += 1

        return createAnimation()
      }

      modelRequestCount += 1

      if (modelRequestCount === 1) {
        await pendingModel
      }

      return createModel()
    })
    const url = 'https://fixture.test/models/character.model.json'
    const oldLoad = loader.load(url)

    loader.beginReload()

    await loader.load(url)
    releaseModel()

    await oldLoad

    await loader.load(url)
    expect(modelRequestCount).to.equal(2)
    expect(animationRequestCount).to.equal(2)
  })
  it('rejects embedded clips at both loading and direct deserialization boundaries', async () => {
    const definition = { ...createModel(), animations: { Walk: createAnimation() } }
    const loader = new ModelLoader(async () => definition)

    await expectFailure(
      loader.load('https://fixture.test/models/character.model.json'),
      'embedded clips are unsupported'
    )

    await expectFailure(Model.deserialize(definition as any), 'embedded clips are unsupported')

    await expectFailure(Model.deserialize(createModel()), 'Unresolved animation reference')
  })

  for (const [label, corrupt] of Object.entries({
    type: (clip: any) => {
      clip.type = 'animation'
    },

    version: (clip: any) => {
      clip.schemaVersion = 2
    },

    bones: (clip: any) => {
      clip.keyframes = {}
    },

    channel: (clip: any) => {
      clip.keyframes.Root.scale = []
    },

    value: (clip: any) => {
      clip.keyframes.Root.translation[0].value = [NaN, 0, 0]
    },

    time: (clip: any) => {
      clip.keyframes.Root.translation[1].time = 0
    },

    duration: (clip: any) => {
      clip.duration = -1
    },

    skeleton: (clip: any) => {
      clip.keyframes.Other = clip.keyframes.Root
      delete clip.keyframes.Root
    }
  })) {
    it(`rejects invalid ${label} with model, clip and document context`, async () => {
      const clip = createAnimation()

      corrupt(clip)

      const loader = new ModelLoader(async (url) => (url.endsWith('.animation.json') ? clip : createModel()))
      const operation = loader.load('https://fixture.test/models/character.model.json')

      await expectFailure(operation, 'character.model.json')

      await expectFailure(operation, 'Walk')

      await expectFailure(operation, 'walk.animation.json')
    })
  }

  it('preserves models with no animations or an explicitly empty reference map', async () => {
    const loader = new ModelLoader()
    const absent = await loader.loadData({ type: 'model', meshes: {} }, 'https://fixture.test/static.model.json')
    const empty = await loader.loadData(
      { type: 'model', meshes: {}, animations: {} },
      'https://fixture.test/static.model.json'
    )

    expect(absent.animations).to.deep.equal({})
    expect(absent.serialize()).not.to.have.property('animations')
    expect(empty.serialize().animations).to.deep.equal({})
  })
})
