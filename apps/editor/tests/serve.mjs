import { createServer } from 'node:http'
import { stat } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const mime = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.glsl': 'text/plain',
  '.png': 'image/png',
  '.jpg': 'image/jpeg'
}

createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)

    response.setHeader('Cache-Control', 'no-store')

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405).end()

      return
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1)
    const base =
      relativePath.startsWith('assets/') || relativePath.endsWith('.editor.js') || relativePath === 'editor.js'
        ? path.join(root, 'dist')
        : root
    const filename = path.resolve(base, relativePath)

    if (!filename.startsWith(base + path.sep) || !(await stat(filename)).isFile()) {
      response.writeHead(404).end()

      return
    }

    const contentType = mime[path.extname(filename)] ?? 'application/octet-stream'

    response.setHeader(
      'Content-Type',
      contentType.startsWith('text/') || contentType === 'application/json'
        ? `${contentType}; charset=utf-8`
        : contentType
    )
    createReadStream(filename).pipe(response)
  } catch {
    response.writeHead(404).end()
  }
}).listen(8092, '127.0.0.1', () =>
  console.log('Isolated editor: http://127.0.0.1:8092/; shader tests: /tests/volumetric.html')
)
