const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { DatabaseSync } = require('node:sqlite')
const { createHash, randomUUID } = require('node:crypto')

test('publishing switches only complete owner-scoped revisions and withdraws manifest and file access together', async () => {
  const { routeRequest, validatePublication, default: worker } = await import('../tooling/studio-worker.mjs')
  const database = new DatabaseSync(':memory:')

  database.exec(readFileSync(path.join(__dirname, '../tooling/studio-schema.sql'), 'utf8'))

  const files = new Map()
  const bindings = {
    DATABASE: {
      prepare: (sql) => ({
        bind: (...values) => ({
          first: () => database.prepare(sql).get(...values),

          run: () => database.prepare(sql).run(...values),

          all: () => ({ results: database.prepare(sql).all(...values) })
        })
      })
    },
    FILES: {
      put: (key, contents) => files.set(key, contents),

      get: (key) => ({ body: files.get(key) })
    },
    ASSETS: { fetch: (request) => new Response(new URL(request.url).pathname) }
  }
  const origin = 'https://studio.luzjs.dev'
  const send = async (url, method = 'GET', body, owner = 'author', version = 0) => {
    try {
      return await routeRequest(
        new Request(origin + url, { method, body, headers: { Origin: origin, 'If-Match': String(version) } }),
        bindings,
        () => owner
      )
    } catch (error) {
      if (error instanceof Response) {
        return error
      }

      throw error
    }
  }

  assert.equal((await worker.fetch(new Request(origin + '/scenes'), bindings)).status, 401)
  assert.equal(await (await send('/')).text(), '/index.html')
  assert.equal(await (await send('/scenes')).text(), '/index.html')

  const entry = 'scenes/share.scene.json'
  const contents = '{"entities":{}}'
  const digest = createHash('sha256').update(contents).digest('hex')
  const project = '/scenes/api/projects/' + randomUUID()
  const manifest = {
    entry,
    files: [{ path: entry, size: contents.length, blocks: [digest] }],
    preset: { settings: {}, animations: [] }
  }
  const publish = (version = 0, owner = 'author') => send(project, 'PUT', JSON.stringify(manifest), owner, version)

  assert.equal((await publish()).status, 409)
  assert.equal((await send('/scenes/api/blocks/' + digest, 'PUT', 'different')).status, 400)
  assert.equal((await send('/scenes/api/blocks/' + digest, 'PUT', contents)).status, 204)

  const firstScene = await (await publish()).json()

  assert.ok(firstScene.id)

  const viewer = '/api/scene/' + firstScene.id

  assert.equal((await send(viewer)).status, 200)
  assert.equal(await (await send(viewer + '/1/' + digest)).text(), contents)
  assert.deepEqual(await (await send('/scenes/api', 'GET', undefined, 'another')).json(), [])
  assert.equal((await publish(1, 'another')).status, 409)
  assert.equal((await publish()).status, 409)

  const nextScene = await (await publish(1)).json()

  assert.equal(nextScene.id, firstScene.id)
  assert.equal((await send(viewer + '/1/' + digest)).status, 404)
  assert.equal((await send(project, 'DELETE', undefined, 'another', 2)).status, 409)
  assert.equal((await send(project, 'DELETE', undefined, 'author', 2)).status, 204)
  assert.equal((await send(viewer)).status, 404)
  assert.equal((await send(viewer + '/2/' + digest)).status, 404)
  assert.equal((await (await publish(3)).json()).id, firstScene.id)
  assert.throws(
    () =>
      validatePublication({
        ...manifest,
        files: [{ ...manifest.files[0], size: 251 * 1024 * 1024, blocks: Array(32).fill(digest) }]
      }),
    (error) => error.status === 413
  )
  database.close()
})
