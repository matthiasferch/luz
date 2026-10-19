import { Camera, isCamera, Light, Projector, Transform } from '@luz/core'
import { Model } from '../../model'
import { WebGL2PrimitiveManager } from './managers/webgl2-primitive-manager'
import { WebGL2BufferManager } from './managers/webgl2-buffer-manager'
import { WebGL2ProgramManager } from './managers/webgl2-program-manager'
import { WebGL2SamplerManager } from './managers/webgl2-sampler-manager'
import { WebGL2ShaderManager } from './managers/webgl2-shader-manager'
import { WebGL2TextureManager } from './managers/webgl2-texture-manager'
import type { Program } from '../../types/program'
import type { UniformValue } from '../../types/uniform'
import type { Texture } from '../../types/texture'
import { Material } from '../material'
import { RenderMaterial } from '../render-material'
import type { RenderModel } from '../render-model'
import type { RenderTarget } from '../render-target'
import { collectUniformProperties } from '@luz/serialization'
import type { UniformProperty } from '@luz/serialization'
import type { Rectangle } from '@luz/core'
import type { RenderPipeline } from '../render-pipeline'
import type { RenderBackend, RenderState, BlendMode, CullMode, DepthTest, ClearOptions } from '../render-backend'
import { RenderStatistics } from '../render-statistics'
import { defaultMaterialGraphSource } from '../../compilers/graph-compiler'
import type { ColorMask } from '@luz/formats'
import type { DrawPrimitive } from '../../types/primitive'
import type { DrawOptions } from '../../types/primitive-options'

export class WebGL2RenderBackend implements RenderBackend {
  readonly primitives: WebGL2PrimitiveManager
  readonly buffers: WebGL2BufferManager
  readonly shaders: WebGL2ShaderManager
  readonly programs: WebGL2ProgramManager
  readonly textures: WebGL2TextureManager
  readonly samplers: WebGL2SamplerManager
  readonly defaultTexture: Texture
  readonly defaultMaterial: RenderMaterial
  readonly maximumTextureUnits: number

  private activeCullMode: CullMode = 'none'
  private activeFrontFace?: number
  private activeBlendMode: BlendMode = 'none'
  private activeDepthTest: DepthTest = 'none'

  private readonly uniformCache: Record<string, UniformValue>
  private readonly uniformProperties: Record<string, UniformProperty[]>

  private lastMaterialByProgram: WeakMap<Program, RenderMaterial>
  private currentTarget: RenderTarget | null = null
  private currentAttachments: Set<Texture> = new Set()
  private boneTexture?: Texture
  private previousBoneTexture?: Texture

  private readonly identityBones = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1])

  readonly statistics: RenderStatistics

  constructor(private context: WebGL2RenderingContext) {
    for (const extension of [
      'OES_texture_float_linear',
      'EXT_color_buffer_float',
      'WEBGL_compressed_texture_s3tc',
      'WEBGL_compressed_texture_s3tc_srgb',
      'WEBGL_compressed_texture_astc',
      'EXT_texture_compression_bptc',
      'WEBGL_compressed_texture_etc',
      'WEBGL_compressed_texture_etc1',
      'WEBGL_compressed_texture_pvrtc'
    ]) {
      this.context.getExtension(extension)
    }

    this.primitives = new WebGL2PrimitiveManager(this.context)
    this.buffers = new WebGL2BufferManager(this.context)
    this.shaders = new WebGL2ShaderManager(this.context)
    this.programs = new WebGL2ProgramManager(this.context)
    this.textures = new WebGL2TextureManager(this.context)
    this.samplers = new WebGL2SamplerManager(this.context)

    const textureData = new Uint8Array([0xff, 0xff, 0xff, 0xff])

    this.defaultTexture = this.textures.create({ data: textureData })
    this.defaultMaterial = new RenderMaterial(new Material(), {
      source: defaultMaterialGraphSource,
      topology: 'default',
      uniforms: {},
      textureCount: 0
    })
    this.maximumTextureUnits = this.context.getParameter(this.context.MAX_TEXTURE_IMAGE_UNITS) as number
    this.uniformCache = Object.create(null)
    this.uniformProperties = {
      model: collectUniformProperties(Model),
      light: collectUniformProperties(Light),
      camera: collectUniformProperties(Camera),
      projector: collectUniformProperties(Projector),
      transform: collectUniformProperties(Transform)
    }
    this.statistics = new RenderStatistics()
    this.lastMaterialByProgram = new WeakMap()
  }

  set cullMode(cullMode: CullMode) {
    if (cullMode === this.activeCullMode) {
      return
    }

    if (cullMode === 'none') {
      this.context.disable(this.context.CULL_FACE)
    } else {
      this.context.enable(this.context.CULL_FACE)

      switch (cullMode) {
        case 'front':
          this.context.cullFace(this.context.FRONT)
          break

        case 'back':
          this.context.cullFace(this.context.BACK)
          break
      }
    }

    this.activeCullMode = cullMode
    this.statistics.stateChanges.cullModeChangeCount += 1
  }

  set blendMode(blendMode: BlendMode) {
    if (blendMode === this.activeBlendMode) {
      return
    }

    if (blendMode === 'none') {
      this.context.disable(this.context.BLEND)
    } else {
      this.context.enable(this.context.BLEND)

      switch (blendMode) {
        case 'additive':
          this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE)
          break

        case 'transparent':
        case 'transmissive':
          this.context.blendFunc(this.context.SRC_ALPHA, this.context.ONE_MINUS_SRC_ALPHA)
          break
      }
    }

    this.activeBlendMode = blendMode
    this.statistics.stateChanges.blendModeChangeCount += 1
  }

  set depthTest(depthTest: DepthTest) {
    if (depthTest === this.activeDepthTest) {
      return
    }

    if (depthTest === 'none') {
      this.context.disable(this.context.DEPTH_TEST)
    } else {
      this.context.enable(this.context.DEPTH_TEST)

      switch (depthTest) {
        case 'never':
          this.context.depthFunc(this.context.NEVER)
          break

        case 'always':
          this.context.depthFunc(this.context.ALWAYS)
          break

        case 'equal':
          this.context.depthFunc(this.context.EQUAL)
          break

        case 'notEqual':
          this.context.depthFunc(this.context.NOTEQUAL)
          break

        case 'less':
          this.context.depthFunc(this.context.LESS)
          break

        case 'lessEqual':
          this.context.depthFunc(this.context.LEQUAL)
          break

        case 'greater':
          this.context.depthFunc(this.context.GREATER)
          break

        case 'greaterEqual':
          this.context.depthFunc(this.context.GEQUAL)
          break
      }
    }

    this.activeDepthTest = depthTest
    this.statistics.stateChanges.depthTestChangeCount += 1
  }

  set colorMask(colorMask: ColorMask) {
    const [r, g, b, a] = colorMask

    this.context.colorMask(r, g, b, a)

    this.statistics.stateChanges.colorMaskChangeCount += 1
  }

  set depthMask(depthMask: boolean) {
    this.context.depthMask(depthMask)

    this.statistics.stateChanges.depthMaskChangeCount += 1
  }

  set scissor(scissor: Rectangle | null) {
    if (scissor === null) {
      this.context.disable(this.context.SCISSOR_TEST)

      return
    }

    const { x, y, width, height } = scissor

    this.context.enable(this.context.SCISSOR_TEST)
    this.context.scissor(x, y, width, height)
  }

  clear({ color, depth, stencil }: Partial<ClearOptions>) {
    let clearMask = 0

    if (color !== undefined) {
      const { r = 0.0, g = 0.0, b = 0.0, a = 1.0 } = color

      this.context.clearColor(r, g, b, a)

      clearMask |= this.context.COLOR_BUFFER_BIT
    }

    if (depth !== undefined) {
      this.context.clearDepth(depth)

      clearMask |= this.context.DEPTH_BUFFER_BIT
    }

    if (stencil !== undefined) {
      this.context.clearStencil(stencil)

      clearMask |= this.context.STENCIL_BUFFER_BIT
    }

    if (clearMask !== 0) {
      this.context.clear(clearMask)
    }
  }

  bindTarget({ width, height, frameBuffer, viewport }: RenderTarget) {
    this.currentAttachments.clear()

    if (frameBuffer) {
      const attachments = frameBuffer.attachments || {}

      for (const attachment of Object.values(attachments)) {
        if (attachment && typeof attachment === 'object' && 'dataType' in attachment) {
          this.currentAttachments.add(attachment as unknown as Texture)
        }
      }
    }

    this.currentTarget = { width, height, frameBuffer }

    if (frameBuffer) {
      // Ensure we don't have the target's attachments currently bound on any unit
      // (Avoid feedback loop regardless of previous state.)
      // Since program bindings bypass TextureManager, clear bindings at GL level.
      const maximumUnits = this.context.getParameter(this.context.MAX_COMBINED_TEXTURE_IMAGE_UNITS) as number

      for (let unit = 0; unit < maximumUnits; unit++) {
        this.context.activeTexture(this.context.TEXTURE0 + unit)
        this.context.bindTexture(this.context.TEXTURE_2D, null)
        this.context.bindTexture(this.context.TEXTURE_CUBE_MAP, null)
      }

      this.buffers.bind(frameBuffer)
    } else {
      this.buffers.unbind('frameBuffer')
    }

    this.context.viewport(viewport?.x ?? 0, viewport?.y ?? 0, viewport?.width ?? width, viewport?.height ?? height)
  }

  bindPipeline(pipeline: RenderPipeline, overrideStates?: Partial<RenderState>, program?: Program) {
    const resolvedProgram = program ?? pipeline.program

    if (resolvedProgram == null) {
      throw new Error('Cannot bind pipeline without a program')
    }

    this.programs.bind(resolvedProgram)

    this.cullMode = overrideStates?.cullMode ?? pipeline.cullMode
    this.blendMode = overrideStates?.blendMode ?? pipeline.blendMode
    this.depthTest = overrideStates?.depthTest ?? pipeline.depthTest
    this.colorMask = overrideStates?.colorMask ?? pipeline.colorMask
    this.depthMask = overrideStates?.depthMask ?? pipeline.depthMask
  }

  copyDepth(source: RenderTarget, destination: RenderTarget): void {
    const gl = this.context
    const readBuffer = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING) as WebGLFramebuffer | null
    const drawBuffer = gl.getParameter(gl.DRAW_FRAMEBUFFER_BINDING) as WebGLFramebuffer | null
    const isScissorEnabled = gl.isEnabled(gl.SCISSOR_TEST)

    try {
      gl.disable(gl.SCISSOR_TEST)
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.frameBuffer ?? null)
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, destination.frameBuffer ?? null)
      gl.blitFramebuffer(
        0,
        0,
        source.width,
        source.height,
        0,
        0,
        destination.width,
        destination.height,
        gl.DEPTH_BUFFER_BIT,
        gl.NEAREST
      )
    } finally {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readBuffer)
      gl.bindFramebuffer(gl.DRAW_FRAMEBUFFER, drawBuffer)

      if (isScissorEnabled) {
        gl.enable(gl.SCISSOR_TEST)
      }
    }
  }

  copyColorToTexture(source: RenderTarget, destination: Texture): void {
    const gl = this.context
    const readBuffer = gl.getParameter(gl.READ_FRAMEBUFFER_BINDING) as WebGLFramebuffer | null
    const activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE) as number

    gl.activeTexture(gl.TEXTURE0)

    const previousTexture = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture | null

    try {
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, source.frameBuffer ?? null)
      gl.bindTexture(gl.TEXTURE_2D, destination)
      gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 0, 0, source.width, source.height)
    } finally {
      gl.bindTexture(gl.TEXTURE_2D, previousTexture)
      gl.activeTexture(activeTexture)
      gl.bindFramebuffer(gl.READ_FRAMEBUFFER, readBuffer)
    }
  }

  bindCameraUniforms(program: Program, camera: Projector) {
    const uniforms: Record<string, UniformValue> = Object.create(null)
    const hasUniform = this.hasUniform.bind(this, program)
    const properties = isCamera(camera) ? this.uniformProperties.camera : this.uniformProperties.projector

    for (const { key } of properties) {
      const name = `camera.${key}`

      if (hasUniform(name)) {
        uniforms[name] = (camera as unknown as Record<string, UniformValue>)[key]
      }
    }

    if (Object.keys(uniforms).length > 0) {
      this.programs.update(program, { uniforms })
    }
  }

  bindLightUniforms(program: Program, light: Light) {
    const uniforms: Record<string, UniformValue> = Object.create(null)
    const hasUniform = this.hasUniform.bind(this, program)

    for (const { key } of this.uniformProperties.light) {
      const name = `light.${key}`

      if (hasUniform(name)) {
        uniforms[name] = (light as unknown as Record<string, UniformValue>)[key]
      }
    }

    if (Object.keys(uniforms).length > 0) {
      this.programs.update(program, { uniforms })
    }
  }

  bindUniforms(program: Program, values: object) {
    const uniforms = this.collectUniformValues(program, values)

    for (const key of Object.keys(uniforms)) {
      const value = uniforms[key]

      if (value && typeof value === 'object' && 'target' in value) {
        const texture = value as Texture

        if (this.currentAttachments.has(texture)) {
          uniforms[key] = this.defaultTexture
        }
      }
    }

    if (Object.keys(uniforms).length > 0) {
      this.programs.update(program, { uniforms })
    }
  }

  private setFrontFace(isMirrored: boolean): void {
    const frontFace = isMirrored ? this.context.CW : this.context.CCW

    if (frontFace !== this.activeFrontFace) {
      this.context.frontFace(frontFace)

      this.activeFrontFace = frontFace
      this.statistics.stateChanges.frontFaceChangeCount += 1
    }
  }

  resetMaterialBinding(program: Program) {
    this.lastMaterialByProgram.delete(program)
  }

  render<T extends object>(
    renderModel: RenderModel,
    program: Program,
    transform: Transform,
    additionalUniforms?: T,
    selectedMeshes?: string[]
  ) {
    const { source: model } = renderModel

    // Mirrored world transforms reverse triangle winding. Set the front face,
    // rather than swapping cull modes, so gl_FrontFacing also stays correct for
    // two-sided materials and normal passes. Reflection passes still select
    // their own cull mode to account for the reflected camera.
    this.setFrontFace(transform?.modelMatrix.determinant < 0)

    const baseUniforms: Record<string, UniformValue> = Object.create(null)

    const hasUniform = this.hasUniform.bind(this, program)

    const setUniformValue = (value: UniformValue, key: string, prefix?: string) => {
      const name = prefix ? `${prefix}.${key}` : key

      if (hasUniform(name)) {
        baseUniforms[name] = value
      }
    }

    if (transform) {
      for (const { key } of this.uniformProperties.transform) {
        setUniformValue((transform as unknown as Record<string, UniformValue>)[key], key, 'transform')
      }
    }

    if (model) {
      for (const { key } of this.uniformProperties.model) {
        setUniformValue((model as unknown as Record<string, UniformValue>)[key], key, 'model')
      }
    }

    if (hasUniform('boneTexture')) {
      const matrices = model.boneMatrices ?? this.identityBones
      const previousMatrices =
        (additionalUniforms as { previousBoneMatrices?: Float32Array } | undefined)?.previousBoneMatrices ?? matrices

      this.boneTexture = this.uploadBonePalette(this.boneTexture, matrices, program.textureSlots.boneTexture)

      setUniformValue(this.boneTexture, 'boneTexture')

      if (hasUniform('previousBoneTexture')) {
        this.previousBoneTexture = this.uploadBonePalette(
          this.previousBoneTexture,
          previousMatrices,
          program.textureSlots.previousBoneTexture
        )

        setUniformValue(this.previousBoneTexture, 'previousBoneTexture')
      }
    }

    if (additionalUniforms) {
      const uniformValues = this.collectUniformValues(program, additionalUniforms)

      for (const uniform in uniformValues) {
        baseUniforms[uniform] = uniformValues[uniform]
      }
    }

    if (Object.keys(baseUniforms).length > 0) {
      this.programs.update(program, { uniforms: baseUniforms })
    }

    const selectedSet: Set<string> | null = selectedMeshes ? new Set(selectedMeshes) : null

    for (const [name, primitive] of Object.entries(renderModel.primitives)) {
      if (selectedSet && !selectedSet.has(name)) {
        continue
      }

      const material = primitive.material ?? this.defaultMaterial

      const primitiveUniforms: Record<string, UniformValue> = Object.create(null)

      if (this.hasUniform(program, 'generatedCoordinateMinimum')) {
        primitiveUniforms.generatedCoordinateMinimum = primitive.generatedCoordinateMinimum
      }

      if (this.hasUniform(program, 'generatedCoordinateExtent')) {
        primitiveUniforms.generatedCoordinateExtent = primitive.generatedCoordinateExtent
      }

      if (Object.keys(primitiveUniforms).length > 0) {
        this.programs.update(program, { uniforms: primitiveUniforms })
      }

      const lastMaterial = this.lastMaterialByProgram.get(program)

      if (lastMaterial !== material) {
        const materialUniforms = this.uniformCache

        for (const uniformName in materialUniforms) {
          delete materialUniforms[uniformName]
        }

        for (const [name, value] of Object.entries(material.uniforms)) {
          if (value !== undefined && this.hasUniform(program, name)) {
            const uniformValue = value

            if (
              uniformValue &&
              typeof uniformValue === 'object' &&
              'target' in uniformValue &&
              this.currentAttachments.has(uniformValue as unknown as Texture)
            ) {
              materialUniforms[name] = this.defaultTexture
            } else {
              materialUniforms[name] = uniformValue
            }
          }
        }

        this.programs.update(program, { uniforms: materialUniforms })
        this.lastMaterialByProgram.set(program, material)
      }

      this.primitives.render(primitive)

      this.statistics.renderedPrimitiveCount += 1
    }
  }

  draw(primitive: DrawPrimitive, { instanceCount, isMirrored = false }: DrawOptions = {}): void {
    if (instanceCount === 0 || (primitive.vertexArray.vertexCount === 0 && primitive.vertexArray.indexCount === 0)) {
      return
    }

    this.setFrontFace(isMirrored)
    this.primitives.render(primitive, instanceCount)

    this.statistics.renderedPrimitiveCount += 1
  }

  destroy(): void {
    this.primitives.destroyAll()
    this.programs.destroyAll()
    this.shaders.destroyAll()
    this.buffers.destroyAll()
    this.samplers.destroyAll()
    this.textures.destroyAll()
    this.currentAttachments.clear()

    this.boneTexture = undefined
    this.previousBoneTexture = undefined
    this.currentTarget = null
    this.lastMaterialByProgram = new WeakMap()
  }

  private uploadBonePalette(texture: Texture | undefined, matrices: Float32Array, slot: number): Texture {
    const gl = this.context
    const boneCount = matrices.length / 16

    if (
      !Number.isInteger(boneCount) ||
      boneCount < 1 ||
      boneCount > gl.getParameter(gl.MAX_TEXTURE_SIZE) ||
      gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS) < 2
    ) {
      throw new Error('Skeleton exceeds WebGL2 bone palette texture limits')
    }

    const activeTexture = gl.getParameter(gl.ACTIVE_TEXTURE) as number

    if (!texture) {
      gl.activeTexture(gl.TEXTURE0)

      const binding = gl.getParameter(gl.TEXTURE_BINDING_2D) as WebGLTexture | null

      texture = this.textures.create({
        width: 4,
        height: boneCount,
        precision: 32,
        filtering: 'none',
        areMipmapsEnabled: false
      })

      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, binding)
    }

    gl.activeTexture(gl.TEXTURE0 + slot)
    gl.bindTexture(gl.TEXTURE_2D, texture)

    if (texture.height < boneCount) {
      texture.height = boneCount

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA32F, 4, boneCount, 0, gl.RGBA, gl.FLOAT, null)
    }

    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 4, boneCount, gl.RGBA, gl.FLOAT, matrices)
    gl.activeTexture(activeTexture)
    this.textures.invalidateBindings()

    return texture
  }

  private collectUniformValues(program: Program, uniformValues: unknown) {
    const uniforms: Record<string, UniformValue> = Object.create(null)
    const hasUniform = this.hasUniform.bind(this, program)

    const collectRecursively = (values: unknown, prefix?: string) => {
      if (values == null || typeof values !== 'object') {
        return
      }

      for (const [name, value] of Object.entries(values)) {
        if (!prefix && name === 'previousBoneMatrices') {
          continue
        }

        const uniformName = prefix ? `${prefix}.${name}` : name

        if (hasUniform(uniformName)) {
          uniforms[uniformName] = value as UniformValue
        } else if (Array.isArray(value)) {
          ;(value as unknown[]).forEach((element, index) => {
            const arrayIndex = `${uniformName}[${index}]`

            if (hasUniform(arrayIndex)) {
              uniforms[arrayIndex] = element as UniformValue
            } else {
              collectRecursively(element, arrayIndex)
            }
          })
        } else {
          collectRecursively(value, uniformName)
        }
      }
    }

    collectRecursively(uniformValues)

    return uniforms
  }

  private hasUniform(program: Program, name: string) {
    const { uniforms } = program

    if (!uniforms) {
      return false
    }

    return Object.prototype.hasOwnProperty.call(uniforms, name)
  }
}
