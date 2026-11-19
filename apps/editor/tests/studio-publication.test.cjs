const { test } = require('node:test')
const assert = require('node:assert/strict')
const { readFileSync } = require('node:fs')
const path = require('node:path')
const { DatabaseSync } = require('node:sqlite')
const { createHash, randomUUID } = require('node:crypto')

async function createFixture(context) {
  const { routeRequest, cleanStorage, default: worker } = await import('../tooling/studio-worker.mjs')
  const database = new DatabaseSync(':memory:')
  const files = new Map()
  const origin = 'https://studio.luzjs.dev'

  context.after(() => database.close())
  database.exec(readFileSync(path.join(__dirname, '../tooling/studio-schema.sql'), 'utf8'))

  function prepare(sql, values = []) {
    const statement = database.prepare(sql)

    return {
      bind: (...parameters) => prepare(sql, parameters),

      first: () => statement.get(...values),

      all: () => ({ results: statement.all(...values) }),

      run: () => ({ meta: statement.run(...values) }),

      execute: () =>
        statement.columns().length ? { results: statement.all(...values) } : { meta: statement.run(...values) }
    }
  }

  const bindings = {
    DATABASE: {
      prepare,
      batch(statements) {
        database.exec('BEGIN')

        try {
          const results = statements.map((statement) => statement.execute())

          database.exec('COMMIT')

          return results
        } catch (error) {
          database.exec('ROLLBACK')
          throw error
        }
      }
    },
    SCENE_FILES: {
      put: (key, contents) => files.set(key, contents),

      get: (key) => files.get(key),

      delete: (key) => files.delete(key)
    },
    ASSETS: { fetch: (request) => new Response(new URL(request.url).pathname) }
  }
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

  const reserve = (manifest, project = randomUUID(), version = 0, owner = 'author') =>
    send('/scenes/api/projects/' + project + '/uploads', 'POST', JSON.stringify(manifest), owner, version)

  const clean = () => cleanStorage(bindings)

  const getBytes = () => database.prepare('SELECT bytes FROM studioCapacity').get().bytes

  return { database, files, bindings, origin, send, reserve, clean, getBytes, worker }
}

function createScene(contents) {
  const entry = 'scenes/share.scene.json'
  const digest = createHash('sha256').update(contents).digest('hex')
  const manifest = {
    entry,
    files: [{ path: entry, size: Buffer.byteLength(contents), blocks: [digest] }],
    preset: { settings: {}, animations: [] }
  }

  return { digest, manifest }
}

test('reserve, upload, publish and withdraw a KV-backed scene under stable owner-scoped links', async (context) => {
  const { send, reserve, bindings, worker, origin, files } = await createFixture(context)
  const project = randomUUID()
  const contents = '{"entities":{}}'
  const { digest, manifest } = createScene(contents)

  assert.equal((await worker.fetch(new Request(origin + '/scenes'), bindings)).status, 401)
  assert.equal(await (await send('/')).text(), '/index.html')
  assert.equal(await (await send('/scenes')).text(), '/index.html')
  assert.equal(
    (
      await reserve({
        ...manifest,
        files: [{ ...manifest.files[0], size: 251 * 1024 * 1024, blocks: Array(32).fill(digest) }]
      })
    ).status,
    413
  )
  assert.equal((await send('/scenes/api/blocks/' + digest, 'PUT', contents)).status, 404)
  assert.equal((await send('/scenes/api/projects/' + project, 'PUT', JSON.stringify(manifest))).status, 404)

  const reservation = await (await reserve(manifest, project)).json()
  const upload = '/scenes/api/uploads/' + reservation.id

  assert.deepEqual(reservation.missing, [digest])
  assert.equal((await send(upload, 'POST')).status, 409)
  assert.equal((await send(upload + '/' + digest, 'PUT', contents, 'other')).status, 409)
  assert.equal((await send(upload + '/' + digest, 'PUT', 'bad')).status, 400)
  assert.equal((await send(upload + '/' + digest, 'PUT', contents)).status, 204)
  assert.equal((await send(upload + '/' + digest, 'PUT', contents)).status, 204)

  const firstScene = await (await send(upload, 'POST')).json()
  const link = '/api/scene/' + firstScene.id

  assert.equal((await send(link)).status, 200)
  assert.equal(await (await send(link + '/1/' + digest)).text(), contents)
  assert.deepEqual(await (await send('/scenes/api', 'GET', undefined, 'other')).json(), [])
  assert.equal((await reserve(manifest, project, 0)).status, 409)

  const nextUpload = await (await reserve(manifest, project, 1)).json()
  const competingUpload = await (await reserve(manifest, project, 1)).json()

  assert.deepEqual(nextUpload.missing, [])
  assert.deepEqual(await (await send('/scenes/api/uploads/' + nextUpload.id, 'POST')).json(), {
    id: firstScene.id,
    version: 2
  })
  assert.equal((await send('/scenes/api/uploads/' + competingUpload.id, 'POST')).status, 409)
  assert.equal((await send(link + '/1/' + digest)).status, 404)
  assert.equal((await send('/scenes/api/projects/' + project, 'DELETE', undefined, 'other', 2)).status, 409)
  assert.equal(files.size, 1)

  const readFile = bindings.SCENE_FILES.get

  bindings.SCENE_FILES.get = () => null

  assert.equal((await send(link + '/2/' + digest)).status, 503)

  bindings.SCENE_FILES.get = readFile

  assert.equal((await send('/scenes/api/projects/' + project, 'DELETE', undefined, 'author', 2)).status, 204)
  assert.equal((await send(link)).status, 404)
  assert.equal((await send(link + '/2/' + digest)).status, 404)

  const restoredUpload = await (await reserve(manifest, project, 3)).json()

  assert.equal((await (await send('/scenes/api/uploads/' + restoredUpload.id, 'POST')).json()).id, firstScene.id)
})
test('a failed KV write preserves the previous revision and its storage reservation', async (context) => {
  const { send, reserve, bindings, getBytes } = await createFixture(context)
  const project = randomUUID()
  const previousScene = createScene('one')
  const nextScene = createScene('two')
  const originalUpload = await (await reserve(previousScene.manifest, project)).json()
  const upload = '/scenes/api/uploads/' + originalUpload.id

  await send(upload + '/' + previousScene.digest, 'PUT', 'one')

  const publishedScene = await (await send(upload, 'POST')).json()
  const replacementUpload = await (await reserve(nextScene.manifest, project, 1)).json()
  const pendingPath = '/scenes/api/uploads/' + replacementUpload.id

  bindings.SCENE_FILES.put = () => {
    throw new Error('daily write limit')
  }

  await assert.rejects(send(pendingPath + '/' + nextScene.digest, 'PUT', 'two'), /daily write limit/)
  assert.equal((await send(pendingPath, 'POST')).status, 409)
  assert.equal(await (await send('/api/scene/' + publishedScene.id + '/1/' + previousScene.digest)).text(), 'one')
  assert.equal(getBytes(), 6)
})
test('enabling KV rejects missing legacy files and blocks publications from the retired upload route', async (context) => {
  const database = new DatabaseSync(':memory:')
  const schema = readFileSync(path.join(__dirname, '../tooling/studio-schema.sql'), 'utf8')
  const { manifest } = createScene('one')
  const insertScene = 'INSERT INTO scenes(id,owner,project,title,version,publication) VALUES(?,?,?,?,?,?)'

  context.after(() => database.close())
  database.exec(schema.slice(0, schema.indexOf('CREATE TABLE IF NOT EXISTS studioCapacity')))
  database.prepare(insertScene).run('legacy', 'owner', 'project', 'title', 1, JSON.stringify(manifest))
  assert.throws(() => database.exec(schema), /must be migrated/)
  assert.equal(database.prepare('SELECT version FROM scenes').get().version, 1)
  database.exec('UPDATE scenes SET publication=NULL')
  database.exec(schema)
  assert.throws(
    () => database.prepare(insertScene).run('new', 'owner', 'other', 'title', 1, JSON.stringify(manifest)),
    /completed upload/
  )
  assert.throws(
    () => database.prepare('UPDATE scenes SET publication=?').run(JSON.stringify(manifest)),
    /completed upload/
  )
})
test('storage reservations count only distinct blocks, reject overflow atomically and recover after cancellation and expiry', async (context) => {
  const { reserve, send, database, clean, getBytes, files, bindings } = await createFixture(context)
  const firstScene = createScene('abc')
  const secondScene = createScene('xyz')

  database.exec('UPDATE studioCapacity SET capacity=5')

  const [firstResponse, secondResponse] = await Promise.all([
    reserve(firstScene.manifest),
    reserve(secondScene.manifest)
  ])

  assert.deepEqual([firstResponse.status, secondResponse.status].sort(), [200, 507])

  const { id } = await firstResponse.json()
  const sharedUpload = await (await reserve(firstScene.manifest)).json()

  assert.equal(getBytes(), 3)
  assert.equal((await reserve(firstScene.manifest, randomUUID(), 0, 'anotherOwner')).status, 507)
  assert.equal(files.size, 0)

  await send('/scenes/api/uploads/' + id, 'DELETE')
  assert.equal(getBytes(), 3)
  database.exec('UPDATE uploads SET expires=0')

  await clean()
  assert.equal(getBytes(), 0)
  assert.equal(
    (await send('/scenes/api/uploads/' + sharedUpload.id + '/' + firstScene.digest, 'PUT', 'abc')).status,
    409
  )

  const reservation = await (await reserve(secondScene.manifest)).json()
  const upload = '/scenes/api/uploads/' + reservation.id

  await send(upload + '/' + secondScene.digest, 'PUT', 'xyz')

  await send(upload, 'DELETE')
  database.exec('UPDATE assets SET writeTime=0')

  const deleteFile = bindings.SCENE_FILES.delete

  bindings.SCENE_FILES.delete = () => {
    throw new Error('daily quota exhausted')
  }

  await assert.rejects(clean(), /quota exhausted/)
  assert.equal(getBytes(), 3)

  bindings.SCENE_FILES.delete = deleteFile

  await clean()
  assert.equal(getBytes(), 0)
  assert.equal(files.size, 0)
})
