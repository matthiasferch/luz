import { expect } from 'chai'
import { rejects } from 'node:assert/strict'
import { EntityLoader, ModelLoader } from '@luz/graphics'
import type { JsonReader } from '@luz/graphics'
import { Entity } from '@luz/core'
import { Scene } from '@luz/scene'
import type { SceneDefinition, SkeletalClip, SkeletalDocument, TransformTracks } from '@luz/formats'

describe('Unknown document readers', () => {
  it('requires consumers to decode reader results', async () => {
    const readJson: JsonReader = async () => ({ type: 'model', meshes: {} })
    const value = await readJson('model.json')

    // @ts-expect-error A JSON reader does not promise a model document.
    const definition: SceneDefinition = value

    expect(definition).to.deep.equal({ type: 'model', meshes: {} })
    expect((await new ModelLoader(readJson).load('model.json')).type).to.equal('model')
  })
  it('rejects malformed model and entity records at their document boundaries', async () => {
    for (const value of [null, [], true, 7, 'model']) {
      const models = new ModelLoader(async () => value)
      const entities = new EntityLoader(models, async () => value)

      await rejects(models.load('https://fixture.test/bad.model.json'), /bad\.model\.json.*object definition/)

      await rejects(entities.loadEntity('https://fixture.test/bad.entity.json'), /bad\.entity\.json.*object definition/)

      await rejects(entities.loadScene('https://fixture.test/bad.scene.json'), /bad\.scene\.json.*object definition/)
    }

    const loader = new EntityLoader()

    for (const entities of [[], null, 'invalid']) {
      await rejects(loader.loadSceneData({ entities }, 'scene.json'), /Scene entities/)
    }

    for (const components of [[], null, 'invalid']) {
      await rejects(Entity.deserialize({ components }), /Entity components/)
    }

    for (const meshes of [[], null, 'invalid']) {
      await rejects(new ModelLoader().loadData({ type: 'model', meshes }, 'model.json'), /Model meshes/)
    }
  })
  it('defaults environment rotation without changing the input and rejects invalid resource references', async () => {
    const definition: SceneDefinition = {
      entities: {},
      environment: { sky: 'sky.ktx', radiance: 'radiance.ktx', irradiance: 'irradiance.ktx' }
    }
    const scene = await Scene.deserialize(definition)

    expect(scene.environment!.rotation).to.equal(0)
    expect(definition.environment).not.to.have.property('rotation')
    expect(scene.environment).not.to.equal(definition.environment)

    for (const environment of [
      null,
      [],
      {},
      { ...definition.environment, sky: 1 },
      { ...definition.environment, rotation: NaN }
    ]) {
      await rejects(Scene.deserialize({ entities: {}, environment }), /environment/)
    }
  })
  it('keeps skeletal metadata in the document envelope and gives tracks fixed dimensions', () => {
    const clip: SkeletalClip = {
      duration: 1,
      keyframes: { Root: { translation: [], rotation: [], scale: [] } }
    }
    const document: SkeletalDocument = { ...clip, type: 'skeletalAnimation', schemaVersion: 1 }

    // @ts-expect-error Clip data has no version field.
    clip.schemaVersion = 1

    const tracks: TransformTracks = {
      translation: [
        // @ts-expect-error Translation keys require three coordinates.
        { time: 0, value: [1, 2] }
      ]
    }

    expect(document.schemaVersion).to.equal(1)
    expect(tracks.translation).to.have.length(1)
  })
})
