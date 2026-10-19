# Browser rendering tests

These suites exercise WebGL2 without importing the editor. Run from the repository root:

```sh
npm ci
npm run build:engine
npm run test:gpu:smoke
```

Set `CHROME_PATH` to a Chrome or Chromium executable if automatic detection does not
find it. Each run uses an isolated temporary browser profile and SwiftShader.

The complete suite also exercises exported skeletal animation. Install Blender 5.0
or newer, set `BLENDER_PATH` if necessary, and generate the synthetic fixture:

```sh
npm run test:fixture:skeletal
npm run test:gpu
```

The fixture writes only to `.tmp/skeletal-fixture`; it does not require authored
Blender files. To test a separately exported rig, set `LUZ_SKELETAL_DIRECTORY` to
its fixture directory. Run one suite with `node tests/browser/run.cjs <suite>`.

CI generates the fixture, compares exported poses with Blender's reference, builds
the engine, and runs every browser suite. Missing skeletal assets fail the run.

`npm run test:distribution:gpu` runs the engine-rendering suite against an isolated
copy of the production distribution, including browser adapters and bundled
resources. CI runs this after the engine GPU suites.
