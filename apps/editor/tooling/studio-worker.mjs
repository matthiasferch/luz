const maximumSceneSize = 250 * 1024 * 1024
const maximumBlockSize = 8 * 1024 * 1024
const digestPattern = /^[a-f0-9]{64}$/
const idPattern = /^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/

let signingKeys

function rejectRequest(status, message) {
  throw new Response(message, { status, headers: { 'Cache-Control': 'no-store' } })
}

function decodeBase64(value) {
  return Uint8Array.from(atob(value.replaceAll('-', '+').replaceAll('_', '/')), (character) => character.charCodeAt(0))
}

async function getOwner(request, bindings) {
  const issuer = bindings.ACCESS_ISSUER
  const audience = bindings.ACCESS_AUDIENCE
  const token = request.headers.get('Cf-Access-Jwt-Assertion')

  if (!issuer || !audience || !token) {
    rejectRequest(401, 'Sign in through Cloudflare Access to manage scenes.')
  }

  try {
    const [header, payload, signature] = token.split('.')
    const decoder = new TextDecoder()
    const { alg, kid } = JSON.parse(decoder.decode(decodeBase64(header)))
    const claims = JSON.parse(decoder.decode(decodeBase64(payload)))
    const time = Date.now() / 1000

    if (
      alg !== 'RS256' ||
      claims.iss !== issuer ||
      !Array.isArray(claims.aud) ||
      !claims.aud.includes(audience) ||
      typeof claims.exp !== 'number' ||
      claims.exp <= time ||
      claims.nbf > time ||
      !claims.email ||
      typeof claims.sub !== 'string' ||
      !claims.sub
    ) {
      throw new Error()
    }

    if (signingKeys?.issuer !== issuer || signingKeys.expires < time) {
      const response = await fetch(issuer + '/cdn-cgi/access/certs')

      if (!response.ok) {
        throw new Error()
      }

      signingKeys = { issuer, keys: (await response.json()).keys, expires: time + 300 }
    }

    const key = signingKeys.keys.find((entry) => entry.kid === kid)
    const publicKey = await crypto.subtle.importKey('jwk', key, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, [
      'verify'
    ])

    if (
      !(await crypto.subtle.verify(
        'RSASSA-PKCS1-v1_5',
        publicKey,
        decodeBase64(signature),
        new TextEncoder().encode(header + '.' + payload)
      ))
    ) {
      throw new Error()
    }

    return claims.sub
  } catch {
    rejectRequest(401, 'Sign in through Cloudflare Access to manage scenes.')
  }
}

function sendJson(value) {
  return Response.json(value, { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } })
}

async function readBody(request, limit) {
  if (Number(request.headers.get('Content-Length')) > limit) {
    rejectRequest(413, 'Upload exceeds size limit')
  }

  const reader = request.body?.getReader()

  if (!reader) {
    rejectRequest(400, 'Missing request body')
  }

  const parts = []

  let length = 0

  for (;;) {
    const part = await reader.read()

    if (part.done) {
      break
    }

    length += part.value.byteLength

    if (length > limit) {
      await reader.cancel()
      rejectRequest(413, 'Upload exceeds size limit')
    }

    parts.push(part.value)
  }

  return new Blob(parts).arrayBuffer()
}

export function validatePublication(publication) {
  if (
    !publication ||
    !Array.isArray(publication.files) ||
    publication.files.length > 4096 ||
    typeof publication.entry !== 'string' ||
    !publication.entry.endsWith('.scene.json') ||
    !publication.preset ||
    !Array.isArray(publication.preset.animations) ||
    !publication.preset.settings
  ) {
    rejectRequest(400, 'Invalid scene manifest')
  }

  let size = 0

  const paths = new Set()
  const blocks = new Map()

  for (const file of publication.files) {
    if (
      !file ||
      typeof file.path !== 'string' ||
      file.path.length > 1024 ||
      file.path.split('/').some((part) => !part || part === '.' || part === '..') ||
      /[:?#%\\]/u.test(file.path) ||
      Array.from(file.path).some((character) => character.charCodeAt(0) < 32) ||
      !/\.(?:(scene|entity|model|animation)\.json|geometry|png|jpe?g|webp|ktx|hdr)$/i.test(file.path) ||
      paths.has(file.path) ||
      !Number.isSafeInteger(file.size) ||
      file.size < 1 ||
      !Array.isArray(file.blocks) ||
      file.blocks.length !== Math.ceil(file.size / maximumBlockSize)
    ) {
      rejectRequest(400, 'Invalid scene file')
    }

    paths.add(file.path)

    size += file.size

    if (size > maximumSceneSize) {
      rejectRequest(413, 'Scene exceeds 250 MiB')
    }

    for (const [index, digest] of file.blocks.entries()) {
      const length = Math.min(maximumBlockSize, file.size - index * maximumBlockSize)

      if (
        typeof digest !== 'string' ||
        !digestPattern.test(digest) ||
        (blocks.has(digest) && blocks.get(digest) !== length)
      ) {
        rejectRequest(400, 'Invalid asset block')
      }

      blocks.set(digest, length)
    }
  }

  if (!paths.has(publication.entry)) {
    rejectRequest(400, 'Missing scene entry point')
  }

  return Array.from(blocks, ([digest, length]) => ({ digest, size: length }))
}

const unusedAsset =
  'NOT EXISTS (SELECT 1 FROM uploadAssets WHERE asset=assets.storageKey) AND NOT EXISTS (SELECT 1 FROM sceneAssets WHERE asset=assets.storageKey)'

async function expireUploads(database) {
  await database.batch([
    database.prepare('DELETE FROM uploads WHERE expires<=unixepoch()'),
    database.prepare("DELETE FROM assets WHERE state='reserved' AND " + unusedAsset)
  ])
}

export async function cleanStorage(bindings) {
  const database = bindings.DATABASE

  await expireUploads(database)

  await database
    .prepare(
      "UPDATE assets SET state='retired' WHERE state IN ('ready','writing') AND writeTime<unixepoch()-600 AND " +
        unusedAsset
    )
    .run()

  const { results } = await database.prepare("SELECT storageKey FROM assets WHERE state='retired' LIMIT 8").all()

  for (const { storageKey } of results) {
    await bindings.SCENE_FILES.delete(storageKey)

    await database.prepare("DELETE FROM assets WHERE storageKey=? AND state='retired'").bind(storageKey).run()
  }
}

async function reserveUpload(request, database, owner, project) {
  const version = request.headers.get('If-Match')

  if (!/^\d+$/.test(version ?? '') || !Number.isSafeInteger(Number(version))) {
    rejectRequest(428, 'Expected scene version required')
  }

  let publication

  try {
    publication = JSON.parse(new TextDecoder().decode(await readBody(request, 1024 * 1024)))
  } catch (error) {
    if (error instanceof Response) {
      throw error
    }

    rejectRequest(400, 'Invalid publication')
  }

  const blocks = JSON.stringify(validatePublication(publication))
  const id = crypto.randomUUID()
  const baseVersion = Number(version)
  const title = publication.entry.split('/').pop().slice(0, -11)

  await expireUploads(database)

  try {
    const [reservation, , , missing] = await database.batch([
      database
        .prepare(
          `INSERT INTO uploads(id,owner,project,scene,version,title,publication)
           SELECT ?1,?2,?3,COALESCE(s.id,?4),?5,?6,?7
           FROM (SELECT 1) LEFT JOIN scenes s ON s.owner=?2 AND s.project=?3
           WHERE COALESCE(s.version,0)=?5`
        )
        .bind(id, owner, project, crypto.randomUUID(), baseVersion, title, JSON.stringify(publication)),
      database
        .prepare(
          `INSERT INTO assets(owner,digest,size)
           SELECT ?1,item.value->>'$.digest',item.value->>'$.size' FROM json_each(?2) item
           WHERE EXISTS (SELECT 1 FROM uploads WHERE id=?3) AND NOT EXISTS (
             SELECT 1 FROM assets a WHERE a.owner=?1 AND a.digest=item.value->>'$.digest' AND a.state<>'retired'
           )`
        )
        .bind(owner, blocks, id),
      database
        .prepare(
          `INSERT INTO uploadAssets(upload,asset)
           SELECT ?1,CASE WHEN a.size=item.value->>'$.size' THEN a.storageKey END
           FROM json_each(?2) item JOIN assets a ON a.owner=?3 AND a.digest=item.value->>'$.digest' AND a.state<>'retired'
           WHERE EXISTS (SELECT 1 FROM uploads WHERE id=?1)`
        )
        .bind(id, blocks, owner),
      database
        .prepare("SELECT digest FROM uploadAssets JOIN assets ON storageKey=asset WHERE upload=? AND state<>'ready'")
        .bind(id)
    ])

    if (!reservation.meta.changes) {
      rejectRequest(409, 'The published scene changed. Refresh and publish again.')
    }

    return sendJson({ id, missing: missing.results.map(({ digest }) => digest) })
  } catch (error) {
    const detail = String(error) + ' ' + String(error.cause)

    if (detail.includes('uploadAssets.asset')) {
      rejectRequest(400, 'Conflicting sizes for the same asset')
    }

    if (detail.includes('freeStorage')) {
      rejectRequest(507, 'There is not enough free scene storage for this publication.')
    }

    throw error
  }
}

async function writeBlock(request, bindings, owner, id, digest) {
  const database = bindings.DATABASE
  const asset = await database
    .prepare(
      `SELECT a.storageKey,a.size,a.state FROM uploads u
       JOIN uploadAssets r ON r.upload=u.id JOIN assets a ON a.storageKey=r.asset
       WHERE u.owner=? AND u.id=? AND u.expires>unixepoch() AND a.digest=?`
    )
    .bind(owner, id, digest)
    .first()

  if (!asset) {
    rejectRequest(409, 'This block has no active reservation. Publish the preview again.')
  }

  if (asset.state === 'ready') {
    return new Response(null, { status: 204 })
  }

  const data = await readBody(request, asset.size)
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data))

  if (
    data.byteLength !== asset.size ||
    Array.from(hash, (byte) => byte.toString(16).padStart(2, '0')).join('') !== digest
  ) {
    rejectRequest(400, 'Asset does not match its reservation')
  }

  const lease = await database
    .prepare(
      "UPDATE assets SET state='writing',writeTime=unixepoch() WHERE storageKey=? AND (state='reserved' OR (state='writing' AND writeTime<unixepoch()-60)) RETURNING storageKey"
    )
    .bind(asset.storageKey)
    .first()

  if (!lease) {
    rejectRequest(409, 'This block is being uploaded. Retry the publication.')
  }

  await bindings.SCENE_FILES.put(asset.storageKey, data)

  const ready = await database
    .prepare("UPDATE assets SET state='ready' WHERE storageKey=? AND state IN ('writing','ready') RETURNING storageKey")
    .bind(asset.storageKey)
    .first()

  if (!ready) {
    await bindings.SCENE_FILES.delete(asset.storageKey)
    rejectRequest(409, 'Upload expired. Publish the preview again.')
  }

  return new Response(null, { status: 204 })
}

async function commitUpload(database, owner, id) {
  const scene = await database
    .prepare(
      `UPDATE uploads SET committed=1 WHERE owner=? AND id=? AND expires>unixepoch()
       AND version=COALESCE((SELECT version FROM scenes WHERE scenes.owner=uploads.owner AND scenes.project=uploads.project),0)
       AND NOT EXISTS (SELECT 1 FROM uploadAssets JOIN assets ON storageKey=asset WHERE upload=uploads.id AND state<>'ready')
       RETURNING scene AS id,version+1 AS version`
    )
    .bind(owner, id)
    .first()

  if (!scene) {
    rejectRequest(409, 'Upload expired, incomplete, or superseded. Publish the preview again.')
  }

  return sendJson(scene)
}

async function manageScenes(request, bindings, owner, path) {
  const database = bindings.DATABASE
  const method = request.method

  if (method !== 'GET' && request.headers.get('Origin') !== new URL(request.url).origin) {
    rejectRequest(403, 'Invalid request origin')
  }

  if (method === 'GET' && path === '/scenes/api') {
    const { results } = await database
      .prepare(
        'SELECT id, project, title, version, publication IS NOT NULL AS isPublished FROM scenes WHERE owner=? ORDER BY title'
      )
      .bind(owner)
      .all()

    return sendJson(results)
  }

  const parts = path.split('/')
  const [, , api, resource, id] = parts

  if (api !== 'api') {
    rejectRequest(404, 'Unavailable')
  }

  if (
    parts.length === 6 &&
    resource === 'projects' &&
    idPattern.test(id) &&
    parts[5] === 'uploads' &&
    method === 'POST'
  ) {
    return reserveUpload(request, database, owner, id)
  }

  if (resource === 'uploads' && idPattern.test(id)) {
    if (parts.length === 6 && method === 'PUT' && digestPattern.test(parts[5])) {
      return writeBlock(request, bindings, owner, id, parts[5])
    }

    if (parts.length === 5 && method === 'POST') {
      return commitUpload(database, owner, id)
    }

    if (parts.length === 5 && method === 'DELETE') {
      await database.prepare('DELETE FROM uploads WHERE id=? AND owner=?').bind(id, owner).run()

      await cleanStorage(bindings)

      return new Response(null, { status: 204 })
    }
  }

  if (parts.length === 5 && resource === 'projects' && idPattern.test(id) && method === 'DELETE') {
    const scene = await database
      .prepare(
        'UPDATE scenes SET publication=NULL,version=version+1 WHERE owner=? AND project=? AND version=? RETURNING id'
      )
      .bind(owner, id, Number(request.headers.get('If-Match')))
      .first()

    if (!scene) {
      rejectRequest(409, 'The scene changed. Refresh the list.')
    }

    return new Response(null, { status: 204 })
  }

  rejectRequest(404, 'Unavailable')
}

export async function routeRequest(request, bindings, authenticate = getOwner) {
  const url = new URL(request.url)
  const path = url.pathname

  if (path === '/scenes' || path.startsWith('/scenes/')) {
    const owner = await authenticate(request, bindings)

    if (path !== '/scenes' && path !== '/scenes/') {
      return manageScenes(request, bindings, owner, path)
    }

    url.pathname = '/index.html'
  } else if (path.startsWith('/api/scene/')) {
    const [, , , id, version, digest, ...rest] = path.split('/')

    if (request.method !== 'GET' || !idPattern.test(id) || rest.length) {
      rejectRequest(404, 'Scene unavailable')
    }

    if (version === undefined) {
      const scene = await bindings.DATABASE.prepare(
        'SELECT version,publication FROM scenes WHERE id=? AND publication IS NOT NULL'
      )
        .bind(id)
        .first()

      if (!scene) {
        rejectRequest(404, 'Scene unavailable')
      }

      return sendJson({ ...JSON.parse(scene.publication), version: scene.version })
    }

    if (!/^[1-9]\d*$/.test(version) || !digestPattern.test(digest)) {
      rejectRequest(404, 'Scene unavailable')
    }

    const asset = await bindings.DATABASE.prepare(
      `SELECT storageKey FROM scenes s JOIN assets a ON a.owner=s.owner JOIN sceneAssets r ON r.scene=s.id AND r.asset=a.storageKey
       WHERE s.id=? AND s.version=? AND s.publication IS NOT NULL AND a.digest=? AND a.state='ready'`
    )
      .bind(id, version, digest)
      .first()

    if (!asset) {
      rejectRequest(404, 'Scene unavailable')
    }

    const block = await bindings.SCENE_FILES.get(asset.storageKey, 'stream')

    if (!block) {
      rejectRequest(503, 'Scene files are temporarily unavailable. Try again later.')
    }

    return new Response(block, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Content-Security-Policy': "default-src 'none'; sandbox"
      }
    })
  }

  if (path === '/') {
    url.pathname = '/index.html'
  }

  const response = await bindings.ASSETS.fetch(new Request(url, request))
  const result = new Response(response.body, response)

  result.headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups')
  result.headers.set('Referrer-Policy', 'no-referrer')

  return result
}

export default {
  async scheduled(_event, bindings) {
    await cleanStorage(bindings)
  },

  async fetch(request, bindings) {
    try {
      return await routeRequest(request, bindings)
    } catch (error) {
      if (error instanceof Response) {
        return error
      }

      console.error('Studio request failed', error.message)

      return new Response('Studio temporarily unavailable', { status: 503 })
    }
  }
}
