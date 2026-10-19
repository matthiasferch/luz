const { existsSync, readFileSync, readdirSync } = require('node:fs')
const path = require('node:path')
const licenseFallbacks = require('./licenses/fallbacks.json')

function findPackage(directory, cache) {
  if (cache.has(directory)) {
    return cache.get(directory)
  }

  const filename = path.join(directory, 'package.json')
  const manifest = existsSync(filename) ? JSON.parse(readFileSync(filename, 'utf8')) : undefined
  const parent = path.dirname(directory)
  const definition = manifest?.name
    ? { directory, name: manifest.name, version: manifest.version }
    : parent === directory
      ? undefined
      : findPackage(parent, cache)

  cache.set(directory, definition)

  return definition
}

function createLicensePlugin() {
  return {
    apply(compiler) {
      compiler.hooks.thisCompilation.tap('luzDependencyLicenses', (compilation) => {
        compilation.hooks.processAssets.tap(
          { name: 'luzDependencyLicenses', stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL },
          () => {
            const cache = new Map()
            const packages = new Map()
            const collectPackages = (modules) => {
              for (const module of modules) {
                const resource = module.resource?.split('?')[0]

                if (resource && resource.split(/[\\/]/).includes('node_modules')) {
                  const definition = findPackage(path.dirname(resource), cache)

                  if (!definition) {
                    throw new Error('Cannot identify bundled dependency: ' + resource)
                  }

                  packages.set(definition.directory, definition)
                }

                if (module.modules) {
                  collectPackages(module.modules)
                }
              }
            }

            collectPackages(compilation.modules)

            for (const definition of packages.values()) {
              const files = readdirSync(definition.directory, { withFileTypes: true })
                .filter(
                  (entry) =>
                    entry.isFile() && /^(?:licen[cs]e|notice|copyright(?:notice)?)(?:$|[._-])/i.test(entry.name)
                )
                .map((entry) => ({ name: entry.name, filename: path.join(definition.directory, entry.name) }))

              if (!files.some((entry) => /^licen[cs]e/i.test(entry.name))) {
                const fallback = licenseFallbacks[definition.name + '@' + definition.version]

                if (!fallback) {
                  throw new Error('No license file found for bundled dependency ' + definition.name)
                }

                const directory = path.join(__dirname, 'licenses', fallback)

                files.push(...['LICENSE', 'NOTICE'].map((name) => ({ name, filename: path.join(directory, name) })))
              }

              for (const file of files) {
                const filename = 'licenses/' + definition.name + '/' + definition.version + '/' + file.name
                const contents = readFileSync(file.filename)
                const existingAsset = compilation.getAsset(filename)

                if (existingAsset) {
                  if (!existingAsset.source.buffer().equals(contents)) {
                    throw new Error('Conflicting dependency license: ' + filename)
                  }
                } else {
                  compilation.emitAsset(filename, new compiler.webpack.sources.RawSource(contents))
                }
              }
            }
          }
        )
      })
    }
  }
}

module.exports = { createLicensePlugin }
