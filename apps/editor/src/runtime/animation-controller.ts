import type { PlaybackMode } from '@luz/formats'
import type { Scene } from '@luz/scene'
import type { Entity, PlaybackController } from '@luz/core'
import { isModel } from '@luz/graphics'
import type { AnimationAction, AnimationGroup } from '../editor/editor-api'

interface PlaybackGroup {
  label: string
  controllers: PlaybackController[]
  clips: string[]
  target?: Entity
  entities: Entity[]
}

export class AnimationController {
  private readonly groups = new Map<string, PlaybackGroup>()

  constructor(private readonly scene: Scene) {
    for (const [rootName, root] of Object.entries(scene.entities)) {
      for (const [path, entity] of root.iterateEntries(rootName.replace(/~/g, '~0').replace(/\//g, '~1'))) {
        const mixer = entity.animationMixer

        if (mixer && Object.keys(mixer.animations).length) {
          const name = path.split('/').pop()!.replace(/~1/g, '/').replace(/~0/g, '~')

          this.groups.set(JSON.stringify([path, 'object']), {
            label: name,
            controllers: [mixer],
            target: entity,
            entities: [entity],
            clips: Object.keys(mixer.animations)
          })
        }

        for (const component of Object.values(entity.components)) {
          if (!isModel(component) || Object.keys(component.animations).length === 0) {
            continue
          }

          const rigName = Object.keys(component.armatures)[0]
          const key = JSON.stringify([rootName, rigName])
          const group = this.groups.get(key) ?? {
            label: `${rootName} (${rigName})`,
            controllers: [],
            entities: [entity],
            clips: Object.keys(component.animations)
          }

          group.controllers.push(component.animationMixer)

          group.clips = group.clips.filter((name) => Object.hasOwn(component.animations, name))

          this.groups.set(key, group)
        }
      }
    }

    const duplicateLabels = new Set(
      Array.from(this.groups.values())
        .filter((group) => Array.from(this.groups.values()).filter((entry) => entry.label === group.label).length > 1)
        .map((group) => group.label)
    )

    for (const [key, group] of this.groups) {
      if (group.target && duplicateLabels.has(group.label)) {
        group.label = JSON.parse(key)[0]
          .split('/')
          .map((name: string) => name.replace(/~1/g, '/').replace(/~0/g, '~'))
          .join(' / ')
      }
    }
  }

  collectGroups(): AnimationGroup[] {
    return Array.from(this.groups, ([key, group]) => {
      const controller = group.controllers[0]

      return {
        key,
        label: group.label,
        isPaused: controller.isPaused,
        speed: controller.speed,
        clips: group.clips.map((name) => {
          const entry = controller.animations[name]

          return {
            name,
            duration: entry.duration,
            playback: entry.playbackMode,
            weight: entry.weight,
            time: entry.time,
            isPlaying: !controller.isPaused && entry.state === 'playing' && entry.weight > 0
          }
        })
      }
    }).filter((group) => group.clips.length > 0)
  }

  getTime(key: string, name: string): number {
    const group = this.groups.get(key)

    return group?.clips.includes(name) ? group.controllers[0].animations[name].time : 0
  }

  control(key: string, action: AnimationAction): void {
    const group = this.groups.get(key)

    if (!group || !['pause', 'resume', 'stop'].includes(action)) {
      throw new Error('Invalid animation group or transport action')
    }

    for (const controller of group.controllers) {
      controller[action]()
    }

    if (group.target && action === 'stop') {
      this.scene.previewAnimations(group.entities)
    }
  }

  seek(key: string, progress: number): void {
    const group = this.groups.get(key)

    if (!group || !Number.isFinite(progress) || progress < 0 || progress > 1) {
      throw new Error('Invalid animation group or progress')
    }

    for (const controller of group.controllers) {
      controller.seekProgress(progress)
    }

    if (group.target) {
      this.scene.previewAnimations(group.entities)
    }
  }

  setSpeed(key: string, speed: number): void {
    const group = this.groups.get(key)

    if (!group || !Number.isFinite(speed) || speed <= 0) {
      throw new Error('Invalid animation group or speed')
    }

    for (const controller of group.controllers) {
      controller.setSpeed(speed)
    }
  }

  setPlayback(key: string, name: string, mode: PlaybackMode): void {
    const group = this.groups.get(key)

    if (!group || !group.clips.includes(name) || (mode !== 'loop' && mode !== 'once')) {
      throw new Error('Invalid animation group, name, or playback mode')
    }

    for (const controller of group.controllers) {
      controller.setPlaybackMode(name, mode)
    }
  }

  setMix(key: string, weights: Record<string, number>, transitionDuration: number, isRestartEnabled = false): void {
    const group = this.groups.get(key)

    if (
      !group ||
      !Number.isFinite(transitionDuration) ||
      transitionDuration < 0 ||
      Object.entries(weights).some(
        ([name, weight]) => !group.clips.includes(name) || !Number.isFinite(weight) || weight < 0 || weight > 1
      )
    ) {
      throw new Error('Invalid animation group, name, weight, or transition duration')
    }

    for (const controller of group.controllers) {
      controller.setMix(weights, { transitionDuration, isRestartEnabled })
    }

    if (group.target) {
      this.scene.previewAnimations(group.entities)
    }
  }
}
