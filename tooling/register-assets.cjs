process.env.TS_NODE_FILES = 'true'

const fileSystem = require('node:fs')

require.extensions['.glsl'] = (module, filename) => {
  module.exports = fileSystem.readFileSync(filename, 'utf8')
}
require.extensions['.png'] = (module, filename) => {
  module.exports = 'data:image/png;base64,' + fileSystem.readFileSync(filename).toString('base64')
}
