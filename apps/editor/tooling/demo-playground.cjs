const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const playgroundHashes = require('../demo-assets/playground/manifest.json')

const readPlaygroundFile = (filename) => {
  const contents = fs.readFileSync(path.resolve(__dirname, '../demo-assets/playground', filename))

  if (createHash('sha256').update(contents).digest('hex') !== playgroundHashes[filename]) {
    throw new Error(`Playground asset does not match its manifest: ${filename}`)
  }

  return contents
}

const readPlaygroundDocuments = () =>
  Object.fromEntries(
    Object.keys(playgroundHashes)
      .filter((filename) => filename.endsWith('.json'))
      .map((filename) => [filename, JSON.parse(readPlaygroundFile(filename).toString('utf8'))])
  )

const readPlaygroundGeometry = () =>
  Object.fromEntries(
    Object.keys(playgroundHashes)
      .filter((filename) => filename.endsWith('.geometry'))
      .map((filename) => [filename, readPlaygroundFile(filename)])
  )

module.exports = { playgroundHashes, readPlaygroundDocuments, readPlaygroundGeometry }
