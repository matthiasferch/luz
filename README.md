<img src="docs/assets/logo.png" style="width: 260px" />

luz (pronounced [ËˆluÎ¸] or [Ëˆlus], Spanish for _light_) is a 3D game engine for the web, written from scratch in Typescript and WebGL 2.0.

It features dynamic lighting and shadows, visibility determination and hierarchical space partitioning, collision detection and response, and rigid-body simulation with continuous collision detection.

![luz editor preview](preview.jpg)

## Overview

The engine bundle includes its runtime dependencies, shaders and lookup textures.

Applications supply assets and their user interface. Optional [browser adapters](packages/browser/README.md)
provide image decoding and an animation loop. Custom decoders and scheduling are supported.

## Getting started

Use Node.js 24.8 or newer in the 24.x line (`.nvmrc`) and install dependencies from the repository root:

```sh
npm ci
npm run build:engine:production
```

The resulting `dist/` directory contains an ES module bundle (`index.mjs`), portable
TypeScript declarations, and a package entry point. Import the classes and helpers
you need with named imports, such as `import { Scene, Camera } from 'luz'`.

Browsers can resolve `luz` through an import map. Bundlers and Node.js use the package
exports. The `@luz/*` directories are internal workspace packages. Separate
npm package publishing is not (yet) supported.

## Releases and studio

Download the versioned engine package and Blender extension from [GitHub Releases](https://github.com/matthiasferch/luz/releases). The engine package contains the runtime, TypeScript declarations, scene schemas, and third-party notices. Install the release tarball with npm and import from `luz`.

Run `npm run build:release` to build both artifacts locally in `dist/`. Push a version tag matching the root package version (for example `v0.1.0`) to publish them after the engine and browser checks pass.

Open [luz studio](https://studio.luzjs.dev/) to preview a Blender export or explore the curated demo scenes.

## Development checks

For the complete source checks, install Python, PowerShell 7 (`pwsh`), and `tar`,
then install the pinned Python formatter:

```sh
python -m pip install ruff==0.12.12
npm run check
```

This checks formatting, lint, source and test types, shaders, unit/integration tests,
builds, and the production distribution in an isolated consumer.

Browser GPU tests and generated Blender fixtures have a [separate guide](tests/browser/README.md).

## Blender extension

The [Blender extension](integrations/blender/README.md) exports scenes and reusable entities into the engine. Its guide covers installation and basic usage.

## License and attribution

The engine, supporting project code, generated engine textures and logo are licensed under the [MIT License](LICENSE).

The Blender extension retains its [GPL-3.0-or-later license](integrations/blender/luz_exporter/LICENSE).

The engine textures are generated reproducibly by [repository tooling](tooling/textures/README.md).
Run `npm run validate:textures` to verify their contents.
