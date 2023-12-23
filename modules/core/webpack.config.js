const path = require('path');

module.exports = {
  extends: path.resolve(__dirname, '../../webpack.config.js'),
  output: {
    library: 'core',
    path: path.resolve(__dirname, 'dist'),
    filename: 'core.js'
  }
};