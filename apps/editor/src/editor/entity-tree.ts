import { isCamera, isLight } from '@luz/core'
import { isBody } from '@luz/physics'
import { isModel } from '@luz/graphics'
import type { Camera, Entity, Light } from '@luz/core'
import type { Scene } from '@luz/scene'
import type { EditorComponent, EditorEntity, ModelContent } from './editor-api'
import type { Model } from '@luz/graphics'

const describeModelContents = (model: Model): ModelContent[] => [
  ...Object.entries(model.armatures).map(([name, armature]): ModelContent => {
    const nodes = new Map<string, ModelContent>(
      armature.bones.map((bone) => [bone.name, { name: bone.name, type: 'bone', children: [] }])
    )
    const children: ModelContent[] = []

    for (const bone of armature.bones) {
      const node = nodes.get(bone.name)!
      const parent = nodes.get(bone.parent)

      if (parent) {
        parent.children!.push(node)
      } else {
        children.push(node)
      }
    }

    return {
      name,
      type: 'armature',
      boneCount: armature.bones.length,
      children
    }
  }),
  ...Object.keys(model.animations).map((name): ModelContent => ({
    name,
    type: 'animation'
  }))
]

// Blender light colors are linear; CSS swatches use sRGB.
const convertColorToHex = (values: Iterable<number>): string =>
  '#' +
  Array.from(values, (value) => {
    const linear = Math.max(0, Math.min(1, value))
    const srgb = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055

    return Math.round(srgb * 255)
      .toString(16)
      .padStart(2, '0')
  }).join('')

export function describeEntityTree(
  scene: Scene,
  isActiveCamera?: Camera,
  lightKeys: ReadonlyMap<Light, string> = new Map()
): EditorEntity[] {
  const roots: EditorEntity[] = []
  const nodes = new Map<Entity, EditorEntity>()

  for (const [path, entity] of scene.iterateEntries()) {
    const node: EditorEntity = {
      key: path,
      label: path.split('/').pop()!.replace(/~1/g, '/').replace(/~0/g, '~'),
      components: Object.entries(entity.components).map(([name, component]) => {
        const description: EditorComponent = { name, type: component.type }

        if (isModel(component) || isLight(component)) {
          description.isVisible = component.isVisible
        }

        if (isModel(component)) {
          const contents = describeModelContents(component)

          if (contents.length > 0) {
            description.contents = contents
          }
        }

        if (isBody(component)) {
          description.motionMode = component.motionType
          description.collisionShape = component.volume?.type ?? 'none'
        }

        if (isCamera(component)) {
          description.isActiveCamera = component === isActiveCamera
        }

        if (isLight(component)) {
          description.lightType = component.lightType
          description.color = convertColorToHex(component.color)
          description.lightKey = lightKeys.get(component)
        }

        return description
      }),
      children: []
    }

    nodes.set(entity, node)

    const parent = entity.parent && nodes.get(entity.parent)

    if (parent) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return roots
}
