const { copyFileSync, existsSync, readFileSync, readdirSync, writeFileSync } = require('node:fs')
const path = require('node:path')

const workspace = path.resolve(__dirname, '..')
const output = path.join(workspace, 'dist')
const entries = new Map()

for (const directory of readdirSync(path.join(output, 'packages'), { withFileTypes: true })) {
  if (!directory.isDirectory()) {
    continue
  }

  const manifest = JSON.parse(readFileSync(path.join(workspace, 'packages', directory.name, 'package.json'), 'utf8'))
  const entry = ['index.d.ts', 'src/index.d.ts']
    .map((filename) => path.join(output, 'packages', directory.name, filename))
    .find(existsSync)

  if (!entry) {
    throw new Error(`Missing declarations for ${manifest.name}`)
  }

  entries.set(manifest.name, entry)
}

function prepareDeclarations(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      prepareDeclarations(filename)
    } else if (entry.name.endsWith('.d.ts')) {
      const source = readFileSync(filename, 'utf8').replace(
        /(['"])(@luz\/[^'"]+|\.\.?\/[^'"]+)\1/g,
        (_match, quote, name) => {
          const declarationPath = path.resolve(path.dirname(filename), name).replace(/\.js$/, '')
          const target = name.startsWith('@luz/')
            ? entries.get(name)
            : [declarationPath + '.d.ts', path.join(declarationPath, 'index.d.ts')].find(existsSync)

          if (!target) {
            throw new Error(`Unresolved declaration dependency: ${name}`)
          }

          const relativePath = path
            .relative(path.dirname(filename), target)
            .replaceAll(path.sep, '/')
            .replace(/\.d\.ts$/, '')

          return `${quote}${relativePath.startsWith('.') ? relativePath : './' + relativePath}.js${quote}`
        }
      )

      writeFileSync(filename, source)
    }
  }
}

prepareDeclarations(output)
copyFileSync(path.join(workspace, 'LICENSE'), path.join(output, 'LICENSE'))
writeFileSync(
  path.join(output, 'package.json'),
  JSON.stringify(
    {
      name: 'luz',
      version: '0.0.0',
      private: true,
      license: 'MIT',
      type: 'module',
      main: './index.mjs',
      types: './index.d.ts',
      exports: { '.': { types: './index.d.ts', import: './index.mjs' } }
    },
    null,
    2
  ) + '\n'
)
