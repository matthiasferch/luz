import { expect } from 'chai'
import { Camera, Entity, Light, Reflector } from '@luz/core'
import { Body } from '@luz/physics'
import { Scene } from '@luz/scene'
import type { Model } from '@luz/graphics'
import { EntityLoader, ModelLoader } from '@luz/graphics'
import { Matrix4, Quaternion, Vector3, Vector4 } from '@luz/math'

const close = (firstValues: ArrayLike<number>, secondValues: ArrayLike<number>, tolerance = 1e-5) => {
  const actual = Array.from(firstValues)
  const expected = Array.from(secondValues)

  expect(actual.length).to.equal(expected.length)

  for (let index = 0; index < actual.length; index++) {
    expect(actual[index]).to.be.closeTo(expected[index], tolerance)
  }
}

const rejects = async (promise: Promise<unknown>, pattern: RegExp) => {
  let error: unknown

  try {
    await promise
  } catch (caught) {
    error = caught
  }

  expect(error).to.be.instanceOf(Error)
  expect((error as Error).message).to.match(pattern)
}

describe('Entity hierarchies', () => {
  it('composes exact matrices, traverses parent-first and serializes only local poses', async () => {
    const root = new Entity(),
      child = new Entity(),
      grandchild = new Entity()

    root.scale.set([2, 3, 4])
    root.translation.set([10, 20, 30])
    child.rotation.set(Quaternion.setFromAxisAngle(Vector3.createForward(), 0.6))
    child.translation.set([1, 2, 3])
    grandchild.translation.set([4, 0, 0])

    root.children['part/a'] = child
    child.children.tip = grandchild

    const scene = new Scene()

    scene.entities.root = root

    scene.update(0, false)

    const expected = Matrix4.multiply(
      Matrix4.createTransform(root.translation, root.rotation, root.scale),
      Matrix4.createTransform(child.translation, child.rotation, child.scale)
    )

    close(child.modelMatrix, expected)
    close(grandchild.worldTranslation, expected.transformVector3(grandchild.translation))
    expect(Array.from(scene.iterateEntries(), ([path]) => path)).to.deep.equal([
      'root',
      'root/part~1a',
      'root/part~1a/tip'
    ])
    expect(scene.findEntity('root/part~1a')).to.equal(child)
    expect(scene.findEntity('root')).to.equal(root)
    expect(child.parent).to.equal(root)

    const data = scene.serialize() as any

    expect(JSON.stringify(data)).not.to.contain('parent')
    expect(data.entities.root.children['part/a'].translation).to.deep.equal([1, 2, 3])

    const reloaded = await Scene.deserialize(data)

    close(reloaded.findEntity('root/part~1a')!.modelMatrix, expected)

    const before = grandchild.worldTranslation.clone()

    root.translation.x += 7

    scene.update(0, false)
    close(grandchild.worldTranslation, before.add(new Vector3([7, 0, 0])))
    close(child.normalMatrix, expected.toMatrix3().invert().transpose())
  })
  it('moves cameras, lights and reflectors with their parent, preserving the camera basis', () => {
    const scene = new Scene(),
      root = new Entity(),
      child = new Entity()

    root.children.visual = child

    root.scale.set([2, 3, 4])
    child.translation.set([1, 2, 3])
    child.rotation.set(Quaternion.setFromAxisAngle(Vector3.createUp(), 0.4))

    const camera = new Camera(),
      light = new Light(),
      reflector = new Reflector()

    child.components.camera = camera
    child.components.light = light
    child.components.reflector = reflector
    scene.entities.root = root

    scene.update(0, false)
    root.translation.set([8, 9, 10])
    scene.update(0, false)
    close(light.translation, child.worldTranslation)

    const worldNormal = child.normalMatrix.transform(reflector.normal).normalize()

    close(
      reflector.worldPlane,
      new Vector4([...worldNormal, -Vector3.calculateDotProduct(worldNormal, child.worldTranslation)])
    )

    const correction = Matrix4.createTransform(
      Vector3.createZero(),
      Quaternion.setFromAxisAngle(Vector3.createRight(), -Math.PI / 2)
    )
    const cameraWorld = Matrix4.multiply(child.modelMatrix, correction)

    close(camera.viewMatrix, cameraWorld.clone().invert())

    for (const vertex of camera.frustum.calculateVertices()) {
      const clip = Matrix4.multiply(camera.projectionMatrix, camera.viewMatrix).transform(new Vector4([...vertex, 1]))

      clip.scale(1 / clip.w)
      expect(Math.abs(clip.x)).to.be.closeTo(1, 1e-4)
      expect(Math.abs(clip.y)).to.be.closeTo(1, 1e-4)
      expect(Math.abs(clip.z)).to.be.closeTo(1, 1e-4)
    }

    expect(scene.selectCamera()).to.deep.equal({ entity: child, camera })

    const secondEntity = new Entity()

    secondEntity.components.camera = new Camera()
    scene.entities.other = secondEntity

    expect(() => scene.selectCamera()).to.throw('found 2 cameras')

    scene.entities.Camera = secondEntity
    delete scene.entities.other
    expect(scene.selectCamera().entity).to.equal(secondEntity)
  })
  it('runs descendant components once and carries them through root physics corrections', async () => {
    const scene = await Scene.deserialize({
      entities: {
        root: {
          components: { Body: { type: 'body', motionType: 'dynamic', volume: { type: 'sphere', radius: 1 } } },
          children: {
            light: {
              translation: [0, 2, 0],
              components: { light: { type: 'light', lightType: 'spot', coneAngle: 90, coneFalloff: 10 } }
            }
          }
        }
      }
    } as any)
    const root = scene.entities.root,
      child = root.children.light
    const light = child.components.light as Light

    let calls = 0

    const update = light.update.bind(light)

    light.update = (transform, deltaTime) => {
      calls++

      update(transform, deltaTime)
    }

    scene.update(1 / 30)
    expect(calls).to.equal(1)
    expect(root.translation.y).to.be.lessThan(0)
    close(light.translation, Vector3.add(root.translation, child.translation))
    scene.resetSimulation()
    close(child.worldTranslation, new Vector3([0, 2, 0]))
  })
  it('rejects nested bodies, attached polygons and singular local poses', async () => {
    await rejects(
      Scene.deserialize({
        entities: {
          root: {
            children: {
              bad: {
                components: { Body: { type: 'body', motionType: 'dynamic' } }
              }
            }
          }
        }
      } as any),
      /nested physics body/
    )

    await rejects(Entity.deserialize({ colliders: {} } as any), /Attached polygon/)

    await rejects(Entity.deserialize({ components: { collision: { type: 'polygon' } } } as any), /Attached polygon/)

    await rejects(Entity.deserialize({ scale: [1, 0, 1] } as any), /singular/)
  })
})
describe('Entity assets', () => {
  const assetUrl = 'https://test/assets/entities/chair.entity.json'
  const modelUrl = 'https://test/assets/models/chair.model.json'
  const createFixture = (documents: Record<string, any>) => {
    const loads: string[] = []
    const fetch = async (url: string) => {
      loads.push(url)

      if (!(url in documents)) {
        throw new Error(`Missing fixture ${url}`)
      }

      return documents[url]
    }
    const models = new ModelLoader(fetch)

    return { loader: new EntityLoader(models, fetch), models, loads }
  }

  it('shares model sources across placements without sharing entities, components or animation state', async () => {
    const { loader, models, loads } = createFixture({
      [assetUrl]: {
        components: {
          Model: '../models/chair.model.json',
          Light: { type: 'light', lightType: 'spot', coneAngle: 90, coneFalloff: 10 }
        },
        children: { empty: {} }
      },
      [modelUrl]: { type: 'model', meshes: {} }
    })
    const scene = await loader.loadSceneData(
      {
        entities: {
          one: { entity: '../entities/chair.entity.json', translation: [1, 2, 3] },
          two: { entity: '../entities/chair.entity.json', translation: [4, 5, 6] }
        }
      },
      'https://test/assets/scenes/room.scene.json'
    )
    const { one, two } = scene.entities

    expect(one).not.to.equal(two)
    expect(one.children.empty).not.to.equal(two.children.empty)
    expect(one.components.Model).not.to.equal(two.components.Model)
    expect(one.components.Light).not.to.equal(two.components.Light)
    expect(models.findAssetIdentity(one.components.Model as Model)).to.deep.equal(
      models.findAssetIdentity(two.components.Model as Model)
    )
    expect(loads.filter((url) => url === assetUrl)).to.have.length(1)
    expect(loads.filter((url) => url === modelUrl)).to.have.length(1)

    one.translation.x = 99
    ;(one.components.Light as Light).intensity = 100

    expect(two.translation.x).to.equal(4)
    expect((two.components.Light as Light).intensity).to.equal(1)
    expect(one.children.empty.parent).to.equal(one)
  })
  it('reports recursive chains and rejects component and baked body-scale overrides', async () => {
    const body = { scale: [2, 3, 4], components: { Body: { type: 'body', motionType: 'dynamic' } } }
    const { loader } = createFixture({ [assetUrl]: body })
    const createReference = (data: any) =>
      loader.loadEntityData({ entity: assetUrl, ...data }, 'https://test/placement.entity.json')

    await rejects(createReference({ scale: [1, 1, 1] }), /Cannot override the scale/)

    await rejects(createReference({ components: {} }), /cannot override components/)
    expect((await createReference({ scale: [2, 3, 4] })).components.Body).to.be.instanceOf(Body)

    const recursive = createFixture({ [assetUrl]: { children: { isLooping: { entity: './chair.entity.json' } } } })

    await rejects(
      recursive.loader.loadEntity(assetUrl),
      /Recursive entity reference:.*chair.entity.json -> .*chair.entity.json/
    )
  })
  it('resolves unversioned model references relative to their containing document', async () => {
    const url = 'https://test/assets/models/mesh.model.json'
    const { loader, loads } = createFixture({ [url]: { type: 'model', meshes: {} } })
    const scene = await loader.loadSceneData(
      { entities: { mesh: { translation: [1, 2, 3], components: { Model: '../models/mesh.model.json' } } } },
      'https://test/assets/scenes/room.scene.json'
    )

    expect(loads).to.deep.equal([url])
    close(scene.entities.mesh.worldTranslation, new Vector3([1, 2, 3]))
    scene.update(0, false)
  })
  it('rejects bare entity references and implicit deserialization fetches', async () => {
    const { loader, loads } = createFixture({})

    await rejects(
      loader.loadSceneData({ entities: { bad: './chair.entity.json' } }, 'https://test/room.scene.json'),
      /Invalid entity/
    )

    await rejects(Scene.deserialize({ entities: { bad: './chair.entity.json' } } as any), /Unresolved asset reference/)

    await rejects(
      Entity.deserialize({ components: { Model: './chair.model.json' } } as any),
      /Unresolved asset reference/
    )
    expect(loads).to.have.length(0)
  })
})
