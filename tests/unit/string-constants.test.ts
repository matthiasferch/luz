import { expect } from 'chai'
import { readdirSync, readFileSync } from 'fs'
import { resolve } from 'path'
import * as typescript from 'typescript'
import { materialNodeLayouts, type NodeLayout } from '@luz/formats'

const workspaceRoot = resolve(process.cwd(), '..')
const externalTypeValues = new Set(['$schema'])
const ownedValuePattern = /^[a-z][a-zA-Z0-9]*$/
const collectFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === 'node_modules' || entry.name === 'dist') {
      return []
    }

    const filePath = resolve(directory, entry.name)

    return entry.isDirectory() ? collectFiles(filePath) : [filePath]
  })

describe('String constants', () => {
  it('requires lower camel case for engine and editor string literal types and registration tags', () => {
    const sourceFiles = ['packages', 'apps/editor/src'].flatMap((directory) =>
      collectFiles(resolve(workspaceRoot, directory)).filter((filePath) => filePath.endsWith('.ts'))
    )

    for (const filePath of sourceFiles) {
      const source = typescript.createSourceFile(
        filePath,
        readFileSync(filePath, 'utf8'),
        typescript.ScriptTarget.Latest,
        true
      )
      const validateNode = (node: typescript.Node): void => {
        if (
          typescript.isLiteralTypeNode(node) &&
          typescript.isStringLiteral(node.literal) &&
          !typescript.isImportTypeNode(node.parent) &&
          !externalTypeValues.has(node.literal.text)
        ) {
          expect(node.literal.text, `${filePath}: ${node.getText(source)}`).to.match(ownedValuePattern)
        }

        if (
          typescript.isDecorator(node) &&
          typescript.isCallExpression(node.expression) &&
          node.expression.expression.getText(source) === 'Register'
        ) {
          const tag = node.expression.arguments[0]

          expect(tag && typescript.isStringLiteral(tag), `${filePath}: explicit registration tag`).to.equal(true)

          if (tag && typescript.isStringLiteral(tag)) {
            expect(tag.text, filePath).to.match(ownedValuePattern)
          }
        }

        typescript.forEachChild(node, validateNode)
      }

      validateNode(source)
    }
  })
  it('rejects separators and uppercase initial letters while allowing component and protocol abbreviations', () => {
    for (const value of ['a-to-b', 'once_only', 'Loop', '']) {
      expect(value).not.to.match(ownedValuePattern)
    }

    for (const value of ['lessEqual', 'sRGB', 'float32x3', 'loop']) {
      expect(value).to.match(ownedValuePattern)
    }
  })
  it('requires lower camel case for serialized schema constants and enum values', () => {
    const validateSchema = (value: unknown, location: string): void => {
      if (!value || typeof value !== 'object') {
        return
      }

      for (const [key, child] of Object.entries(value)) {
        if (key === 'const' || key === 'enum') {
          const materialProperty =
            /material\.schema\.json\/definitions\/node\/oneOf\/(\d+)\/properties\/properties\/properties\/([^/]+)$/.exec(
              location
            )

          if (key === 'enum' && materialProperty) {
            const layout: NodeLayout | undefined = Object.values(materialNodeLayouts)[Number(materialProperty[1])]
            const externalValues = layout?.properties[materialProperty[2]]

            if (Array.isArray(externalValues)) {
              expect(child).to.deep.equal(externalValues)
              continue
            }
          }

          for (const constant of Array.isArray(child) ? child : [child]) {
            if (typeof constant === 'string') {
              expect(constant, location).to.match(ownedValuePattern)
            }
          }
        }

        validateSchema(child, `${location}/${key}`)
      }
    }

    for (const filePath of collectFiles(resolve(workspaceRoot, 'packages/formats/schemas'))) {
      if (filePath.endsWith('.json')) {
        validateSchema(JSON.parse(readFileSync(filePath, 'utf8')), filePath)
      }
    }
  })
})
