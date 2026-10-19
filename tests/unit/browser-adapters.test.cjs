require('ts-node').register({ compilerOptions: { module: 'CommonJS' } })

const { it } = require('node:test')
const assert = require('node:assert/strict')
const { AnimationLoop, decodeImage } = require('@luz/browser')

const replaceGlobal = (context, name, value) => {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name)

  Object.defineProperty(globalThis, name, { configurable: true, writable: true, value })
  context.after(() => {
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor)
    } else {
      delete globalThis[name]
    }
  })
}

const createScheduler = (context) => {
  const callbacks = new Map()

  let nextId = 0

  replaceGlobal(context, 'requestAnimationFrame', (onFrame) => {
    const id = nextId++

    callbacks.set(id, onFrame)

    return id
  })
  replaceGlobal(context, 'cancelAnimationFrame', (id) => callbacks.delete(id))

  const advanceFrame = (timestamp) => {
    const [id, onFrame] = callbacks.entries().next().value

    callbacks.delete(id)
    onFrame(timestamp)
  }

  return { callbacks, advanceFrame }
}

it('does not require browser globals until starting a loop or decoding an image', () => {
  assert.equal(typeof window, 'undefined')
  assert.equal(typeof Image, 'undefined')

  const loop = new AnimationLoop(() => {})

  loop.stop()
  assert.equal(loop.isRunning, false)
  assert.throws(() => loop.start(), /requestAnimationFrame/)
  assert.equal(loop.isRunning, false)
})
it('schedules one frame, reports seconds, cancels frame zero and resets timing on restart', (context) => {
  const { callbacks, advanceFrame } = createScheduler(context)
  const frames = []
  const loop = new AnimationLoop((time, elapsedTime) => frames.push([time, elapsedTime]))

  loop.start()
  loop.start()
  assert.equal(callbacks.size, 1)
  loop.stop()
  loop.stop()
  assert.equal(callbacks.size, 0)
  loop.start()
  advanceFrame(0)
  advanceFrame(250)
  advanceFrame(2250)
  assert.deepEqual(frames, [
    [0, 0],
    [0.25, 0.25],
    [2.25, 2]
  ])
  assert.equal(callbacks.size, 1)
  assert.equal(loop.isRunning, true)
  loop.stop()
  loop.start()
  advanceFrame(5000)
  assert.deepEqual(frames.at(-1), [5, 0])
  loop.stop()
})
it('allows stopping or restarting inside the callback without duplicate scheduling', (context) => {
  const { callbacks, advanceFrame } = createScheduler(context)

  let frameCount = 0

  const loop = new AnimationLoop((_time, elapsedTime) => {
    frameCount++

    loop.stop()

    if (frameCount === 1) {
      loop.start()
    } else {
      assert.equal(elapsedTime, 0)
    }
  })

  loop.start()
  advanceFrame(1000)
  assert.equal(callbacks.size, 1)
  advanceFrame(2000)
  assert.equal(callbacks.size, 0)
  assert.equal(loop.isRunning, false)
})
it('stops and propagates callback errors, including after a reentrant restart', (context) => {
  const { callbacks, advanceFrame } = createScheduler(context)
  const failure = new Error('render failed')
  const loop = new AnimationLoop(() => {
    loop.stop()
    loop.start()

    throw failure
  })

  loop.start()
  assert.throws(
    () => advanceFrame(1000),
    (error) => error === failure
  )
  assert.equal(callbacks.size, 0)
  assert.equal(loop.isRunning, false)
})

const createDecoder = (context) => {
  const images = []
  const createUrl = context.mock.method(URL, 'createObjectURL', () => 'blob:image')
  const revokeUrl = context.mock.method(URL, 'revokeObjectURL', () => {})

  replaceGlobal(
    context,
    'Image',
    class {
      src = ''
      onload = null
      onerror = null

      constructor() {
        images.push(this)
      }
    }
  )

  return { images, createUrl, revokeUrl }
}

it('decodes an unattached image and releases handlers and object URLs', async (context) => {
  const { images, revokeUrl } = createDecoder(context)
  const request = decodeImage(new Blob(['image']))
  const image = images[0]

  assert.equal(image.src, 'blob:image')
  image.onload()
  assert.equal(await request, image)
  assert.equal(image.onload, null)
  assert.equal(image.onerror, null)
  assert.equal(revokeUrl.mock.callCount(), 1)
  assert.deepEqual(revokeUrl.mock.calls[0].arguments, ['blob:image'])
})
it('rejects decode failures and releases the object URL', async (context) => {
  const { images, revokeUrl } = createDecoder(context)
  const request = decodeImage(new Blob(['invalid image']))

  images[0].onerror()

  await assert.rejects(request, /Failed to decode image/)
  assert.equal(images[0].onload, null)
  assert.equal(images[0].onerror, null)
  assert.equal(revokeUrl.mock.callCount(), 1)
})
it('rejects pre-aborted and pending requests and removes cancellation listeners', async (context) => {
  const { images, createUrl, revokeUrl } = createDecoder(context)
  const controller = new AbortController()
  const reason = new Error('cancelled')
  const removeListener = context.mock.method(controller.signal, 'removeEventListener')
  const request = decodeImage(new Blob(['image']), controller.signal)

  controller.abort(reason)

  await assert.rejects(request, (error) => error === reason)
  assert.equal(images[0].src, '')
  assert.equal(images[0].onload, null)
  assert.equal(images[0].onerror, null)
  assert.equal(removeListener.mock.callCount(), 1)
  assert.equal(revokeUrl.mock.callCount(), 1)

  await assert.rejects(decodeImage(new Blob(), controller.signal), (error) => error === reason)
  assert.equal(createUrl.mock.callCount(), 1)
})
