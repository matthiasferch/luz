import { GpuBackend, GpuCommandEncoder, GpuRenderPassEncoder, MaskOptions, ClearOptions, RenderPassBeginDesc } from './backend'
import { RenderPipeline, PipelineDescriptor } from './pipeline'
import { Program } from '../types/program'
import { Mesh } from '../types/mesh'
import { Uniform } from '../types/uniform'

class WebGPURenderPassEncoder implements GpuRenderPassEncoder {
  private rp: any
  private viewport?: { x: number; y: number; width: number; height: number }
  private scissor?: { x: number; y: number; width: number; height: number }
  private activePipeline?: RenderPipeline
  private currentGPUPipeline?: any
  private issuedDraw: boolean = false
  private ubo?: any
  private bindGroup?: any
  private uniforms = {
    view: undefined as Float32Array | undefined,
    proj: undefined as Float32Array | undefined,
    model: undefined as Float32Array | undefined
  }

  constructor(
    private device: any,
    private queue: any,
    private encoder: any,
    private canvasContext: any,
    private canvasFormat: string,
    private target: RenderPassBeginDesc['target'],
    private shared: { basicPipeline?: any; meshPipeline?: any; meshCache: WeakMap<Mesh, { vb: any; ib: any; indexCount: number; vertexCount: number }>; debug?: boolean; getView: () => any; getDepthView: (w:number,h:number)=>any; getPipelineForState?: (state: RenderPipeline) => any }
  ) {}

  private beginPass(clear?: Partial<ClearOptions>) {
    if (this.shared.debug) console.debug('[WebGPU] beginPass: start')
    let view: any = this.shared.getView?.()
    if (this.shared.debug) console.debug('[WebGPU] beginPass: view initial ->', !!view)
    if (!view && this.canvasContext && (this.canvasContext as any).configure) {
      const fmt = this.canvasFormat || (((globalThis as any).navigator?.gpu?.getPreferredCanvasFormat?.()) || 'bgra8unorm')
      try {
        ;(this.canvasContext as any).configure({ device: this.device, format: fmt, alphaMode: 'opaque' })
        view = this.shared.getView?.()
        if (this.shared.debug) console.debug('[WebGPU] beginPass: reconfigured -> view:', !!view, 'format:', fmt)
      } catch {
        // leave view undefined; pass creation will be skipped
        if (this.shared.debug) console.warn('[WebGPU] beginPass: configure failed')
      }
    }

    if (!view) {
      // Unable to acquire a canvas view; skip starting a pass this frame
      if (this.shared.debug) console.warn('[WebGPU] beginPass: no view, skipping pass')
      this.rp = undefined
      return
    }

    const hasClear = !!clear && clear.color !== undefined
    const cv = hasClear ? this.toGPUColor(clear!.color as any) : { r: 0, g: 0, b: 0, a: 1 }
    const colorAttachment: any = {
      view,
      loadOp: hasClear ? 'clear' : 'load',
      clearValue: cv,
      storeOp: 'store'
    }
    // Add depth attachment if available/needed
    const dw = Math.max(1, (this.target?.width as number) || 1)
    const dh = Math.max(1, (this.target?.height as number) || 1)
    const depthView = this.shared.getDepthView ? this.shared.getDepthView(dw, dh) : undefined
    const depthClear = (clear && typeof clear.depth === 'number') ? clear.depth : 1.0
    const desc: any = {
      colorAttachments: [colorAttachment],
      depthStencilAttachment: depthView
        ? {
            view: depthView,
            depthLoadOp: hasClear ? 'clear' : 'load',
            depthClearValue: depthClear,
            depthStoreOp: 'store'
          }
        : undefined
    }
    this.rp = this.encoder.beginRenderPass(desc)
    if (this.shared.debug) console.debug('[WebGPU] beginPass: pass begun')
    // Re-apply viewport/scissor if set
    if (this.viewport && this.rp.setViewport) {
      const v = this.viewport
      this.rp.setViewport(v.x, v.y, v.width, v.height, 0, 1)
    }
    if (this.scissor && this.rp.setScissorRect) {
      const s = this.scissor
      this.rp.setScissorRect(s.x, s.y, s.width, s.height)
    }
  }

  setViewport(x: number, y: number, width: number, height: number): void {
    this.viewport = { x, y, width, height }
    if (this.rp?.setViewport) this.rp.setViewport(x, y, width, height, 0, 1)
  }

  setScissor(scissor?: { x: number; y: number; width: number; height: number }): void {
    this.scissor = scissor
    if (!this.rp || !this.rp.setScissorRect) return
    if (scissor) this.rp.setScissorRect(scissor.x, scissor.y, scissor.width, scissor.height)
    // No disable in WebGPU; setting full rect is equivalent to disable.
  }

  setMask(_: Partial<MaskOptions>): void {
    // Depth/color write masks would be on the pipeline in WebGPU; ignored here.
  }

  clear(options: Partial<ClearOptions>): void {
    if (!this.encoder) return
    if (this.rp) this.rp.end()
    this.beginPass(options)
    // Re-bind previously selected pipeline after restarting the pass
    if (this.activePipeline && this.rp?.setPipeline) {
      const gpup = this.shared.getPipelineForState
        ? this.shared.getPipelineForState(this.activePipeline)
        : (this.shared.meshPipeline || this.shared.basicPipeline)
      if (gpup) {
        this.rp.setPipeline(gpup)
        this.currentGPUPipeline = gpup
      }
    }
  }

  setPipeline(pipeline: RenderPipeline): void {
    this.activePipeline = pipeline
    const gpup = this.shared.getPipelineForState ? this.shared.getPipelineForState(pipeline) : (this.shared.meshPipeline || this.shared.basicPipeline)
    if (gpup && this.rp?.setPipeline) {
      this.rp.setPipeline(gpup)
      this.currentGPUPipeline = gpup
    }
  }

  bindProgramUniforms(_: Program, values: Record<string, Uniform.Value>): void {
    // Capture relevant matrices when provided
    const getMat4 = (v: any) => (v && (v as any).length === 16 ? new Float32Array(v as any) : undefined)
    if (values['camera.viewMatrix']) this.uniforms.view = getMat4(values['camera.viewMatrix'])
    if (values['camera.projectionMatrix']) this.uniforms.proj = getMat4(values['camera.projectionMatrix'])
    if (values['transform.modelMatrix']) this.uniforms.model = getMat4(values['transform.modelMatrix'])

    // Write/update uniform buffer if available
    if (this.uniforms.view || this.uniforms.proj || this.uniforms.model) {
      this.ensureUniformBindGroup()
      if (this.ubo) {
        const size = 64 * 3
        const data = new ArrayBuffer(size)
        const f32 = new Float32Array(data)
        // Layout: view at 0, proj at 16, model at 32
        if (this.uniforms.view) f32.set(this.uniforms.view, 0)
        if (this.uniforms.proj) f32.set(this.uniforms.proj, 16)
        if (this.uniforms.model) f32.set(this.uniforms.model, 32)
        this.queue.writeBuffer(this.ubo, 0, data)
      }
    }
  }

  bindMaterial(_: Program, __: any, ___: string[]): void {
    // TODO: material to bind group mapping
  }

  resetMaterialBinding(_: Program): void {
    // No-op until material caching is relevant for WebGPU path
  }

  drawMesh(_: Mesh): void {
    if (!this.rp) return
    const mesh = _ as Mesh
    const vao: any = (mesh.vertexArray as any)
    const cpu = vao && vao.__cpu
    if (!cpu) {
      // Fallback: draw fullscreen once
      if (this.shared.basicPipeline && this.rp.setPipeline && !this.issuedDraw) {
        this.rp.setPipeline(this.shared.basicPipeline)
        if (this.rp.draw) this.rp.draw(3, 1, 0, 0)
        this.issuedDraw = true
      }
      return
    }

    // Lazily create buffers and cache per Mesh
    let entry = this.shared.meshCache.get(mesh)
    if (!entry) {
      const vdata: Float32Array = cpu.vertices as Float32Array
      const idata: Uint16Array | null = cpu.indices as Uint16Array | null
      const vb = this.device.createBuffer({ size: vdata.byteLength, usage: 0x20 | 0x08 }) // VERTEX | COPY_DST
      // Float32 arrays are naturally 4-byte aligned; use the view directly
      this.queue.writeBuffer(vb, 0, new Uint8Array(vdata.buffer, vdata.byteOffset, vdata.byteLength))
      let ib: any = null
      let indexCount = 0
      const vertexCount = (vao.vertexCount as number) || (vdata.length / 8) | 0
      if (idata && idata.byteLength > 0) {
        // WebGPU requires writeBuffer size to be a multiple of 4 bytes.
        // Create the buffer with padded size when needed.
        const src = new Uint8Array(idata.buffer, idata.byteOffset, idata.byteLength)
        const alignedSize = (src.byteLength + 3) & ~3
        ib = this.device.createBuffer({ size: alignedSize, usage: 0x10 | 0x08 }) // INDEX | COPY_DST
        let aligned = src
        if (src.byteLength !== alignedSize) {
          const padded = new Uint8Array(alignedSize)
          padded.set(src)
          aligned = padded
        }
        this.queue.writeBuffer(ib, 0, aligned)
        indexCount = idata.length
      }
      entry = { vb, ib, indexCount, vertexCount }
      this.shared.meshCache.set(mesh, entry)
    }

    // Do not override the pipeline here; it was set via setPipeline() based on pass state.
    // Ensure a bind group/UBO is bound, even if no uniforms were provided yet
    this.ensureUniformBindGroup()
    this.writeUniformsIfNeeded()
    
    if (this.bindGroup && this.rp.setBindGroup) this.rp.setBindGroup(0, this.bindGroup)
    if (this.rp.setVertexBuffer) this.rp.setVertexBuffer(0, entry.vb)
    if (entry.ib && this.rp.setIndexBuffer) this.rp.setIndexBuffer(entry.ib, 'uint16')
    if (entry.ib && entry.indexCount > 0 && this.rp.drawIndexed) {
      this.rp.drawIndexed(entry.indexCount, 1, 0, 0, 0)
    } else if (this.rp.draw) {
      this.rp.draw(entry.vertexCount, 1, 0, 0)
    }
  }

  private ensureUniformBindGroup() {
    if (!this.device || !this.rp) return
    if (!this.ubo) {
      // GPUBufferUsage.UNIFORM (0x40) | GPUBufferUsage.COPY_DST (0x08)
      this.ubo = this.device.createBuffer({ size: 64 * 3, usage: 0x40 | 0x08 })
    }
    if (!this.bindGroup) {
      // Prefer the currently bound pipeline layout; fall back to shared pipelines
      const pipeline = this.currentGPUPipeline || this.shared.meshPipeline || this.shared.basicPipeline
      if (pipeline && pipeline.getBindGroupLayout) {
        const layout = pipeline.getBindGroupLayout(0)
        this.bindGroup = this.device.createBindGroup({
          layout,
          entries: [
            { binding: 0, resource: { buffer: this.ubo } }
          ]
        })
      }
    }
  }

  private toGPUColor(c: any): any {
    if (!c) return { r: 0, g: 0, b: 0, a: 1 }
    // Accept {r,g,b,a} object, Float32Array length 4, or vec4-like with x/y/z/w
    if (typeof c === 'object') {
      if ('r' in c && 'g' in c && 'b' in c && 'a' in c) {
        return { r: Number(c.r), g: Number(c.g), b: Number(c.b), a: Number(c.a) }
      }
      if ('x' in c && 'y' in c && 'z' in c && 'w' in c) {
        return { r: Number(c.x), g: Number(c.y), b: Number(c.z), a: Number(c.w) }
      }
      if (Array.isArray(c) || (ArrayBuffer.isView(c) && (c as any).length >= 4)) {
        const arr: any = c
        return { r: Number(arr[0]), g: Number(arr[1]), b: Number(arr[2]), a: Number(arr[3]) }
      }
    }
    return { r: 0, g: 0, b: 0, a: 1 }
  }

  private writeUniformsIfNeeded() {
    if (!this.ubo) return
    // Build a 3x mat4 buffer (view, proj, model); supply identity where missing
    const f32 = new Float32Array(16 * 3)
    // Helper to set identity at offset
    const setIdentity = (off: number) => {
      f32[off + 0] = 1; f32[off + 5] = 1; f32[off + 10] = 1; f32[off + 15] = 1
    }
    if (this.uniforms.view) { f32.set(this.uniforms.view, 0) } else { setIdentity(0) }
    if (this.uniforms.proj) { f32.set(this.uniforms.proj, 16) } else { setIdentity(16) }
    if (this.uniforms.model) { f32.set(this.uniforms.model, 32) } else { setIdentity(32) }
    this.queue.writeBuffer(this.ubo, 0, new Uint8Array(f32.buffer))
  }

  end(): void {
    if (this.rp) this.rp.end()
    const cmd = this.encoder.finish()
    if (this.queue?.submit) this.queue.submit([cmd])
  }
}

class WebGPUCommandEncoder implements GpuCommandEncoder {
  private encoder: any
  constructor(
    private device: any,
    private queue: any,
    private canvasContext: any,
    private canvasFormat: string,
    private shared: {
      basicPipeline?: any
      meshPipeline?: any
      meshCache: WeakMap<Mesh, { vb: any; ib: any; indexCount: number; vertexCount: number }>
      debug?: boolean
      getView: () => any
      getDepthView: (w: number, h: number) => any
      getPipelineForState?: (state: RenderPipeline) => any
    }
  ) {}
  beginRenderPass(desc: RenderPassBeginDesc): GpuRenderPassEncoder {
    this.encoder = this.device.createCommandEncoder()
    const pass = new WebGPURenderPassEncoder(
      this.device,
      this.queue,
      this.encoder,
      this.canvasContext,
      this.canvasFormat,
      desc.target,
      this.shared
    )
    // Start pass without clear; Renderer can call clear() after
    ;(pass as any).beginPass(desc.clear)
    if (desc.viewport) pass.setViewport(desc.viewport.x, desc.viewport.y, desc.viewport.width, desc.viewport.height)
    if (desc.scissor) pass.setScissor(desc.scissor)
    return pass
  }
  finish(): void {
    // Submission handled when pass.end() is called
  }
}

export class WebGPUBackend implements GpuBackend {
  readonly device: unknown
  readonly queue?: unknown
  private canvasContext?: any
  private canvasFormat?: string
  private basicPipeline?: any
  private meshPipeline?: any
  private meshCache: WeakMap<Mesh, { vb: any; ib: any; indexCount: number; vertexCount: number }> = new WeakMap()
  private debug: boolean = false
  private currentView?: any
  private rafScheduled: boolean = false
  private depthTexture?: any
  private depthSize?: { width: number; height: number }
  private readonly depthFormat: string = 'depth24plus'

  private constructor(device: any, queue: any, ctx?: any, format?: string, debug?: boolean) {
    this.device = device
    this.queue = queue
    this.canvasContext = ctx
    this.canvasFormat = format
    this.debug = !!debug
  }

  static async create(canvas?: HTMLCanvasElement): Promise<WebGPUBackend | null> {
    const nav: any = (globalThis as any).navigator
    const gpu: any = nav?.gpu
    // Determine debug flag from URL/localStorage/global marker
    let debug = false
    try {
      const w: any = globalThis as any
      const params = new URLSearchParams(w?.location?.search || '')
      debug = params.has('wgpuDebug') || w?.__LuzWgpuDebug === true || (w?.localStorage?.getItem('luzWgpuDebug') === '1')
    } catch {}
    if (!gpu) {
      if (debug) console.warn('[WebGPU] navigator.gpu not available')
      return null
    }
    try {
      const adapter = await gpu.requestAdapter()
      if (!adapter) {
        if (debug) console.warn('[WebGPU] requestAdapter() returned null')
        return null
      }
      const device = await adapter.requestDevice()
      const queue = device.queue
      let ctx: any = undefined
      let format: string | undefined = undefined
      if (canvas && (canvas as any).getContext) {
        ctx = (canvas as any).getContext('webgpu')
        if (ctx) {
          format = (gpu.getPreferredCanvasFormat ? gpu.getPreferredCanvasFormat() : 'bgra8unorm') as string
          if (ctx.configure) {
            ctx.configure({ device, format, alphaMode: 'opaque' })
            if (debug) console.log('[WebGPU] canvas configured with format:', format)
          }
        } else if (debug) {
          console.warn('[WebGPU] getContext("webgpu") returned null (is WebGL already bound to this canvas?)')
        }
      }
      if (!ctx) return null
      const inst = new WebGPUBackend(device, queue, ctx, format, debug)
      ;(inst as any).initBasicPipeline()
      ;(inst as any).initMeshPipeline()
      return inst
    } catch (e) {
      // tslint:disable-next-line: no-console
      if (debug) console.warn('WebGPU initialization failed, falling back to WebGL2', e)
      return null
    }
  }

  configureCanvas(canvas: HTMLCanvasElement) {
    const nav: any = (globalThis as any).navigator
    const gpu: any = nav?.gpu
    if (!gpu || !this.device) return
    const ctx = (canvas as any).getContext('webgpu')
    if (!ctx) return
    const fmt = (gpu.getPreferredCanvasFormat ? gpu.getPreferredCanvasFormat() : 'bgra8unorm') as string
    if (ctx.configure) ctx.configure({ device: this.device, format: fmt, alphaMode: 'opaque' })
    this.canvasContext = ctx
    this.canvasFormat = fmt
    ;(this as any).initBasicPipeline()
    ;(this as any).initMeshPipeline()
    if (this.debug) console.log('[WebGPU] configureCanvas -> format:', fmt)
  }

  static isSupported(): boolean {
    const nav: any = (globalThis as any).navigator
    return !!(nav && nav.gpu)
  }

  createCommandEncoder(): GpuCommandEncoder {
    const self = this as any
    return new WebGPUCommandEncoder(this.device, this.queue, this.canvasContext, this.canvasFormat || 'bgra8unorm', {
      basicPipeline: this.basicPipeline,
      meshPipeline: this.meshPipeline,
      meshCache: this.meshCache,
      debug: this.debug,
      getView: () => self.getOrCreateView(),
      getDepthView: (w: number, h: number) => self.getOrCreateDepthView(w, h),
      getPipelineForState: (state: any) => self.getPipelineForState(state)
    })
  }

  getOrCreatePipeline(desc: PipelineDescriptor): RenderPipeline {
    // Stub: create a regular RenderPipeline mirror for compatibility
    return new RenderPipeline(desc)
  }
}

// Minimal WGSL pipeline for proof-of-life; not wired to mesh drawing yet.
(WebGPUBackend.prototype as any).initBasicPipeline = function initBasicPipeline(this: any) {
  try {
    const device: any = this.device
    const format: string = this.canvasFormat || 'bgra8unorm'
    if (!device || !device.createShaderModule || !format) return
    const vs = device.createShaderModule({
      code: `@vertex fn vs_main(@builtin(vertex_index) VertexIndex : u32) -> @builtin(position) vec4f {
        var pos = array<vec2f,3>(vec2f(-1.0,-1.0), vec2f(3.0,-1.0), vec2f(-1.0,3.0));
        let p = pos[VertexIndex];
        return vec4f(p, 0.0, 1.0);
      }`
    })
    const fs = device.createShaderModule({
      code: `@fragment fn fs_main() -> @location(0) vec4f {
        return vec4f(0.0, 0.0, 0.0, 1.0);
      }`
    })
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: { module: vs, entryPoint: 'vs_main' },
      fragment: { module: fs, entryPoint: 'fs_main', targets: [{ format }] },
      primitive: { topology: 'triangle-list' }
    })
    this.basicPipeline = pipeline
  } catch {
    // ignore if unsupported
  }
}

;(WebGPUBackend.prototype as any).initMeshPipeline = function initMeshPipeline(this: any) {
  try {
    const device: any = this.device
    const format: string = this.canvasFormat || 'bgra8unorm'
    if (!device || !device.createShaderModule || !format) return
    const vs = device.createShaderModule({
      code: `struct Uniforms {
        view : mat4x4<f32>,
        proj : mat4x4<f32>,
        model : mat4x4<f32>,
      };
      @group(0) @binding(0) var<uniform> u : Uniforms;
      struct VSIn {
        @location(0) position : vec3f,
        @location(1) normal : vec3f,
        @location(2) uv : vec2f,
      };
      @vertex fn vs_main(input: VSIn) -> @builtin(position) vec4f {
        let mvp = u.proj * u.view * u.model;
        return mvp * vec4f(input.position, 1.0);
      }`
    })
    const fs = device.createShaderModule({
      code: `@fragment fn fs_main() -> @location(0) vec4f {
        return vec4f(0.8, 0.8, 0.9, 1.0);
      }`
    })
    const pipeline = device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: vs,
        entryPoint: 'vs_main',
        buffers: [
          {
            arrayStride: 32,
            attributes: [
              { shaderLocation: 0, offset: 0, format: 'float32x3' },
              { shaderLocation: 1, offset: 12, format: 'float32x3' },
              { shaderLocation: 2, offset: 24, format: 'float32x2' }
            ]
          }
        ]
      },
      fragment: { module: fs, entryPoint: 'fs_main', targets: [{ format }] },
      primitive: { topology: 'triangle-list' },
      depthStencil: undefined
    })
    this.meshPipeline = pipeline
  } catch {
    // ignore if unsupported
  }
}

;(WebGPUBackend.prototype as any).getOrCreateView = function getOrCreateView(this: any) {
  if (this.currentView) return this.currentView
  if (!this.canvasContext || !this.device) return undefined
  try {
    const view = this.canvasContext.getCurrentTexture?.().createView?.()
    if (view) {
      this.currentView = view
      if (!this.rafScheduled && typeof requestAnimationFrame === 'function') {
        this.rafScheduled = true
        requestAnimationFrame(() => { this.currentView = undefined; this.rafScheduled = false })
      }
      return view
    }
  } catch {}
  return undefined
}

;(WebGPUBackend.prototype as any).getOrCreateDepthView = function getOrCreateDepthView(this: any, width: number, height: number) {
  if (!this.device) return undefined
  const w = Math.max(1, Math.floor(width))
  const h = Math.max(1, Math.floor(height))
  if (!this.depthTexture || !this.depthSize || this.depthSize.width !== w || this.depthSize.height !== h) {
    this.depthTexture = this.device.createTexture({
      size: { width: w, height: h, depthOrArrayLayers: 1 },
      format: this.depthFormat || 'depth24plus',
      usage: 0x10 // RENDER_ATTACHMENT
    })
    this.depthSize = { width: w, height: h }
  }
  return this.depthTexture.createView()
}

;(WebGPUBackend.prototype as any).getPipelineForState = function getPipelineForState(this: any, state: any) {
  if (!this._wgpuPipelineCache) this._wgpuPipelineCache = new Map()
  const key = `${state.cullMode}|${state.depthTest}|${state.depthMask ? 1 : 0}|${state.blendMode}|${(state.colorMask||[]).join('')}`
  let p = this._wgpuPipelineCache.get(key)
  if (p) return p
  const device: any = this.device
  if (!device) return this.meshPipeline || this.basicPipeline
  const format = this.canvasFormat || 'bgra8unorm'
  let blend: any = undefined
  switch (state.blendMode) {
    case 'Additive':
      blend = { color: { srcFactor: 'one', dstFactor: 'one', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one', operation: 'add' } }
      break
    case 'Transparent':
      blend = { color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha', operation: 'add' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha', operation: 'add' } }
      break
  }
  const cm = (state.colorMask || [true, true, true, true])
  let writeMask = 0
  if (cm[0]) writeMask |= 0x1
  if (cm[1]) writeMask |= 0x2
  if (cm[2]) writeMask |= 0x4
  if (cm[3]) writeMask |= 0x8
  if (writeMask === 0) writeMask = 0xF
  const depthEnabled = state.depthTest && state.depthTest !== 'None'
  const depthCompareMap: any = { 'Never':'never','Always':'always','Equal':'equal','NotEqual':'not-equal','Less':'less','LessEqual':'less-equal','Greater':'greater','GreaterEqual':'greater-equal' }
  const depthDesc: any = {
    format: this.depthFormat || 'depth24plus',
    depthWriteEnabled: depthEnabled ? !!state.depthMask : false,
    depthCompare: depthEnabled ? (depthCompareMap[state.depthTest] || 'less-equal') : 'always'
  }
  const cullMode = state.cullMode === 'Front' ? 'front' : state.cullMode === 'Back' ? 'back' : 'none'
  const vsModule = this._meshVS || (this._meshVS = device.createShaderModule({
    code: `struct Uniforms { view: mat4x4<f32>, proj: mat4x4<f32>, model: mat4x4<f32>, };
           @group(0) @binding(0) var<uniform> u : Uniforms;
           struct VSIn { @location(0) position: vec3f, @location(1) normal: vec3f, @location(2) uv: vec2f };
           @vertex fn vs_main(input: VSIn) -> @builtin(position) vec4f { let mvp = u.proj * u.view * u.model; return mvp * vec4f(input.position, 1.0); }`
  }))
  const fsModule = this._meshFS || (this._meshFS = device.createShaderModule({ code: `@fragment fn fs_main() -> @location(0) vec4f { return vec4f(0.8,0.8,0.9,1.0); }` }))
  p = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: vsModule,
      entryPoint: 'vs_main',
      buffers: [ { arrayStride: 32, attributes: [
        { shaderLocation: 0, offset: 0, format: 'float32x3' },
        { shaderLocation: 1, offset: 12, format: 'float32x3' },
        { shaderLocation: 2, offset: 24, format: 'float32x2' }
      ] } ]
    },
    fragment: { module: fsModule, entryPoint: 'fs_main', targets: [ { format, blend, writeMask } ] },
    primitive: { topology: 'triangle-list', cullMode },
    depthStencil: depthDesc
  })
  this._wgpuPipelineCache.set(key, p)
  return p
}
