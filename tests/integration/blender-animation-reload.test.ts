import { expect } from 'chai'
import { readFile } from 'fs/promises'
import { pathToFileURL } from 'url'
import { Scene } from '@luz/scene'
import { EntityLoader, ModelLoader } from '@luz/graphics'

const manifestPath = process.env.LUZ_BLENDER_ANIMATION_FIXTURE

if (manifestPath) {
  describe('Blender transform animation export/reload', () => {
    it('reproduces evaluated scene and normalized asset matrices at every sample, including nested instances', async () => {
      const manifest = JSON.parse(await readFile(manifestPath, 'utf8'))
      const loadJson = async (url: string) => JSON.parse(await readFile(new URL(url), 'utf8'))
      const loader = new EntityLoader(
        new ModelLoader(loadJson, async (url) => {
          const data = await readFile(new URL(url))

          return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
        }),
        loadJson
      )
      const scene = await loader.loadScene(pathToFileURL(manifest.scene).href)

      scene.gravity.reset()

      scene.fixedTimeStep = 1 / manifest.sampleRate

      const entityScene = new Scene()

      entityScene.entities.Assembly = await loader.loadEntity(pathToFileURL(manifest.entity).href)
      entityScene.fixedTimeStep = scene.fixedTimeStep

      entityScene.captureSimulationState()

      for (const target of [scene, entityScene]) {
        for (const entity of target.collectEntities()) {
          const mixer = entity.animationMixer

          if (mixer) {
            mixer.setMix(Object.fromEntries(Object.keys(mixer.animations).map((name) => [name, 1])), {
              transitionDuration: 0,
              isRestartEnabled: true
            })
          }
        }
      }

      for (let frame = 0; frame < manifest.expected.length; frame++) {
        for (const [kind, target] of [
          ['scene', scene],
          ['entity', entityScene]
        ] as const) {
          target.update(frame === 0 ? 0 : target.fixedTimeStep)

          for (const [path, matrix] of Object.entries(manifest.expected[frame][kind]) as [string, number[]][]) {
            const entity = target.findEntity(path)

            expect(entity, path).not.to.equal(undefined)
            matrix.forEach((value, index) =>
              expect(entity!.modelMatrix[index], `${kind} frame ${frame + 1} ${path}[${index}]`).to.be.closeTo(
                value,
                8e-5
              )
            )
          }
        }
      }

      for (const target of [scene, entityScene]) {
        target.resetSimulation()

        for (const entity of target.collectEntities()) {
          for (const entry of Object.values(entity.animationMixer?.animations ?? {})) {
            expect(entry.time).to.equal(0)
          }
        }
      }
    })
  })
}
