const { isAwaitStatement } = require('./await-statement.cjs')

module.exports = {
  meta: {
    type: 'layout',
    docs: { description: 'Require a blank line before standalone await statements' },
    fixable: 'whitespace',
    schema: [],
    messages: {
      expectedBlankLine: 'Expected a blank line before this await statement.'
    }
  },
  create(context) {
    const sourceCode = context.sourceCode
    const lineEnding = sourceCode.text.includes('\r\n') ? '\r\n' : '\n'

    const checkStatements = (node) => {
      const statements = node.type === 'SwitchCase' ? node.consequent : node.body

      for (let index = 1; index < statements.length; index++) {
        const statement = statements[index]

        if (!isAwaitStatement(statement)) {
          continue
        }

        const previousStatement = statements[index - 1]
        const nextToken = sourceCode.getFirstToken(statement)
        const statementEnd = sourceCode.getLastToken(previousStatement)
        const precedingToken = sourceCode.getTokenBefore(statementEnd)
        const hasLeadingSemicolon =
          previousStatement.type !== 'EmptyStatement' &&
          statementEnd.value === ';' &&
          statementEnd.loc.start.line > precedingToken.loc.end.line &&
          statementEnd.loc.end.line === nextToken.loc.start.line
        const previousToken = hasLeadingSemicolon ? precedingToken : statementEnd
        const separators = sourceCode.getTokensBetween(previousToken, nextToken, { includeComments: true })
        const tokens = [previousToken, ...separators, nextToken]
        const hasBlankLine = tokens.some(
          (token, tokenIndex) => tokenIndex > 0 && token.loc.start.line > tokens[tokenIndex - 1].loc.end.line + 1
        )

        if (hasBlankLine) {
          continue
        }

        context.report({
          node: statement,
          messageId: 'expectedBlankLine',
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
      Program: checkStatements,
      BlockStatement: checkStatements,
      SwitchCase: checkStatements,
      TSModuleBlock: checkStatements
    }
  }
}
