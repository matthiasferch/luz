module.exports = {
  meta: {
    type: 'layout',
    docs: { description: 'Require blank lines before decorated declarations and after decorated properties' },
    fixable: 'whitespace',
    schema: [],
    messages: {
      expectedBlankLine: 'Expected a blank line before this decorated declaration.',
      expectedAfterProperty: 'Expected a blank line after this decorated property.'
    }
  },
  create(context) {
    const sourceCode = context.sourceCode
    const lineEnding = sourceCode.text.includes('\r\n') ? '\r\n' : '\n'

    const checkDeclarations = (node) => {
      const declarations = node.type === 'SwitchCase' ? node.consequent : node.body

      for (let index = 1; index < declarations.length; index++) {
        const previousDeclaration = declarations[index - 1]
        const statement = declarations[index]
        const declaration = ['ExportNamedDeclaration', 'ExportDefaultDeclaration'].includes(statement.type)
          ? statement.declaration
          : statement

        const hasLeadingDecorators = Boolean(declaration?.decorators?.length)
        const isAfterDecoratedProperty =
          node.type === 'ClassBody' &&
          Boolean(previousDeclaration.decorators?.length) &&
          [
            'PropertyDefinition',
            'TSAbstractPropertyDefinition',
            'AccessorProperty',
            'TSAbstractAccessorProperty'
          ].includes(previousDeclaration.type)

        if (!hasLeadingDecorators && !isAfterDecoratedProperty) {
          continue
        }

        const previousToken = sourceCode.getLastToken(previousDeclaration)
        const nextToken = sourceCode.getFirstToken(statement)
        const separators = sourceCode.getTokensBetween(previousToken, nextToken, { includeComments: true })
        const tokens = [previousToken, ...separators, nextToken]
        const hasBlankLine = tokens.some(
          (token, tokenIndex) => tokenIndex > 0 && token.loc.start.line > tokens[tokenIndex - 1].loc.end.line + 1
        )

        if (hasBlankLine) {
          continue
        }

        context.report({
          node: hasLeadingDecorators ? declaration.decorators[0] : previousDeclaration,
          messageId: hasLeadingDecorators ? 'expectedBlankLine' : 'expectedAfterProperty',
          fix(fixer) {
            let insertionToken = previousToken

            for (const separator of separators) {
              if (separator.loc.start.line !== insertionToken.loc.end.line) {
                break
              }

              insertionToken = separator
            }

            const followingToken = tokens[tokens.indexOf(insertionToken) + 1]
            const padding =
              followingToken.loc.start.line === insertionToken.loc.end.line ? lineEnding + lineEnding : lineEnding

            return fixer.insertTextAfter(insertionToken, padding)
          }
        })
      }
    }

    return {
      Program: checkDeclarations,
      BlockStatement: checkDeclarations,
      ClassBody: checkDeclarations,
      StaticBlock: checkDeclarations,
      SwitchCase: checkDeclarations,
      TSModuleBlock: checkDeclarations
    }
  }
}
