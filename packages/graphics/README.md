# Graphics services

`SceneRenderer` renders an already updated `Scene`. Construct it with a caller-owned
`RenderBackend`, a `ModelCompiler`, and an image decoder. The engine bundles its GLSL
sources, render pipelines, noise texture and reflectance lookup. It does not fetch
editor-hosted assets. Applications still supply scene, material and environment assets.

```ts
const resources = new ModelManager(backend, { resolveSurface })
await resources.prepareScene(scene)

const renderer = await SceneRenderer.create({
  backend,
  models: resources.compiler,
  decodeImage,
  signal: requests.signal
})
const diagnostics = new DebugRenderer(backend)
const debugSettings = createDebugSettings()
debugSettings.areModelBoundingBoxesVisible = true

// The host owns scheduling, canvas dimensions, camera aspect and simulation.
scene.update(deltaTime)
const frame = renderer.render(scene, { camera, target, time })
diagnostics.render(scene, camera, debugSettings, frame, pixelRatio)
```

The host image decoder receives a `Blob` and optional `AbortSignal` and returns a
`TexImageSource`. The optional [`@luz/browser` package](../browser/README.md) provides `decodeImage`
and `AnimationLoop`; applications can use them or supply their own adapters. Neither
the renderer nor the loaders start loops or select a browser decoder automatically.
`ImageLoader` accepts that decoder, a base URL and an optional binary reader.
`loadImage(path)` returns a host-decoded image for material textures; `loadSource(path)`
returns an `ImageSource` containing an image, decoded HDR pixels, or a KTX container.
Both methods cache CPU sources and evict failed requests for retry. `beginReload()`
and `clear()` cancel pending requests and reset those caches.

`EnvironmentLoader` borrows an `ImageLoader`. Its `load(definition)` method assembles
irradiance, radiance, optional sky, and rotation into `Environment`. Share the
image loader with material loading; the host owns its cache and cancellation lifecycle.
Pass the result to `renderer.setEnvironment(sources)`; GPU replacement is atomic on
allocation failure. `setEnvironment(null)` installs an empty environment.
`EntityLoader` resolves environment paths relative to their scene document.
Scene documents use `EnvironmentDefinition` from formats; `Scene.environment` keeps
those references with a required, normalized rotation. The graphics `Environment`
contains loaded sources and is never stored in the serialized scene.

Use `setRenderingSetting`, `setAntialiasingMode` and `setEnvironmentSetting` to update
rendering. Call `invalidateHistory()` after animation seeks, resets, or camera cuts.
Scene/camera replacement, visibility changes, resizing and settings changes invalidate
history automatically. Rendering restores the caller's unjittered camera projection,
including when a pass throws.

`FrameResult` contains dimensions, culling diagnostics, light batches, depth and its
jitter offset. GPU handles and light batches are borrowed until the next render, resize
or destruction. Consume them in the same frame. GPU diagnostics run after presentation
and have independent resources and settings. HTML annotations, text placement, legends,
timers, input and UI state belong to the application.

Model documents store each mesh's box as `boundingBox: BoundingBoxDefinition`.
`BoundingBoxCalculator` calculates a model's current world-space box, including its
skeletal pose. Projection helpers return a `ProjectedRectangle` with minimum and
maximum X/Y coordinates. Debug visibility uses `areModelBoundingBoxesVisible` and
`areBodyBoundingBoxesVisible`.

Destroy the debug renderer and scene renderer before their borrowed backend. Their
idempotent `destroy()` methods release their own allocations; model resources and the
destination target remain caller-owned. `ModelManager.releaseScene()` releases compiled
models, `beginReload()` refreshes source/compiler generations, and `destroy()` cancels
outstanding work and releases the facade's resources. Existing queues, pipelines,
compilers and `FrameRenderer` remain available for custom renderers.

Material compilation separates graph validation, CPU shader generation, topology
keys, and asynchronous texture binding. `GraphCompiler` coordinates these stages
and owns the resulting bindings; `MaterialCompiler` assembles and tracks render
materials. Constants and image paths remain outside topology keys so materials can
share pipeline programs. Failed or invalidated binding requests release acquired
textures before rejecting. Static material shader helpers are authored as `.glsl`.

Shaders remain `.glsl` files for editor tooling. Both Webpack builds use `asset/source`,
and Node/Vitest tests load the same assets. `npm run validate:shaders` compiles the shared
catalog. Pipeline assets use `.pipeline.json` and `pipeline.schema.json`; their document
type is `PipelineDefinition`. Pipeline documents contain shader selection and render
state only. Pass execution uses `RenderPass` and `executeRenderPass`; targets,
scissors and `clear: { color, depth, stencil }` belong to each invocation. `RenderQueue`
accepts these through its context, and `FrameRenderer` accepts per-stage `clear`
options. Move old `clearColor`, `clearDepth` and `clearStencil` pipeline fields into
these pass options; pipeline schemas reject them. Omitting `clear` preserves attachments.
The independent browser fixture is run after `npm run build:engine` with
`npm run test:gpu:smoke` from the repository
root; it imports only the engine bundle and rejects external built-in asset requests.
