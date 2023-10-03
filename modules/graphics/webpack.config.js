const path = require('path');

module.exports = {
  extends: path.resolve(__dirname, '../../webpack.config.js'),
  output: {
    library: 'graphics',
    filename: 'graphics.js'
  }
};