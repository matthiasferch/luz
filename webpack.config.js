const path = require('path')
const { createLicensePlugin } = require('./tooling/dependency-licenses.cjs')

module.exports = (_environment, options = {}) => {
  const isProduction = options.mode === 'production'

  return {
    entry: './index.ts',
    devtool: isProduction ? 'source-map' : 'inline-source-map',
    module: {
      rules: [
        { test: /\.glsl$/, type: 'asset/source' },
        { test: /\.png$/, type: 'asset/inline' },
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    plugins: [createLicensePlugin()],
    resolve: {
      extensions: ['.ts']
    },
    experiments: { outputModule: true },
    output: {
      library: { type: 'module' },
      filename: 'index.mjs',
      path: path.resolve(__dirname, 'dist'),
      clean: true
    },
    mode: isProduction ? 'production' : 'development'
  }
}
