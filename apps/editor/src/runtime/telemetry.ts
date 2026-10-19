import type { Scene } from '@luz/scene'
import type { RenderBackend } from '@luz/graphics'
import type { KTXContainer } from '@luz/formats'

import type { EditorTelemetry } from '../editor/editor-api'

export class RuntimeTelemetry {
  private frameCount = 0
  private frameDuration = 0
  private framesPerSecond: number | null = null
  private culling: EditorTelemetry['culling'] = {
    visibleBodyCount: null,
    culledBodyCount: null,
    visibleLightCount: null,
    culledLightCount: null
  }

  updateFrame(deltaTime: number): void {
    this.frameCount += 1
    this.frameDuration += deltaTime

    if (this.frameDuration < 0.5) {
      return
    }

    this.framesPerSecond = Math.round(this.frameCount / this.frameDuration)
    this.frameCount = 0
    this.frameDuration = 0
  }

  updateCulling(
    visibleBodyCount: number,
    culledBodyCount: number,
    visibleLightCount: number,
    culledLightCount: number
  ): void {
    this.culling = { visibleBodyCount, culledBodyCount, visibleLightCount, culledLightCount }
  }

  capture(options: {
    scene?: Scene
    backend: RenderBackend
    renderedReflectorCount: number
    reflectorCount: number
    diffuseEnvironment?: KTXContainer
    specularEnvironment?: KTXContainer
    usesCubeEnvironment: boolean
  }): EditorTelemetry {
    const broadphase = options.scene?.collisionStatistics
    const statistics = options.backend.statistics

    return {
      framesPerSecond: this.framesPerSecond,
      collisions: {
        bodyCount: broadphase?.bodyCount ?? null,
        colliderCount: broadphase?.colliderCount ?? null,
        candidateBodyPairCount: broadphase?.candidateBodyPairCount ?? null,
        candidateBodyColliderPairCount: broadphase?.candidateBodyColliderPairCount ?? null,
        manifoldCount: broadphase?.manifoldCount ?? null
      },
      culling: { ...this.culling },
      renderer: {
        planarReflections: { renderedCount: options.renderedReflectorCount, totalCount: options.reflectorCount },
        primitives: {
          renderedCount: statistics.renderedPrimitiveCount,
          submittedCount: statistics.submittedPrimitiveCount
        },
        cullChanges: statistics.stateChanges.cullModeChangeCount,
        blendChanges: statistics.stateChanges.blendModeChangeCount,
        depthChanges: statistics.stateChanges.depthTestChangeCount,
        colorMaskChanges: statistics.stateChanges.colorMaskChangeCount,
        depthMaskChanges: statistics.stateChanges.depthMaskChangeCount
      },
      environment: {
        diffuse: formatKtx(options.diffuseEnvironment),
        specular: formatKtx(options.specularEnvironment),
        mode: options.usesCubeEnvironment ? 'Cubemap' : 'Equirectangular 2D'
      }
    }
  }
}

function formatKtx(container?: KTXContainer): string {
  if (!container) {
    return '—'
  }

  const compression = container.glType === 0 ? 'compressed' : 'uncompressed'

  return `${container.pixelWidth}×${container.pixelHeight}, ${container.numberOfFaces} faces, ${container.numberOfMipmapLevels} mips, ${formatNumber(container.glInternalFormat)} ${compression}`
}

function formatNumber(value?: number): string {
  return typeof value === 'number' ? `0x${value.toString(16)}` : '-'
}
