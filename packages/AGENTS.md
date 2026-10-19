# Repository Guidelines

## Scope and workspace layout

This file applies to the TypeScript engine packages. The repository root also contains
the Blender extension in `integrations/blender/luz_exporter/` and the Vue/WebGL editor in `apps/editor/`.
Changes to serialized components, model or material formats, loaders, rendering
contracts, or public exports usually require corresponding exporter, schema, asset,
and editor updates.

The engine is organized as workspace packages under `packages/`:

- `browser` owns optional frame scheduling and image decoding adapters. It has no
  runtime package dependencies; other engine packages must not depend on it.
- `core` owns entities, transforms, cameras, lights, reflectors, object animation
  and its mixer, shared pose/transition types, and neutral frustum and bounding-box contracts.
- `formats` owns shared serialized definitions, geometry descriptors, playback and
  motion types, and JSON schemas. It has no runtime package dependencies.
- `physics` owns bodies, colliders and volumes, broadphase and narrowphase collision
  detection, contact solving, queries, sleeping, continuous motion, and `PhysicsWorld`.
- `scene` owns scene serialization, entity orchestration, fixed-step simulation,
  animation advancement, reset state, and render interpolation.
- `graphics` owns render definitions and runtime resources, model/entity loading,
  model components, resource compilers, material-graph compilation, render queues and
  pipelines, scene rendering, environment services, GPU diagnostics, and the WebGL2 backend.
- `math` and `serialization` provide math, pooling, decorators, serialization, uniform
  metadata, and other shared infrastructure.
- `tests` sits outside the runtime packages and separates focused unit coverage from
  cross-package integration coverage and deterministic fixtures.

Public package APIs are exposed through package barrels (`index.ts`, or
`src/index.ts` for `formats`) and the root `index.ts`. Keep serialized definitions
separate from transient CPU/GPU resources:
loaders perform I/O and validation, while compilers realize already loaded data.
The root facade lists exports explicitly. Public API tests compare resolved symbols
across barrels and the reviewed `tests/fixtures/public-exports.json` inventory;
update that fixture deliberately when the API changes. Source dependency tests
reject undeclared dependencies, cross-package deep imports, and package cycles.
Type-only dependencies also belong in package manifests.

## Build, test, and validation commands

Run commands from the repository root unless noted otherwise:

- `npm run check` runs formatting, lint, type checking, shader validation, tests,
  and builds for the workspace, matching the quality workflow in CI.
- `npm test` runs the Mocha/ts-node engine suite and the editor's Node and Vue/Vitest
  suites. Use `npm --workspace @luz/tests test` for the engine suite alone.
- `npm run build` builds both the engine and editor. `npm run build:engine` removes
  root `dist/` and builds the engine ES module bundle and declarations with Webpack.
- `npm run watch` rebuilds the engine while source files change.
- `npm run typecheck` checks engine TypeScript and editor Vue/TypeScript.
- Engine tests also participate in `npm run typecheck`; use typed test doubles
  and runtime assertions for narrowing instead of file-wide type suppression.
- `npm run lint` checks engine, tests, tooling, and editor JavaScript/TypeScript/Vue,
  then runs `npm run lint:python` for Blender Ruff checks and bytecode compilation.
- `npm run validate:shaders` checks shader naming, layout, and compilation.

For focused editor checks, run these from `apps/editor/` (already included in the
corresponding root commands):

- `npm test` for the Node integration and Vue/Vitest suites.
- `npm run typecheck` for Vue and TypeScript checking.
- `npm run build` for the editor Webpack bundle.

`npm run build` uses development mode. `npm run build:engine:production` emits an
optimized engine bundle with an external source map. Both engine builds prepare
portable declarations and a local package entry point. `npm run test:distribution`
checks the production output in an isolated consumer and is included in `npm run check`.

Exporter-facing changes should run `npm run lint:python` and the relevant Blender
background fixtures under `integrations/blender/tests/`. Set the generated manifest
paths in `LUZ_BLENDER_FIXTURE`, `LUZ_BLENDER_ANIMATION_FIXTURE`,
`LUZ_BLENDER_OBJECT_ACTIONS_FIXTURE`, or `LUZ_BLENDER_SKELETAL_FIXTURE` as appropriate
when running engine reload tests; those tests are skipped when their variable is
unset. Blender export fixtures and GPU browser runners are separate from the
default `npm run check` and run in the browser CI job. Generate the synthetic rig
with `npm run test:fixture:skeletal`, build the engine, and run `npm run test:gpu`.
Engine browser suites live in `tests/browser`; `npm run test:gpu:smoke` covers
scene rendering and GPU diagnostics without Blender. See `integrations/blender/README.md` for extension
installation, fixture commands, and validation.
Do not use a real authored scene as a test output target.

## Architecture and compatibility rules

- Keep pipeline shader/state definitions separate from render-pass execution.
  Targets, scissors and clear commands belong to `RenderPass`/queue context or
  per-stage frame options. Pipeline binding never clears attachments.
- Rendering effects own their GPU allocations through independent resource scopes.
  Supply stable services at construction and changing scene, camera, texture, and
  presentation inputs through `beginFrame`. The scene renderer coordinates resize
  and execution order; target allocation must not invoke another effect's cleanup.
- Scene rendering reuses one shadow map per light across main, reflection, and
  depth-of-field backing views within a frame. Refresh maps on the next frame;
  release them when their lights disappear or shadows are disabled. Allocate
  depth-of-field backing targets only when visible geometry can produce foreground
  blur, using conservative posed bounding boxes for the decision.
- Verify rendering orchestration and resource lifetimes through executed behavior
  and backend spies. Source assertions are reserved for shader, format, and
  architecture contracts; do not concatenate implementation files for tests.

- Preserve serialization discriminators, decorator metadata, public barrel exports,
  and relative reference resolution when changing public types.
- Register every discriminated serializable class with an explicit stable tag, such as
  `@Register('light')`, and add round-trip coverage for new serialized fields. Tags do
  not derive from class names. Deserialization requires matching tags and enforces the
  declared component/collider family. Runtime-only state must not leak into JSON.
- Materials use required, versioned graphs. Keep render metadata outside the graph and
  keep constants/textures bindable as uniforms so equivalent graph topologies can
  share compiled programs.
- Material compilation proceeds through validation, CPU shader-source generation,
  topology-key creation, and transactional texture binding. Source generation must
  not allocate GPU resources. Keep static material shader helpers in `.glsl` files;
  release successful bindings after partial failures or generation invalidation.
- Models may use validated binary `.geometry` sidecars or the supported inline fallback.
  Preserve typed-array views, index formats, bounding boxes, and the separation between loading
  and GPU compilation.
- Mesh arrays and resolved binary buffers borrow their input storage. After editing that
  storage, call `mesh.invalidateGeometry()` before recompiling the model or reading debug
  bounding boxes. Both caches use `geometryRevision`; revisions never enter serialized documents.
  Model mesh collections are readonly views. Supply initial meshes through `ModelOptions`,
  and use `setMesh`/`removeMesh` for later membership changes. Compiled assets remain shared
  until an owning model changes, and a failed replacement retains the previous resources.
- Model animation maps contain string references to individual `skeletalAnimation`
  documents with `schemaVersion: 1`; embedded skeletal clips are rejected. Load
  references relative to the model document, or the containing entity/scene for
  inline models. Cache source documents per URL and reload generation, evict failed
  requests for retry, and create independent playback instances. Model serialization
  writes references, and model fingerprints include resolved clip contents.
- Object animation components use `schemaVersion: 2`, explicit `playback` and
  `isAutoplayEnabled`, and transform tracks. Entities own their animation mixers;
  playback state and overrides are not serialized. Object tracks may omit channels;
  skeletal tracks require translation, rotation, and scale.
- `TransformAnimation` and `SkeletalAnimation` retain the `animation` and `skeletalAnimation`
  document tags. `Entity.animationMixer` and `Model.animationMixer` implement
  `PlaybackController`: `play`, `setMix`, `setPlaybackMode`, `setSpeed`, `pause`,
  `resume`, `stop`, and `seekProgress`. Mix options hold `transitionDuration` in seconds
  and `isRestartEnabled`. Playback views are readonly; runtime states are `playing`,
  `paused`, and `stopped`, separate from the `loop`/`once` playback modes.
- Serialized bodies require `motionType` to be `dynamic`, `static`, or `kinematic`;
  missing modes and `auto` are rejected. Dynamic bodies require positive mass.
  `new Body()` defaults to dynamic with mass 1; static and kinematic bodies have
  zero inverse mass regardless of their stored mass.
- `Scene` owns fixed-step simulation state. Physics changes must preserve deterministic
  stepping, sleeping/waking behavior, stable contact identifiers, and per-scene world
  isolation.
- Ray helpers use `intersectRayWith…` names and return `RayIntersection` with `point`,
  an outward world-space surface `normal`, and `distance` in world units. Ray-pair
  intersections use the directions' normalized cross product as their normal. Queries
  validate and normalize ray directions, including directions edited after construction.
  `QueryFilter.collisionMask` applies to overlaps and sweeps; `RaycastOptions` additionally
  accepts `maximumDistance`. Sweep fractions remain in the range zero to one.
- Contact `Collision` values use `point` and `penetrationDepth` in world units, with
  normals from the first collider toward the second. Raw pair functions and the
  dispatcher follow the same convention; reversing a pair reverses its normal.
  Manifolds use their body order, with a null second body representing a static collider.
- Every `PhysicsWorld` owns its solver; standalone callers create a `CollisionSolver`.
  Cached manifolds and polygon vertex/edge/triangle collections expose readonly views.
  Use `Polygon.setVertices` or its validating `vertices` setter to replace geometry;
  treat vectors borrowed from those views as read-only. Replacement copies the input
  and rebuilds the edges, normal, and triangles before queries resume.
- Keep workspace dependencies acyclic. `core` must not depend on `graphics`, `physics`,
  or `scene`; physics may depend on core, scene may depend on core and physics, and
  graphics may depend on all three. Shared serialized types belong in `formats`,
  which must remain independent of those runtime packages.
- Rendering changes must account for all material-aware passes, mirrored transforms,
  component visibility, temporal-history invalidation, viewport resizing, and resource
  release.
- `BufferManager` owns dynamic `VertexBuffer` allocations. Updates replace the populated
  data range, grow capacity only when needed, and retain capacity on empty updates.
  `PrimitiveManager.create(PrimitiveOptions)` owns its vertex array and borrows the
  buffers in its attribute bindings; destroy the primitive before releasing those buffers.
  Its mesh overload continues to own the buffers it creates. Generic primitives support
  attribute divisors and optional instance counts. Use `RenderBackend.draw` for procedural
  draws with front-face state and statistics; overlay segment layouts and line/cone
  shaders belong in `graphics/debug`, using the generic backend primitives.
- `SceneRenderer` consumes an already updated scene and borrows its backend, model
  compiler, and destination target. It owns internal targets, effects, environment
  textures, and temporal history. `DebugRenderer` independently owns GPU diagnostics.
  Rendering and diagnostic modules must remain independent of DOM and editor code.
  Keep annotations, UI layout, input, canvas sizing, and worker creation in applications.
  Optional frame scheduling and browser image decoding helpers live in `@luz/browser`;
  rendering, diagnostic, and loading services must not import those adapters or start loops.
  Hosts choose when to schedule frames and advance simulation. Preserve `.glsl` source files;
  bundle built-in assets through the shared shader catalog and validate that catalog.
- Light documents require `lightType: "spot" | "directional" | "point"`. Spotlights
  require `coneAngle` and `coneFalloff` in degrees; other light documents reject both fields and
  omit them during serialization. Lights own a runtime
  `shadowCamera`; `shadowCameras` exposes one view for spot/directional lights or
  six axis-aligned views for point lights. Camera/projector `fieldOfView` is the vertical angle
  in degrees. Shadow passes and caster culling use
  these views. Point shadows use a 3-by-2 atlas in each light's depth texture, with
  independent viewport/scissor tiles. Point range is spherical (`range`, world units) and
  independent of entity rotation and scale. Directional illumination
  is unbounded, while `shadowSize` and `clipPlanes` define its orthographic shadow
  coverage. Directional lights bypass finite light culling and use full-viewport
  scissors. Scale must not affect their direction or shadow coverage.

## Coding style and naming

Use TypeScript with two-space indentation, no semicolons, and descriptive camelCase
identifiers. Classes and exported types use PascalCase. Math follows the same rules,
with the native typed-array and component exceptions in the root `AGENTS.md`. Follow the workspace-wide
naming and comment rules in the root `AGENTS.md`, including for GLSL: callable names
are verb phrases except for `on`-prefixed event handlers, class and interface names
contain at most two conceptual nouns excluding official technology and platform
qualifiers, and ordinary words are written in full except for conventional color/vector
components and coordinate indices. Comments are limited to essential reasons,
invariants, compatibility constraints, and mathematical choices. Precede every comment block with
an empty line unless it begins on the first line of a file or code block.
Prefer explicit return types on public APIs and type-only imports when a dependency is
not needed at runtime.

Constructor input contracts use explicit options or serialized definitions, never
`Partial` of runtime classes. Formats definitions must contain plain document data,
without methods, resource handles, playback state, or derived caches. Engine lint
rejects explicit `any`, and compiler-based tests check these definition boundaries.

Math copy direction is explicit: `clone()` allocates, `copyTo(destination)` writes
the destination, and `copyFrom(source)` updates the receiver. Omitted destinations
allocate except where an instance method explicitly mutates its receiver. Preserve
native typed-array `length` and use `magnitude` for vector length. Use `Tuple2`,
`Tuple3`, `Tuple4`, and `Tuple16` from `formats` for numeric tuple contracts. Document
units briefly at declarations instead of adding unit suffixes to identifiers.

Write the project name `luz` in lowercase in prose, UI text, logs, and comments. Preserve
uppercase protocol and tooling identifiers such as the `LUZG` binary magic and `LUZ_*`
environment variables.

Import shared packages through their `@luz/*` names instead of reaching across package
directories. Export intentional public APIs from the appropriate package barrel; keep
backend-specific helpers internal unless consumers genuinely need them. Follow existing
`Serialize`, `Register`, and `Uniform` patterns rather than adding parallel metadata
mechanisms.

## Testing expectations

Place focused engine tests in `tests/unit` and cross-package tests in `tests/integration`.
Name them after the subsystem or regression. New behavior needs focused unit coverage plus an integration regression when
it crosses scene, physics, loader/compiler, serialization, or rendering boundaries.

Keep tests deterministic and independent of global state. Use small checked-in fixtures;
do not commit investigation logs or temporary repro scripts. Expensive GPU/browser checks
belong in the editor's dedicated browser runners, while Blender export behavior belongs in
the background fixtures under `integrations/blender/tests/`.

Before handing off a change, run the narrowest relevant tests while iterating and the full
engine suite at the end. Report any checks that could not run rather than silently omitting
them.

## Assets and repository hygiene

Do not commit `dist/`, `node_modules/`, `.tmp/`, Python caches, npm output logs, Blender
source or backup files, export-status markers, or obsolete generated exports. Never add
BlendKit or Poliigon content. Runtime editor assets live under `apps/editor/public/assets`;
preserve active scene references and do not bulk rewrite or delete user-authored assets
without verifying reachability from the scene catalog.

Track reachability from scenes and reusable entities through models to individual
animation documents. Manually named models also preserve their animation references.
The Blender exporter publishes animation documents atomically before referencing
models and scene/entity documents. Generated clip filenames use the full SHA-256
digest of canonical content, excluding clip aliases and `$schema`.

Cleanup runs only after successful publication and removes unreachable generated
model/geometry pairs and animation documents inside their managed directories.
Preserve manually named assets. Skip cleanup when a required document cannot be
read or validated.

## Git and review practices

Preserve unrelated working-tree changes. Do not commit, merge, push, rewrite history, or
delete user-authored source assets unless the user explicitly requests it. Use concise,
imperative commit subjects that describe the subsystem and outcome.

Pull requests should explain motivation, summarize public or serialized compatibility
effects, list verification performed, and identify deferred work. Never include credentials,
machine-specific paths, generated reports, or temporary diagnostic evidence.
