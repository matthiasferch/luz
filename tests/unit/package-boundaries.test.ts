import { expect } from 'chai'
import { readdirSync, readFileSync } from 'fs'
import { dirname, relative, resolve, sep } from 'path'
import ts from 'typescript'

interface PackageManifest {
  name: string
  dependencies?: Record<string, string>
}

interface ModuleReference {
  filePath: string
  specifier: string
}

interface PackageSources {
  directory: string
  references: ModuleReference[]
}

const packageNames = ['browser', 'core', 'formats', 'graphics', 'math', 'physics', 'scene', 'serialization']
const workspaceRoot = resolve(process.cwd(), '..')
const manifests = new Map<string, PackageManifest>(
  packageNames.map((directoryName) => {
    const manifestPath = resolve(workspaceRoot, 'packages', directoryName, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as PackageManifest

    return [manifest.name, manifest]
  })
)

const collectWorkspaceDependencies = (packageName: string): string[] => {
  const dependencies = manifests.get(packageName)?.dependencies ?? {}

  return Object.keys(dependencies).filter((dependencyName) => manifests.has(dependencyName))
}

const collectSourceFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === 'dist') {
      return []
    }

    const filePath = resolve(directory, entry.name)

    return entry.isDirectory() ? collectSourceFiles(filePath) : filePath.endsWith('.ts') ? [filePath] : []
  })

const collectModuleReferences = (source: ts.SourceFile): string[] => {
  const references: string[] = []
  const visitNode = (node: ts.Node): void => {
    let specifier: ts.Node | undefined

    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      specifier = node.moduleSpecifier
    } else if (ts.isImportTypeNode(node) && ts.isLiteralTypeNode(node.argument)) {
      specifier = node.argument.literal
    } else if (ts.isExternalModuleReference(node)) {
      specifier = node.expression
    } else if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      specifier = node.arguments[0]
    }

    if (specifier && ts.isStringLiteralLike(specifier)) {
      references.push(specifier.text)
    }

    ts.forEachChild(node, visitNode)
  }

  visitNode(source)

  return references
}

const sourceDependencies = new Map<string, PackageSources>(
  packageNames.map((packageName) => {
    const directory = resolve(workspaceRoot, 'packages', packageName)
    const references = collectSourceFiles(directory).flatMap((filePath) => {
      const source = ts.createSourceFile(filePath, readFileSync(filePath, 'utf8'), ts.ScriptTarget.Latest, true)

      return collectModuleReferences(source).map((specifier) => ({ filePath, specifier }))
    })

    return [`@luz/${packageName}`, { directory, references }] as const
  })
)

const assertAcyclicDependencies = (getDependencies: (packageName: string) => string[]): void => {
  const visitedPackages = new Set<string>()
  const activePackages = new Set<string>()
  const visitPackage = (packageName: string, dependencyPath: string[]): void => {
    if (activePackages.has(packageName)) {
      throw new Error(`Package dependency cycle: ${[...dependencyPath, packageName].join(' -> ')}`)
    }

    if (visitedPackages.has(packageName)) {
      return
    }

    activePackages.add(packageName)

    for (const dependencyName of getDependencies(packageName)) {
      visitPackage(dependencyName, [...dependencyPath, packageName])
    }

    activePackages.delete(packageName)
    visitedPackages.add(packageName)
  }

  for (const packageName of manifests.keys()) {
    visitPackage(packageName, [])
  }

  expect(visitedPackages.size).to.equal(manifests.size)
}

describe('Package boundaries', () => {
  it('keeps browser adapters independent and engine services independent from browser adapters', () => {
    expect(collectWorkspaceDependencies('@luz/browser')).to.deep.equal([])
    expect(
      sourceDependencies.get('@luz/browser')!.references.every(({ specifier }) => specifier.startsWith('.'))
    ).to.equal(true)

    for (const packageName of manifests.keys()) {
      if (packageName === '@luz/browser') {
        continue
      }

      expect(collectWorkspaceDependencies(packageName), packageName).not.to.include('@luz/browser')
      expect(
        sourceDependencies.get(packageName)!.references.some(({ specifier }) => specifier === '@luz/browser'),
        packageName
      ).to.equal(false)
    }
  })
  it('keeps rendering, GPU diagnostics and resource services independent of application UI', () => {
    for (const moduleName of ['rendering', 'debug', 'resources']) {
      for (const filePath of collectSourceFiles(resolve(workspaceRoot, 'packages/graphics', moduleName))) {
        const source = readFileSync(filePath, 'utf8')

        expect(source, filePath).not.to.match(
          /\b(?:document|window|HTMLElement|requestAnimationFrame|ResizeObserver)\b/
        )
        expect(source, filePath).not.to.match(/apps\/editor|from ['"](?:vue|react)/)
        expect(source, filePath).not.to.match(/from ['"][^'"]*\/browser(?:\/|['"])/)
      }
    }
  })
  it('keeps core independent from graphics and physics', () => {
    expect(collectWorkspaceDependencies('@luz/core')).to.deep.equal(['@luz/formats', '@luz/math', '@luz/serialization'])
  })
  it('keeps scene orchestration above core and physics', () => {
    expect(collectWorkspaceDependencies('@luz/scene')).to.deep.equal([
      '@luz/core',
      '@luz/formats',
      '@luz/math',
      '@luz/physics',
      '@luz/serialization'
    ])
  })
  it('keeps formats independent from runtime packages', () => {
    expect(collectWorkspaceDependencies('@luz/formats')).to.deep.equal([])
  })
  it('keeps workspace dependencies acyclic', () => {
    assertAcyclicDependencies(collectWorkspaceDependencies)
  })
  it('checks static, dynamic, re-exported, and type-only dependencies', () => {
    const source = ts.createSourceFile(
      'references.ts',
      `import type { Options } from '@luz/core'
       export { Surface } from '@luz/graphics'
       type Value = import('@luz/formats').Tuple3
       const loadModule = () => import('@luz/math')
       const module = require('@luz/scene')
       import serialization = require('@luz/serialization')`,
      ts.ScriptTarget.Latest,
      true
    )

    expect(collectModuleReferences(source)).to.deep.equal([
      '@luz/core',
      '@luz/graphics',
      '@luz/formats',
      '@luz/math',
      '@luz/scene',
      '@luz/serialization'
    ])
  })
  it('requires declared dependencies and public barrels for cross-package imports', () => {
    for (const [packageName, { directory, references }] of sourceDependencies) {
      for (const { filePath, specifier } of references) {
        const location = `${relative(workspaceRoot, filePath)}: ${specifier}`

        if (specifier.startsWith('@luz/')) {
          expect(manifests.has(specifier), `Unknown package or deep import at ${location}`).to.equal(true)

          if (specifier !== packageName) {
            expect(collectWorkspaceDependencies(packageName), `Undeclared dependency at ${location}`).to.include(
              specifier
            )
          }
        } else if (specifier.startsWith('.')) {
          const target = resolve(dirname(filePath), specifier)

          expect(
            target === directory || target.startsWith(directory + sep),
            `Cross-package relative import at ${location}`
          ).to.equal(true)
        }
      }
    }
  })
  it('keeps actual source dependencies acyclic', () => {
    assertAcyclicDependencies((packageName) =>
      [...new Set(sourceDependencies.get(packageName)!.references.map(({ specifier }) => specifier))].filter(
        (specifier) => specifier.startsWith('@luz/') && specifier !== packageName
      )
    )
  })
})
