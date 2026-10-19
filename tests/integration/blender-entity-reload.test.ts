import { expect } from 'chai'
import { readFile } from 'fs/promises'
import { pathToFileURL } from 'url'
import { EntityLoader, ModelCompiler, ModelLoader } from '@luz/graphics'
import type { Light } from '@luz/core'
import type { Model } from '@luz/graphics'
import { isModel } from '@luz/graphics'

// Set this to the manifest produced by integrations/blender/tests/entity_hierarchy_fixture.py.
const manifestPath = process.env.LUZ_BLENDER_FIXTURE

if (manifestPath) {
  describe('Blender entity export/reload', () => {
    it('loads both workflows, matches Blender world matrices and shares compiled geometry', async () => {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
      const loadJson = async (url: string) => JSON.parse(await readFile(new URL(url), 'utf8'))
      const models = new ModelLoader(loadJson, async (url) => {
        const buffer = await readFile(new URL(url))

        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
      })
      const loader = new EntityLoader(models, loadJson)
      const scene = await loader.loadScene(pathToFileURL(manifest.scene).href)

      scene.update(0, false)

      for (const [path, expected] of Object.entries(manifest.expected) as [string, number[]][]) {
        const entity = scene.findEntity(path)

        expect(entity, path).not.to.equal(undefined)
        expected.forEach((value, index) =>
          expect(entity!.modelMatrix[index], `${path}[${index}]`).to.be.closeTo(value, 3e-5)
        )
      }

      const firstEntity = scene.findEntity('InstanceA/Nested/SourceRoot/SourceMesh')!
      const secondEntity = scene.findEntity('InstanceB/Nested/SourceRoot/SourceMesh')!
      const firstModel = firstEntity.components.SourceMesh as Model
      const secondModel = secondEntity.components.SourceMesh as Model

      expect(firstModel.type).to.equal('model')
      expect(scene.findEntity('Assembly/View')!.components['Main Optics'].type).to.equal('camera')
      expect(scene.entities.BodyRoot.components.Body.type).to.equal('model')
      expect(scene.entities.BodyRoot.components['Body.001'].type).to.equal('body')
      expect(scene.findEntity('Assembly/Part')!.components['Reflector.001'].type).to.equal('reflector')

      const material = { isOpaque: true }

      let uploads = 0

      const compiler = new ModelCompiler(
        { defaultMaterial: material } as any,
        { compile: async () => material } as any,
        {
          compile: (mesh: unknown) => {
            uploads++

            return { material, mesh }
          }
        } as any
      )

      for (const entity of scene.collectEntities()) {
        for (const component of Object.values(entity.components).filter(isModel)) {
          await compiler.compile(component, models.findAssetIdentity(component))
        }
      }

      expect(compiler.requireCompiledModel(firstModel)).not.to.equal(compiler.requireCompiledModel(secondModel))
      expect(compiler.requireCompiledModel(firstModel).primitives).to.equal(
        compiler.requireCompiledModel(secondModel).primitives
      )

      const before = uploads
      const asset = await loader.loadEntity(pathToFileURL(manifest.entity).href)

      for (const [, entity] of asset.iterateEntries()) {
        for (const component of Object.values(entity.components).filter(isModel)) {
          await compiler.compile(component, models.findAssetIdentity(component))
        }
      }

      expect(uploads).to.equal(before)
      expect([...asset.translation]).to.deep.equal([0, 0, 0])
      expect([...asset.rotation]).to.deep.equal([0, 0, 0, 1])
      ;[2, 4, 3].forEach((value, index) => expect(asset.scale[index]).to.be.closeTo(value, 1e-5))

      const light = scene.findEntity('Assembly/Part/Marker/Lamp')!.components['Warm Key'] as Light
      const sun = scene.findEntity('Assembly/Sun')!.components.Sun as Light
      const exportedSun = asset.children.Sun.components.Sun as Light
      const oldLightX = light.translation.x

      const point = scene.findEntity('Assembly/Point')!.components.Point as Light

      expect(point.lightType).to.equal('point')
      expect(point.range).to.equal(12)
      expect(point.shadowCameras).to.have.length(6)
      expect((asset.children.Point.components.Point as Light).lightType).to.equal('point')
      expect(light.lightType).to.equal('spot')
      expect(sun.lightType).to.equal('directional')
      expect(Array.from(sun.shadowSize)).to.deep.equal([24, 16])
      expect(sun.shadowCamera.orthographicHeight).to.equal(16)
      expect(exportedSun.lightType).to.equal('directional')
      expect(Array.from(exportedSun.shadowSize)).to.deep.equal([24, 16])

      scene.entities.Assembly.translation.x += 5

      scene.update(0, false)
      expect(light.translation.x).to.be.closeTo(oldLightX + 5, 1e-5)
    })
  })
}
