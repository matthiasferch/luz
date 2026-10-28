const fs = require('node:fs')
const path = require('node:path')
const { createHash } = require('node:crypto')
const characterHashes = require('../demo-assets/character/manifest.json')

const readCharacterFile = (filename) => {
  const contents = fs.readFileSync(path.resolve(__dirname, '../demo-assets/character', filename))

  if (createHash('sha256').update(contents).digest('hex') !== characterHashes[filename]) {
    throw new Error(`Character asset does not match its manifest: ${filename}`)
  }

  return contents
}

const readCharacterDocuments = () =>
  Object.fromEntries(
    Object.keys(characterHashes)
      .filter((filename) => filename.endsWith('.json'))
      .map((filename) => [filename, JSON.parse(readCharacterFile(filename).toString('utf8'))])
  )

const readCharacterGeometry = () =>
  Object.fromEntries(
    Object.keys(characterHashes)
      .filter((filename) => filename.endsWith('.geometry'))
      .map((filename) => [filename, readCharacterFile(filename)])
  )

module.exports = { characterHashes, readCharacterDocuments, readCharacterGeometry }
