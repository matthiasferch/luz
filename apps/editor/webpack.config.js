const path = require('path')
const fs = require('fs')
const CopyPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const { VueLoaderPlugin } = require('vue-loader')
const packageJson = require('./package.json')
const { scanSceneCatalog } = require('./tooling/scene-catalog')
const { createLicensePlugin } = require('../../tooling/dependency-licenses.cjs')

module.exports = (environment = {}, argumentsObject = {}) => {
  const isServing = Boolean(environment.WEBPACK_SERVE)
  const isDemo = typeof environment.demoAssetsDirectory === 'string'
  const assetDirectory = isDemo ? environment.demoAssetsDirectory : path.resolve(__dirname, 'public/assets')
  const sceneDirectory = path.join(assetDirectory, 'scenes')
  const sceneCatalog = scanSceneCatalog(sceneDirectory).map((scene) => ({
    ...scene,
    label: environment.sceneLabels?.[scene.id] ?? scene.label
  }))
  const mode = argumentsObject.mode ?? 'development'

  return {
    mode,
    context: __dirname,
    entry: './src/main.ts',
    devtool: mode === 'production' ? false : 'inline-source-map',
    module: {
      rules: [
        { test: /\.png$/, type: 'asset/inline' },
        {
          test: /\.ts$/,
          use: {
            loader: 'ts-loader',
            options: { appendTsSuffixTo: [/\.vue$/] }
          },
          exclude: /node_modules/
        },
        {
          test: /\.vue$/,
          loader: 'vue-loader'
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.mesh$/,
          use: ['json-loader']
        },
        {
          test: /\.model$/,
          use: ['json-loader']
        },
        {
          test: /\.scene$/,
          use: ['json-loader']
        },
        {
          test: /\.glsl$/,
          type: 'asset/source'
        }
      ]
    },
    plugins: [
      createLicensePlugin(),
      new VueLoaderPlugin(),
      new webpack.DefinePlugin({
        __VUE_OPTIONS_API__: JSON.stringify(false),
        __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        __EDITOR_VERSION__: JSON.stringify(packageJson.version),
        __EDITOR_DEVELOPMENT__: JSON.stringify(isServing),
        __EDITOR_SCENES__: JSON.stringify(sceneCatalog)
      }),
      ...(isServing
        ? []
        : [
            new CopyPlugin({
              patterns: [
                {
                  from: isDemo ? assetDirectory : 'public/assets/',
                  to: 'assets/',
                  noErrorOnMissing: !isDemo
                },
                {
                  from: 'index.html',
                  to: 'index.html'
                },
                {
                  from: '../../packages/formats/schemas/',
                  to: 'schemas/'
                },
                {
                  from: '../../LICENSE',
                  to: 'LICENSE',
                  toType: 'file'
                },
                ...(isDemo ? [{ from: 'SHOWCASE.md', to: 'assets/README.md' }] : [])
              ]
            })
          ])
    ],
    resolve: {
      extensions: ['.js', '.ts', '.vue']
    },
    output: {
      filename: 'editor.js',
      path: path.resolve(__dirname, isDemo ? 'dist/demo' : 'dist'),
      clean: true
    },
    watchOptions: { ignored: ['**/node_modules/**'] },
    devServer: {
      static: [
        {
          directory: path.resolve(__dirname, 'public/assets'),
          publicPath: '/assets',
          watch: false
        },
        {
          directory: path.resolve(__dirname, '../../packages/formats/schemas'),
          publicPath: '/schemas',
          watch: false
        },
        {
          directory: path.resolve(__dirname, 'local-assets'),
          publicPath: '/local-assets',
          watch: false
        },
        {
          directory: path.resolve(__dirname),
          watch: {
            ignored: ['**/dist/**', '**/node_modules/**', '**/public/assets/**', '**/local-assets/**']
          }
        }
      ],
      setupMiddlewares: (middlewares) => {
        middlewares.unshift({
          name: 'luz-scene-export-status',
          middleware: (request, response, continueMiddlewareChain) => {
            const requestPath = new URL(request.url, 'http://localhost').pathname
            const prefix = '/assets/scenes/'

            if (!requestPath.startsWith(prefix) || !requestPath.toLowerCase().endsWith('.export.json')) {
              continueMiddlewareChain()

              return
            }

            let relativePath

            try {
              relativePath = decodeURIComponent(requestPath.slice(prefix.length))
            } catch {
              response.statusCode = 400

              response.end()

              return
            }

            const exportPath = path.resolve(sceneDirectory, relativePath)
            const sceneRoot = `${path.resolve(sceneDirectory)}${path.sep}`.toLowerCase()

            if (!exportPath.toLowerCase().startsWith(sceneRoot)) {
              response.statusCode = 400

              response.end()

              return
            }

            fs.readFile(exportPath, (error, contents) => {
              if (error) {
                response.statusCode = error.code === 'ENOENT' ? 204 : 500

                response.end()

                return
              }

              response.statusCode = 200

              response.setHeader('Content-Type', 'application/json; charset=utf-8')
              response.setHeader('Cache-Control', 'no-store')
              response.end(contents)
            })
          }
        })
        middlewares.unshift({
          name: 'luz-scene-catalog',
          path: '/__luz/scenes',
          middleware: (_request, response) => {
            try {
              response.statusCode = 200

              response.setHeader('Content-Type', 'application/json; charset=utf-8')
              response.setHeader('Cache-Control', 'no-store')
              response.end(JSON.stringify(scanSceneCatalog(sceneDirectory)))
            } catch (error) {
              response.statusCode = 500

              response.end(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }))
            }
          }
        })

        return middlewares
      }
    }
  }
}
