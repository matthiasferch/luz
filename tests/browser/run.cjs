const { createServer } = require('node:http')
const { readFile, mkdtemp, rm } = require('node:fs/promises')
const { existsSync } = require('node:fs')
const { spawn } = require('node:child_process')
const { tmpdir } = require('node:os')
const path = require('node:path')

async function main() {
  const suite = process.argv[2] ?? 'engine-renderer'

  if (
    ![
      'temporal-antialiasing',
      'post-processing',
      'volumetric',
      'skeletal-animation',
      'debug-overlay',
      'directional-light',
      'point-light',
      'engine-renderer',
      'distribution'
    ].includes(suite)
  ) {
    throw new Error('Unknown shader suite')
  }

  const browser = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
  ].find((value) => value && existsSync(value))

  if (!browser) {
    throw new Error('Set CHROME_PATH to a Chrome or Chromium executable')
  }

  const workspace = path.resolve(__dirname, '../..')
  const root = process.env.LUZ_BROWSER_DIRECTORY ? path.resolve(process.env.LUZ_BROWSER_DIRECTORY) : __dirname

  if (
    suite === 'skeletal-animation' &&
    !existsSync(
      path.resolve(
        process.env.LUZ_SKELETAL_DIRECTORY ?? path.join(workspace, '.tmp/skeletal-fixture'),
        'entities/skeletal.entity.json'
      )
    )
  ) {
    throw new Error('Generate skeletal assets with npm run test:fixture:skeletal before running this suite')
  }

  const mime = {
    '.html': 'text/html',
    '.mjs': 'text/javascript',
    '.glsl': 'text/plain',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.geometry': 'application/octet-stream'
  }
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      const isEngineBundle = pathname === '/engine.mjs'
      const isEngineShader = pathname.startsWith('/graphics/rendering/') || pathname.startsWith('/graphics/debug/')
      const engineShaderRoot = path.join(workspace, 'packages/graphics')
      const isSkeletalFixture = suite === 'skeletal-animation' && pathname.startsWith('/skeletal-assets/')
      const fixtureRoot = path.resolve(
        process.env.LUZ_SKELETAL_DIRECTORY ?? path.join(workspace, '.tmp/skeletal-fixture')
      )
      const filename = isEngineShader
        ? path.resolve(engineShaderRoot, '.' + pathname.slice('/graphics'.length))
        : isEngineBundle
          ? path.join(workspace, 'dist/index.mjs')
          : isSkeletalFixture
            ? path.resolve(fixtureRoot, '.' + pathname.slice('/skeletal-assets'.length))
            : path.resolve(root, '.' + pathname)

      if (
        !(
          isEngineBundle ||
          (isEngineShader && filename.startsWith(engineShaderRoot + path.sep)) ||
          filename.startsWith((isSkeletalFixture ? fixtureRoot : root) + path.sep)
        ) ||
        !mime[path.extname(filename)]
      ) {
        response.writeHead(404).end()

        return
      }

      response.setHeader('Content-Type', `${mime[path.extname(filename)]}; charset=utf-8`)
      response.end(await readFile(filename))
    } catch {
      response.writeHead(404).end()
    }
  })
  const profile = await mkdtemp(path.join(tmpdir(), 'luz-taa-test-'))

  if (
    path.dirname(path.resolve(profile)) !== path.resolve(tmpdir()) ||
    !path.basename(profile).startsWith('luz-taa-test-')
  ) {
    throw new Error('Unexpected temporary browser profile path')
  }

  try {
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(0, '127.0.0.1', resolve)
    })

    const url = `http://127.0.0.1:${server.address().port}/${suite}.html`
    const html = await new Promise((resolve, reject) => {
      const child = spawn(
        browser,
        [
          '--headless=new',
          '--no-first-run',
          '--no-default-browser-check',
          '--use-angle=swiftshader',
          '--enable-unsafe-swiftshader',
          `--user-data-dir=${profile}`,
          '--dump-dom',
          '--virtual-time-budget=10000',
          url
        ],
        { windowsHide: true }
      )

      let output = ''
      let errors = ''

      const timeout = setTimeout(() => {
        child.kill()
        reject(new Error('Browser test timed out'))
      }, 45000)

      child.stdout.on('data', (chunk) => {
        output += chunk
      })
      child.stderr.on('data', (chunk) => {
        errors += chunk
      })
      child.once('error', (error) => {
        clearTimeout(timeout)
        reject(error)
      })
      child.once('close', (code) => {
        clearTimeout(timeout)

        if (code !== 0) {
          reject(new Error(`Browser exited ${code}: ${errors}`))
        } else {
          resolve(output)
        }
      })
    })
    const report = html.match(/<pre id="results"[^>]*>([\s\S]*?)<\/pre>/)?.[1] ?? html

    console.log(report.replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/&amp;/g, '&'))

    if (!html.includes('data-status="passed"')) {
      throw new Error(`${suite} shader regression tests failed`)
    }
  } finally {
    server.closeAllConnections()

    await new Promise((resolve) => server.close(resolve))

    await rm(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 })
  }
}

main().catch((error) => {
  console.error(error)

  process.exitCode = 1
})
