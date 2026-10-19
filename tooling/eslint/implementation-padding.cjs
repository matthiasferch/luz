const unwrapDeclaration = (node) => node.declaration ?? node

const isImplementation = (node) => {
  const declaration = unwrapDeclaration(node)

  return (
    (declaration.type === 'FunctionDeclaration' && Boolean(declaration.body)) ||
    (declaration.type === 'MethodDefinition' && Boolean(declaration.value.body)) ||
    (declaration.type === 'Property' &&
      ['ArrowFunctionExpression', 'FunctionExpression'].includes(declaration.value.type)) ||
    (declaration.type === 'VariableDeclaration' &&
      declaration.declarations.some(({ init }) =>
        ['ArrowFunctionExpression', 'FunctionExpression'].includes(init?.type)
      ))
  )
}

const isImport = (node) =>
  node.type === 'ImportDeclaration' ||
  (node.type === 'VariableDeclaration' &&
    node.declarations.every(({ init }) => init?.type === 'CallExpression' && init.callee.name === 'require'))

module.exports = {
  meta: {
    type: 'layout',
    docs: { description: 'Separate imports from code and adjacent function implementations' },
    fixable: 'whitespace',
    schema: [],
    messages: { expectedBlankLine: 'Expected a blank line between these declarations.' }
  },
  create(context) {
    const sourceCode = context.sourceCode
    const checkDeclarations = (node) => {
      const body = node.type === 'ObjectExpression' ? node.properties : node.body

      for (let index = 1; index < body.length; index++) {
        const previousDeclaration = body[index - 1]
        const declaration = body[index]
        const isAfterImports = isImport(previousDeclaration) && !isImport(declaration)

        if (!isAfterImports && !(isImplementation(previousDeclaration) && isImplementation(declaration))) {
          continue
        }

        const tokens = [
          sourceCode.getLastToken(previousDeclaration),
          ...sourceCode.getTokensBetween(previousDeclaration, declaration, { includeComments: true }),
          sourceCode.getFirstToken(declaration)
        ]
        const hasBlankLine = tokens.some(
          (token, tokenIndex) => tokenIndex > 0 && token.loc.start.line > tokens[tokenIndex - 1].loc.end.line + 1
        )

        if (hasBlankLine) {
          continue
        }

        context.report({
          node: declaration,
          messageId: 'expectedBlankLine',
          fix(fixer) {
            const lineEnding = sourceCode.text.includes('\r\n') ? '\r\n' : '\n'
            const token = tokens
              .slice(0, -1)
              .findLast((entry) => entry.loc.start.line === previousDeclaration.loc.end.line)
            const padding = declaration.loc.start.line === token.loc.end.line ? lineEnding + lineEnding : lineEnding

            return fixer.insertTextAfter(token, padding)
          }
        })
      }
    }

    return {
      Program: checkDeclarations,
      BlockStatement: checkDeclarations,
      ClassBody: checkDeclarations,
      ObjectExpression: checkDeclarations
    }
  }
}
