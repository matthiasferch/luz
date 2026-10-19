import { expect } from 'chai'
import { readFile } from 'fs/promises'
import { pathToFileURL } from 'url'
import { Transform } from '@luz/core'
import type { Model } from '@luz/graphics'
import { EntityLoader, ModelLoader, isModel } from '@luz/graphics'
import { Vector3, Vector4 } from '@luz/math'

const manifestPath = process.env.LUZ_BLENDER_SKELETAL_FIXTURE

if (manifestPath) {
  describe('Blender skeletal animation export/reload', function () {
    this.timeout(120000)
    it('matches evaluated palettes and skinned vertices at every frame and creates independent entity instances', async () => {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
      const loadJson = async (url: string) => JSON.parse(await readFile(new URL(url), 'utf8'))
      const models = new ModelLoader(loadJson, async (url) => {
        const data = await readFile(new URL(url))

        return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      })
      const loader = new EntityLoader(models, loadJson)
      const entityUrl = pathToFileURL(manifest.entity).href
      const firstEntity = await loader.loadEntity(entityUrl)
      const secondEntity = await loader.loadEntity(entityUrl)
      const collectModels = (entity: typeof firstEntity): Model[] => [
        ...Object.values(entity.components).filter(isModel),
        ...Object.values(entity.children).flatMap(collectModels)
      ]
      const firstModels = collectModels(firstEntity)
      const secondModels = collectModels(secondEntity)

      expect(firstModels.length).to.equal(2)
      expect(firstModels[0]).not.to.equal(secondModels[0])
      firstModels[0].update(new Transform(), 0.25)
      expect(firstModels[0].animations.Timeline.time).to.equal(0.25)
      expect(secondModels[0].animations.Timeline.time).to.equal(0)

      const scene = await loader.loadScene(pathToFileURL(manifest.scene).href)

      scene.fixedTimeStep = 1 / manifest.sampleRate

      for (const entity of scene.collectEntities()) {
        entity.animationMixer?.play('Timeline')
      }

      for (const record of manifest.models) {
        const model = await models.load(pathToFileURL(record.path).href)

        expect(Object.values(model.armatures)[0].bones.length).to.equal(65)
        expect(Object.keys(model.animations)).to.deep.equal(['Timeline'])
        expect(model.boneMatrices!.length).to.equal(65 * 16)

        for (let frame = 0; frame < record.samples.length; frame++) {
          model.update(new Transform(), frame === 0 ? 0 : 1 / manifest.sampleRate)

          const sample = record.samples[frame]

          sample.bones.flat().forEach((value: number, index: number) => {
            expect(model.boneMatrices![index], `frame ${frame}, bone matrix ${index}`).to.be.closeTo(value, 0.0002)
          })

          for (const [name, mesh] of Object.entries(model.meshes)) {
            const geometry = mesh.resolvedGeometry!
            const stride = geometry.descriptor.byteStride / 4

            for (const weight of mesh.weights) {
              const offset = weight.vertex * stride
              const position = new Vector4([...geometry.vertices.subarray(offset, offset + 3), 1])
              const result = new Vector3()

              if (weight.weights.every((value) => value === 0)) {
                result.set([position[0], position[1], position[2]])
              } else {
                weight.indices.forEach((boneIndex, index) => {
                  const matrix = model.boneMatrices!.subarray(boneIndex * 16, boneIndex * 16 + 16)
                  const transformed = Array.from(
                    { length: 3 },
                    (_, axis) =>
                      matrix[axis] * position[0] +
                      matrix[axis + 4] * position[1] +
                      matrix[axis + 8] * position[2] +
                      matrix[axis + 12]
                  )

                  for (let axis = 0; axis < 3; axis++) {
                    result[axis] += transformed[axis] * weight.weights[index]
                  }
                })
              }

              sample.vertices[name][weight.vertex].forEach((value: number, axis: number) => {
                expect(result[axis], `${record.object} frame ${frame}, ${name} vertex ${weight.vertex}`).to.be.closeTo(
                  value,
                  0.0004
                )
              })
            }
          }
        }
      }

      for (let frame = 0; frame < manifest.models[0].samples.length; frame++) {
        scene.update(frame === 0 ? 0 : 1 / manifest.sampleRate)

        for (const record of manifest.models) {
          const entity = scene.findEntity(record.entityPath)

          expect(entity, record.entityPath).not.to.equal(undefined)

          if (entity) {
            record.samples[frame].world.forEach((value: number, index: number) =>
              expect(entity.modelMatrix[index]).to.be.closeTo(value, 0.0002)
            )
          }
        }
      }
    })
  })
}
