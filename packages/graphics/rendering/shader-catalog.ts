import { Vector4 } from '@luz/math'
import shaderAttributes from './shaders/common/attributes.glsl'
import shaderDefinitions from './shaders/common/definitions.glsl'
import shaderUniforms from './shaders/common/uniforms.glsl'

import octahedralNormal from './shaders/utilities/octahedral-normal.glsl'
import reconstructDepth from './shaders/utilities/reconstruct-depth.glsl'
import reconstructNormal from './shaders/utilities/reconstruct-normal.glsl'
import reconstructPosition from './shaders/utilities/reconstruct-position.glsl'

import calculateGammaCorrection from './shaders/effects/gamma-correction.glsl'
import physicallyBasedRendering from './shaders/effects/physically-based-rendering.glsl'
import shadowMapping from './shaders/effects/shadow-mapping.glsl'
import calculateToneMapping from './shaders/effects/tone-mapping.glsl'
import volumetricCone from './shaders/effects/volumetric-cone.glsl'
import volumetricUpsampling from './shaders/effects/volumetric-upsampling.glsl'

import { PipelineCompiler } from '../compilers/pipeline-compiler'
import type { RenderBackend } from '../renderer/render-backend'
import { RenderFlow } from '../renderer/render-flow'
import { RenderPipeline } from '../renderer/render-pipeline'
import flowDefinition from './flows/scene.flow.json'
import type { BlurConfiguration } from './separable-blur'

export const vertexShaderHeaders = [shaderDefinitions, shaderAttributes, shaderUniforms]

export const fragmentShaderHeaders = [
  shaderDefinitions,
  shaderAttributes,
  shaderUniforms,
  reconstructDepth,
  reconstructNormal,
  reconstructPosition,
  octahedralNormal,
  calculateToneMapping,
  calculateGammaCorrection,
  shadowMapping,
  volumetricUpsampling,
  volumetricCone,
  physicallyBasedRendering
]

import ambientOcclusionBlurPipeline from './pipelines/ambient-occlusion-blur.pipeline.json'
import ambientOcclusionNormalPipeline from './pipelines/ambient-occlusion-normal.pipeline.json'
import ambientOcclusionTemporalPipeline from './pipelines/ambient-occlusion-temporal.pipeline.json'
import ambientOcclusionUpsamplePipeline from './pipelines/ambient-occlusion-upsample.pipeline.json'
import ambientOcclusionPipeline from './pipelines/ambient-occlusion.pipeline.json'
import ambientPipeline from './pipelines/ambient.pipeline.json'
import bloomDownsamplePipeline from './pipelines/bloom-downsample.pipeline.json'
import bloomExtractPipeline from './pipelines/bloom-extract.pipeline.json'
import bloomUpsamplePipeline from './pipelines/bloom-upsample.pipeline.json'
import blurPipeline from './pipelines/blur.pipeline.json'
import compositePipeline from './pipelines/composite.pipeline.json'
import debugPipeline from '../debug/pipelines/debug.pipeline.json'
import depthOfFieldBackingAmbientPipeline from './pipelines/depth-of-field-backing-ambient.pipeline.json'
import depthOfFieldBackingDepthPipeline from './pipelines/depth-of-field-backing-depth.pipeline.json'
import depthOfFieldDilatePipeline from './pipelines/depth-of-field-dilate.pipeline.json'
import depthOfFieldLayersPipeline from './pipelines/depth-of-field-layers.pipeline.json'
import depthOfFieldPrefilterPipeline from './pipelines/depth-of-field-prefilter.pipeline.json'
import depthOfFieldSurfacePipeline from './pipelines/depth-of-field-surface.pipeline.json'
import depthPipeline from './pipelines/depth.pipeline.json'
import fxaaPipeline from './pipelines/fxaa.pipeline.json'
import lightingPipeline from './pipelines/lighting.pipeline.json'
import motionBlurNeighborPipeline from './pipelines/motion-blur-neighbor.pipeline.json'
import motionBlurTilePipeline from './pipelines/motion-blur-tile.pipeline.json'
import motionBlurPipeline from './pipelines/motion-blur.pipeline.json'
import motionVectorsPipeline from './pipelines/motion-vectors.pipeline.json'
import presentPipeline from './pipelines/present.pipeline.json'
import shadowingPipeline from './pipelines/shadowing.pipeline.json'
import skyPipeline from './pipelines/sky.pipeline.json'
import temporalAntialiasingPipeline from './pipelines/temporal-antialiasing.pipeline.json'
import transmissionPipeline from './pipelines/transmission.pipeline.json'
import transparentPipeline from './pipelines/transparent.pipeline.json'
import volumetricCompositePipeline from './pipelines/volumetric-composite.pipeline.json'
import volumetricDepthPipeline from './pipelines/volumetric-depth.pipeline.json'
import ambientOcclusionBlurFragmentShader from './shaders/ambient-occlusion-blur.fragment.glsl'
import ambientOcclusionNormalFragmentShader from './shaders/ambient-occlusion-normal.fragment.glsl'
import ambientOcclusionTemporalFragmentShader from './shaders/ambient-occlusion-temporal.fragment.glsl'
import ambientOcclusionUpsampleFragmentShader from './shaders/ambient-occlusion-upsample.fragment.glsl'
import ambientOcclusionFragmentShader from './shaders/ambient-occlusion.fragment.glsl'
import ambientFragmentShader from './shaders/ambient.fragment.glsl'
import bloomDownsampleFragmentShader from './shaders/bloom-downsample.fragment.glsl'
import bloomExtractFragmentShader from './shaders/bloom-extract.fragment.glsl'
import bloomUpsampleFragmentShader from './shaders/bloom-upsample.fragment.glsl'
import blurFragmentShader from './shaders/blur.fragment.glsl'
import blurVertexShader from './shaders/blur.vertex.glsl'
import compositeFragmentShader from './shaders/composite.fragment.glsl'
import compositeVertexShader from './shaders/composite.vertex.glsl'
import debugFragmentShader from '../debug/shaders/debug.fragment.glsl'
import debugVertexShader from '../debug/shaders/debug.vertex.glsl'
import depthOfFieldDilateFragmentShader from './shaders/depth-of-field-dilate.fragment.glsl'
import depthOfFieldLayersFragmentShader from './shaders/depth-of-field-layers.fragment.glsl'
import depthOfFieldPrefilterFragmentShader from './shaders/depth-of-field-prefilter.fragment.glsl'
import depthOfFieldSurfaceFragmentShader from './shaders/depth-of-field-surface.fragment.glsl'
import depthFragmentShader from './shaders/depth.fragment.glsl'
import depthVertexShader from './shaders/depth.vertex.glsl'
import fxaaFragmentShader from './shaders/fxaa.fragment.glsl'
import motionBlurNeighborFragmentShader from './shaders/motion-blur-neighbor.fragment.glsl'
import motionBlurTileFragmentShader from './shaders/motion-blur-tile.fragment.glsl'
import motionBlurFragmentShader from './shaders/motion-blur.fragment.glsl'
import motionVectorsFragmentShader from './shaders/motion-vectors.fragment.glsl'
import motionVectorsVertexShader from './shaders/motion-vectors.vertex.glsl'
import physicallyBasedLightingFragmentShader from './shaders/physically-based-lighting.fragment.glsl'
import presentFragmentShader from './shaders/present.fragment.glsl'
import sceneFragmentShader from './shaders/scene.fragment.glsl'
import sceneVertexShader from './shaders/scene.vertex.glsl'
import skyFragmentShader from './shaders/sky.fragment.glsl'
import skyVertexShader from './shaders/sky.vertex.glsl'
import temporalAntialiasingFragmentShader from './shaders/temporal-antialiasing.fragment.glsl'
import transmissionFragmentShader from './shaders/transmission.fragment.glsl'
import volumetricCompositeFragmentShader from './shaders/volumetric-composite.fragment.glsl'
import volumetricDepthFragmentShader from './shaders/volumetric-depth.fragment.glsl'
import volumetricLightFragmentShader from './shaders/volumetric-light.fragment.glsl'

export const shaderSources: Readonly<Record<string, string>> = {
  './assets/shaders/ambient-occlusion-blur.fragment.glsl': ambientOcclusionBlurFragmentShader,
  './assets/shaders/ambient-occlusion-normal.fragment.glsl': ambientOcclusionNormalFragmentShader,
  './assets/shaders/ambient-occlusion-temporal.fragment.glsl': ambientOcclusionTemporalFragmentShader,
  './assets/shaders/ambient-occlusion-upsample.fragment.glsl': ambientOcclusionUpsampleFragmentShader,
  './assets/shaders/ambient-occlusion.fragment.glsl': ambientOcclusionFragmentShader,
  './assets/shaders/ambient.fragment.glsl': ambientFragmentShader,
  './assets/shaders/bloom-downsample.fragment.glsl': bloomDownsampleFragmentShader,
  './assets/shaders/bloom-extract.fragment.glsl': bloomExtractFragmentShader,
  './assets/shaders/bloom-upsample.fragment.glsl': bloomUpsampleFragmentShader,
  './assets/shaders/blur.fragment.glsl': blurFragmentShader,
  './assets/shaders/blur.vertex.glsl': blurVertexShader,
  './assets/shaders/composite.fragment.glsl': compositeFragmentShader,
  './assets/shaders/composite.vertex.glsl': compositeVertexShader,
  './assets/shaders/debug.fragment.glsl': debugFragmentShader,
  './assets/shaders/debug.vertex.glsl': debugVertexShader,
  './assets/shaders/depth-of-field-dilate.fragment.glsl': depthOfFieldDilateFragmentShader,
  './assets/shaders/depth-of-field-layers.fragment.glsl': depthOfFieldLayersFragmentShader,
  './assets/shaders/depth-of-field-prefilter.fragment.glsl': depthOfFieldPrefilterFragmentShader,
  './assets/shaders/depth-of-field-surface.fragment.glsl': depthOfFieldSurfaceFragmentShader,
  './assets/shaders/depth.fragment.glsl': depthFragmentShader,
  './assets/shaders/depth.vertex.glsl': depthVertexShader,
  './assets/shaders/fxaa.fragment.glsl': fxaaFragmentShader,
  './assets/shaders/motion-blur-neighbor.fragment.glsl': motionBlurNeighborFragmentShader,
  './assets/shaders/motion-blur-tile.fragment.glsl': motionBlurTileFragmentShader,
  './assets/shaders/motion-blur.fragment.glsl': motionBlurFragmentShader,
  './assets/shaders/motion-vectors.fragment.glsl': motionVectorsFragmentShader,
  './assets/shaders/motion-vectors.vertex.glsl': motionVectorsVertexShader,
  './assets/shaders/physically-based-lighting.fragment.glsl': physicallyBasedLightingFragmentShader,
  './assets/shaders/present.fragment.glsl': presentFragmentShader,
  './assets/shaders/scene.fragment.glsl': sceneFragmentShader,
  './assets/shaders/scene.vertex.glsl': sceneVertexShader,
  './assets/shaders/sky.fragment.glsl': skyFragmentShader,
  './assets/shaders/sky.vertex.glsl': skyVertexShader,
  './assets/shaders/temporal-antialiasing.fragment.glsl': temporalAntialiasingFragmentShader,
  './assets/shaders/transmission.fragment.glsl': transmissionFragmentShader,
  './assets/shaders/volumetric-composite.fragment.glsl': volumetricCompositeFragmentShader,
  './assets/shaders/volumetric-depth.fragment.glsl': volumetricDepthFragmentShader,
  './assets/shaders/volumetric-light.fragment.glsl': volumetricLightFragmentShader
}
export const pipelineDefinitions: Readonly<Record<string, unknown>> = {
  'ambient-occlusion-blur.pipeline.json': ambientOcclusionBlurPipeline,
  'ambient-occlusion-normal.pipeline.json': ambientOcclusionNormalPipeline,
  'ambient-occlusion-temporal.pipeline.json': ambientOcclusionTemporalPipeline,
  'ambient-occlusion-upsample.pipeline.json': ambientOcclusionUpsamplePipeline,
  'ambient-occlusion.pipeline.json': ambientOcclusionPipeline,
  'ambient.pipeline.json': ambientPipeline,
  'bloom-downsample.pipeline.json': bloomDownsamplePipeline,
  'bloom-extract.pipeline.json': bloomExtractPipeline,
  'bloom-upsample.pipeline.json': bloomUpsamplePipeline,
  'blur.pipeline.json': blurPipeline,
  'composite.pipeline.json': compositePipeline,
  'debug.pipeline.json': debugPipeline,
  'depth-of-field-backing-ambient.pipeline.json': depthOfFieldBackingAmbientPipeline,
  'depth-of-field-backing-depth.pipeline.json': depthOfFieldBackingDepthPipeline,
  'depth-of-field-dilate.pipeline.json': depthOfFieldDilatePipeline,
  'depth-of-field-layers.pipeline.json': depthOfFieldLayersPipeline,
  'depth-of-field-prefilter.pipeline.json': depthOfFieldPrefilterPipeline,
  'depth-of-field-surface.pipeline.json': depthOfFieldSurfacePipeline,
  'depth.pipeline.json': depthPipeline,
  'fxaa.pipeline.json': fxaaPipeline,
  'lighting.pipeline.json': lightingPipeline,
  'motion-blur-neighbor.pipeline.json': motionBlurNeighborPipeline,
  'motion-blur-tile.pipeline.json': motionBlurTilePipeline,
  'motion-blur.pipeline.json': motionBlurPipeline,
  'motion-vectors.pipeline.json': motionVectorsPipeline,
  'present.pipeline.json': presentPipeline,
  'shadowing.pipeline.json': shadowingPipeline,
  'sky.pipeline.json': skyPipeline,
  'temporal-antialiasing.pipeline.json': temporalAntialiasingPipeline,
  'transmission.pipeline.json': transmissionPipeline,
  'transparent.pipeline.json': transparentPipeline,
  'volumetric-composite.pipeline.json': volumetricCompositePipeline,
  'volumetric-depth.pipeline.json': volumetricDepthPipeline
}
export function createPipelineCompiler(backend: RenderBackend): PipelineCompiler {
  return new PipelineCompiler(backend, vertexShaderHeaders, fragmentShaderHeaders)
}

export function compileBuiltinPipeline(compiler: PipelineCompiler, name: string): RenderPipeline {
  const definition = pipelineDefinitions[name]

  if (!definition) {
    throw new Error('Unknown built-in pipeline: ' + name)
  }

  const pipeline = RenderPipeline.createFromDefinition(definition)

  compiler.compile(pipeline, shaderSources[pipeline.vertexShader], shaderSources[pipeline.fragmentShader])

  return pipeline
}

export async function createRenderFlow(compiler: PipelineCompiler): Promise<RenderFlow> {
  const flow = await RenderFlow.deserialize(flowDefinition)

  for (const pipeline of Object.values(flow.pipelines)) {
    compiler.compile(pipeline, shaderSources[pipeline.vertexShader], shaderSources[pipeline.fragmentShader])
  }

  return flow
}

export function createBlurConfiguration(compiler: PipelineCompiler, isAmbientOcclusion: boolean): BlurConfiguration {
  return {
    pipeline: compileBuiltinPipeline(
      compiler,
      isAmbientOcclusion ? 'ambient-occlusion-blur.pipeline.json' : 'blur.pipeline.json'
    ),
    clear: isAmbientOcclusion ? { color: new Vector4([1, 1, 1, 1]) } : undefined,
    sourceUniform: 'baseTexture',
    directionUniform: 'direction',
    isCameraRequired: isAmbientOcclusion,
    parameters: isAmbientOcclusion
      ? { radius: 2, ambientOcclusionDepthSharpness: 24, ambientOcclusionNormalSharpness: 16 }
      : { radius: 6, separation: 0.8 }
  }
}
