const { createServer } = require('node:http')
const { createReadStream } = require('node:fs')
const { stat } = require('node:fs/promises')
const path = require('node:path')

const createDemoServer = (directory = path.resolve(__dirname, '../dist/demo')) => {
  const root = path.resolve(directory)
  const contentTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.md': 'text/plain; charset=utf-8',
    '.txt': 'text/plain; charset=utf-8'
  }

  return createServer(async (request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end()

      return
    }

    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      const filename = path.resolve(root, pathname === '/' ? 'index.html' : `.${pathname}`)

      if (!filename.startsWith(root + path.sep)) {
        response.writeHead(404).end()

        return
      }

      const details = await stat(filename)

      if (!details.isFile()) {
        response.writeHead(404).end()

        return
      }

      response.writeHead(200, {
        'Content-Type': contentTypes[path.extname(filename)] ?? 'application/octet-stream',
        'Content-Length': details.size,
        'Cache-Control': 'no-cache',
        ETag: `"${details.size}-${details.mtimeMs}"`,
        'X-Content-Type-Options': 'nosniff'
      })

      if (request.method === 'HEAD') {
        response.end()
      } else {
        createReadStream(filename)
          .on('error', () => response.destroy())
          .pipe(response)
      }
    } catch {
      response.writeHead(404).end()
    }
  })
}

if (require.main === module) {
  const server = createDemoServer()

  server.on('error', (error) => {
    console.error(error)

    process.exitCode = 1
  })
  server.listen(4173, '127.0.0.1', () => console.log('luz demo: http://127.0.0.1:4173/'))
}

module.exports = { createDemoServer }
