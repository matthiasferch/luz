# Repository Guidelines

## Project Structure & Module Organization
The workspace is split into TypeScript workspaces under `modules/`. Core gameplay logic lives in `modules/core`, physics primitives and collision routines reside in `modules/physics`, rendering helpers sit in `modules/graphics`, and shared math utilities are in `modules/vectors` and `modules/utilities`. The test harness is isolated in `modules/tests`, while distributable entry points are surfaced through the root `index.ts`. Asset references (meshes, textures) belong under `images/`.

## Build, Test, and Development Commands
Use `npm run build` from the repository root to clean and bundle via Webpack. Hot reloading during local development is available with `npm run watch`, which rebuilds the bundle on file changes. Execute physics and integration tests with `npm test`, which delegates to `npm --prefix modules/tests run test` (Mocha + ts-node). When working only on the test package, run `npm run test` inside `modules/tests/` for faster iteration.

## Coding Style & Naming Conventions
Code is written in TypeScript with two-space indentation and trailing commas omitted. Keep class names in PascalCase (`RigidBody`) and local variables/functions in camelCase. Variable names should not be truncated (`maximumVelocity` instead of `maxVelocity`). Prefer explicit return types on public APIs. The codebase relies on vector math helpers; import from `@luz/vectors` rather than relative paths. Run `npx eslint .` (configured in `modules/tests`) before submitting to ensure style compliance.

## Testing Guidelines
Tests are authored with Mocha and Chai in `modules/tests/*.test.ts`. Name specs after the subsystem under test (e.g., `physics.test.ts`). Each new feature should include unit coverage and, when applicable, regression cases that exercise the relevant `Scene` or `Volume` behavior. Run `npm test` prior to every pull request; tests must pass without relying on global state.

## Commit & Pull Request Guidelines
Recent history favors concise, capitalized imperative subjects (e.g., `Improve collision damping with help of Codex`). Keep commits focused and mention the subsystem touched in the subject. Pull requests should outline motivation, summarize code changes, note any follow-up work, and link tracking issues.
