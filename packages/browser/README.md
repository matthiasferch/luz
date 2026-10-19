# Browser adapters

These optional helpers are exported through `@luz/browser` and the built `luz`
package. This package has no dependency on graphics or other engine packages.
Importing it does not access browser globals or start a loop. Rendering and loading
services continue to accept application-provided adapters.

`decodeImage(blob, signal?)` structurally satisfies the graphics `ImageDecoder` contract using an unattached
`HTMLImageElement`. It rejects decoding failures and cancellation, removes event
handlers, and revokes its temporary object URL. The returned image needs no explicit
disposal. This adapter requires a browser window; workers and other environments
can supply their own decoder. It does not fetch URLs or modify the visible DOM.

`new AnimationLoop(render)` calls the synchronous callback with `(time, elapsedTime)`
in seconds. `time` is the browser animation-frame timestamp; `elapsedTime` is the
uncapped interval between callbacks and is zero on the first frame after each start.
Use `start()`, `stop()`, and the readonly `isRunning` property to manage the loop.
Repeated starts and stops are harmless. Stopping inside the callback prevents the
next frame; a thrown callback error stops the loop and propagates to the browser.

The host chooses simulation time limits and whether to render each callback. Stop
the loop before releasing its renderer. Canvas sizing, camera aspect, UI, input,
visibility policies, and simulation advancement remain application responsibilities.

```ts
import { AnimationLoop, decodeImage } from '@luz/browser'

const renderer = await SceneRenderer.create({ backend, models, decodeImage })
const loop = new AnimationLoop((time, elapsedTime) => {
  scene.update(Math.min(elapsedTime, 0.1))
  renderer.render(scene, { camera, target, time })
})

loop.start()
```
