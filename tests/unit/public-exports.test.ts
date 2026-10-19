import { expect } from 'chai'
import { readFileSync } from 'fs'
import { resolve } from 'path'
import ts from 'typescript'
import {
  AnimationLoop,
  WebGL2BufferManager,
  WebGL2PrimitiveManager,
  WebGL2ProgramManager,
  WebGL2SamplerManager,
  WebGL2ShaderManager,
  WebGL2TextureManager,
  decodeImage
} from '../../index'
import {
  WebGL2BufferManager as GraphicsBufferManager,
  WebGL2PrimitiveManager as GraphicsPrimitiveManager,
  WebGL2ProgramManager as GraphicsProgramManager,
  WebGL2SamplerManager as GraphicsSamplerManager,
  WebGL2ShaderManager as GraphicsShaderManager,
  WebGL2TextureManager as GraphicsTextureManager
} from '@luz/graphics'
import { AnimationLoop as BrowserAnimationLoop, decodeImage as decodeBrowserImage } from '@luz/browser'

describe('Public exports', () => {
  const directory = resolve(process.cwd(), '..')

  let program: ts.Program
  let checker: ts.TypeChecker

  before(function () {
    this.timeout(30000)

    const configuration = ts.readConfigFile(resolve(directory, 'tsconfig.json'), ts.sys.readFile)
    const parsed = ts.parseJsonConfigFileContent(configuration.config, ts.sys, directory)

    program = ts.createProgram(parsed.fileNames, parsed.options)
    checker = program.getTypeChecker()
  })

  const getExports = (file: string): Map<string, ts.Symbol> => {
    const source = program.getSourceFile(resolve(directory, file))!
    const symbol = checker.getSymbolAtLocation(source)!

    return new Map(
      checker
        .getExportsOfModule(symbol)
        .map((entry) => [entry.name, entry.flags & ts.SymbolFlags.Alias ? checker.getAliasedSymbol(entry) : entry])
    )
  }

  it('exports canonical WebGL2 manager names as runtime values', () => {
    const graphicsExports = getExports('packages/graphics/index.ts')

    for (const [name, rootClass, packageClass] of [
      ['WebGL2PrimitiveManager', WebGL2PrimitiveManager, GraphicsPrimitiveManager],
      ['WebGL2BufferManager', WebGL2BufferManager, GraphicsBufferManager],
      ['WebGL2ShaderManager', WebGL2ShaderManager, GraphicsShaderManager],
      ['WebGL2TextureManager', WebGL2TextureManager, GraphicsTextureManager],
      ['WebGL2ProgramManager', WebGL2ProgramManager, GraphicsProgramManager],
      ['WebGL2SamplerManager', WebGL2SamplerManager, GraphicsSamplerManager]
    ] as const) {
      expect(rootClass).to.equal(packageClass)
      expect(rootClass.name).to.equal(name)
      expect(graphicsExports.has(name.replace('WebGL2', 'WebGL'))).to.equal(false)
    }
  })
  it('exports browser helpers through their own package and the root facade', () => {
    const graphicsExports = getExports('packages/graphics/index.ts')

    expect(AnimationLoop).to.equal(BrowserAnimationLoop)
    expect(decodeImage).to.equal(decodeBrowserImage)
    expect(graphicsExports.has('AnimationLoop')).to.equal(false)
    expect(graphicsExports.has('decodeImage')).to.equal(false)
  })
  it('does not export obsolete animation aliases', () => {
    const rootExports = getExports('index.ts')

    for (const name of ['Animation', 'ModelAnimation', 'isAnimation', 'ObjectAnimation', 'isObjectAnimation']) {
      expect(rootExports.has(name), name).to.equal(false)
    }
  })
  it('exposes package contracts through an explicit root facade without conflicting aliases', () => {
    const rootExports = getExports('index.ts')

    for (const name of ['browser', 'core', 'formats', 'graphics', 'math', 'physics', 'scene', 'serialization']) {
      const file = `packages/${name}/${name === 'formats' ? 'src/' : ''}index.ts`

      for (const [exportName, symbol] of getExports(file)) {
        expect(rootExports.get(exportName), `${name}.${exportName}`).to.equal(symbol)
      }
    }

    for (const name of [
      'RenderStage',
      'RenderState',
      'ClearOptions',
      'FrameContext',
      'StageContext',
      'QueueContext',
      'RenderOptions',
      'ShaderStage',
      'ShaderUniform',
      'UniformValue',
      'UniformBlock',
      'UniformProperty',
      'Playback',
      'BroadphaseEntry',
      'ModelDefinition',
      'SkeletalDocument'
    ]) {
      expect(rootExports.has(name), name).to.equal(true)
    }

    const source = program.getSourceFile(resolve(directory, 'index.ts'))!

    expect(
      source.statements.every((statement) => ts.isExportDeclaration(statement) && statement.exportClause !== undefined)
    ).to.equal(true)
    expect(
      ts
        .getPreEmitDiagnostics(program)
        .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
    ).to.deep.equal([])
  }).timeout(30000)
  it('requires deliberate review of public export additions, removals, and value/type changes', () => {
    const expected = JSON.parse(readFileSync(resolve(directory, 'tests/fixtures/public-exports.json'), 'utf8'))
    const entries = [...getExports('index.ts')]
      .map(([name, symbol]) => `${name}: ${symbol.flags & ts.SymbolFlags.Value ? 'value' : 'type'}`)
      .sort()

    expect(entries).to.deep.equal(expected)
  })
  it('keeps serialized definitions free of runtime classes, methods, and transient state', () => {
    const visitedTypes = new Set<ts.Type>()
    const transientFields = new Set([
      'boneMatrices',
      'boneTexture',
      'poseMatrix',
      'geometryRevision',
      'resolvedGeometry',
      'animationMixer',
      'worldMatrix',
      'shadowCamera',
      'shadowCameras'
    ])
    const validateType = (type: ts.Type, location: string): void => {
      if (visitedTypes.has(type)) {
        return
      }

      visitedTypes.add(type)

      if (type.isUnion()) {
        type.types.forEach((member) => validateType(member, location))

        return
      }

      if (
        type.flags &
        (ts.TypeFlags.StringLike |
          ts.TypeFlags.NumberLike |
          ts.TypeFlags.BooleanLike |
          ts.TypeFlags.Null |
          ts.TypeFlags.Undefined |
          ts.TypeFlags.Never)
      ) {
        return
      }

      expect(type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown), location).to.equal(0)
      expect(type.isClass(), location).to.equal(false)
      expect(type.getCallSignatures(), `${location} callable`).to.have.length(0)
      expect(type.getConstructSignatures(), `${location} constructor`).to.have.length(0)

      if (checker.isArrayType(type) || checker.isTupleType(type)) {
        checker.getTypeArguments(type as ts.TypeReference).forEach((element) => validateType(element, `${location}[]`))

        return
      }

      for (const index of checker.getIndexInfosOfType(type)) {
        validateType(index.type, `${location}[key]`)
      }

      for (const property of type.getProperties()) {
        const propertyLocation = `${location}.${property.name}`

        expect(transientFields.has(property.name), propertyLocation).to.equal(false)
        validateType(
          checker.getTypeOfSymbolAtLocation(
            property,
            property.valueDeclaration ??
              property.declarations?.[0] ??
              program.getSourceFile(resolve(directory, 'packages/formats/src/index.ts'))!
          ),
          propertyLocation
        )
      }
    }
    const definitions = [...getExports('packages/formats/src/index.ts')].filter(([name]) =>
      /(?:Definition|Document)$/.test(name)
    )

    expect(definitions.length).to.be.greaterThan(15)

    for (const [name, symbol] of definitions) {
      validateType(checker.getDeclaredTypeOfSymbol(symbol), name)
    }
  })
  it('does not use Partial runtime classes as input contracts', () => {
    const violations: string[] = []

    for (const source of program.getSourceFiles()) {
      if (!source.fileName.replace(/\\/g, '/').startsWith(`${directory.replace(/\\/g, '/')}/packages/`)) {
        continue
      }

      const visitNode = (node: ts.Node): void => {
        if (ts.isTypeReferenceNode(node) && node.typeName.getText(source) === 'Partial' && node.typeArguments?.[0]) {
          const type = checker.getTypeFromTypeNode(node.typeArguments[0])

          if (type.isClass()) {
            violations.push(`${source.fileName}: ${node.getText(source)}`)
          }
        }

        ts.forEachChild(node, visitNode)
      }

      visitNode(source)
    }

    expect(violations).to.deep.equal([])
  })
})
