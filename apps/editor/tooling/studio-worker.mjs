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

  const [, , , resource, id] = path.split('/')

  if (resource === 'blocks' && digestPattern.test(id) && method === 'PUT') {
    const data = await readBody(request, maximumBlockSize)
    const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', data))

    if (Array.from(hash, (byte) => byte.toString(16).padStart(2, '0')).join('') !== id) {
      rejectRequest(400, 'Asset hash mismatch')
    }

    const existing = await database
      .prepare('SELECT size FROM blocks WHERE owner=? AND digest=?')
      .bind(owner, id)
      .first()

    if (!existing) {
      await bindings.FILES.put(owner + '/' + id, data)

      await database.prepare('INSERT OR IGNORE INTO blocks VALUES(?,?,?)').bind(owner, id, data.byteLength).run()
    }

    return new Response(null, { status: 204 })
  }

  if (resource === 'projects' && idPattern.test(id) && method === 'PUT') {
    let publication

    try {
      publication = JSON.parse(new TextDecoder().decode(await readBody(request, 1024 * 1024)))
    } catch (error) {
      if (error instanceof Response) {
        throw error
      }

      rejectRequest(400, 'Invalid publication')
    }

    const blocks = validatePublication(publication)
    const missing = await database
      .prepare(
        "SELECT 1 FROM json_each(?) AS item WHERE NOT EXISTS (SELECT 1 FROM blocks WHERE owner=? AND digest=json_extract(item.value,'$.digest') AND size=json_extract(item.value,'$.size')) LIMIT 1"
      )
      .bind(JSON.stringify(blocks), owner)
      .first()

    if (missing) {
      rejectRequest(409, 'Some scene files are missing')
    }

    const expectedVersion = request.headers.get('If-Match')

    if (!/^\d+$/.test(expectedVersion ?? '')) {
      rejectRequest(428, 'Expected scene version required')
    }

    const serialized = JSON.stringify(publication)
    const title = publication.entry.split('/').pop().slice(0, -11)
    const scene =
      expectedVersion === '0'
        ? await database
            .prepare(
              'INSERT INTO scenes VALUES(?,?,?,?,1,?) ON CONFLICT(owner,project) DO NOTHING RETURNING id,version'
            )
            .bind(crypto.randomUUID(), owner, id, title, serialized)
            .first()
        : await database
            .prepare(
              'UPDATE scenes SET title=?,publication=?,version=version+1 WHERE owner=? AND project=? AND version=? RETURNING id,version'
            )
            .bind(title, serialized, owner, id, Number(expectedVersion))
            .first()

    if (!scene) {
      rejectRequest(409, 'The published scene changed. Refresh and publish again.')
    }

    return sendJson(scene)
  }

  if (resource === 'projects' && idPattern.test(id) && method === 'DELETE') {
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

    const scene = await bindings.DATABASE.prepare(
      'SELECT owner,version,publication FROM scenes WHERE id=? AND publication IS NOT NULL'
    )
      .bind(id)
      .first()

    if (!scene) {
      rejectRequest(404, 'Scene unavailable')
    }

    const publication = JSON.parse(scene.publication)

    if (version === undefined) {
      return sendJson({ ...publication, version: scene.version })
    }

    if (
      String(scene.version) !== version ||
      !digestPattern.test(digest) ||
      !publication.files.some((file) => file.blocks.includes(digest))
    ) {
      rejectRequest(404, 'Scene unavailable')
    }

    const block = await bindings.FILES.get(scene.owner + '/' + digest)

    if (!block) {
      rejectRequest(404, 'Scene unavailable')
    }

    return new Response(block.body, {
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
