const path = require('path');

module.exports = {
  entry: './src/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [
      '.ts'
    ]
  },
  output: {
    library: 'luz',
    libraryTarget: 'umd',
    filename: 'luz.js',
    path: path.resolve(__dirname, 'dist'),
    globalObject: 'this',
    clean: true
  },
  mode: 'development'
};