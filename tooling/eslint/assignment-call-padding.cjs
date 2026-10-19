const { isAwaitStatement } = require('./await-statement.cjs')

const expressionWrappers = new Set([
  'AwaitExpression',
  'ChainExpression',
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSInstantiationExpression'
])

const getExpressionGroup = (expression) => {
  if (expressionWrappers.has(expression.type)) {
    return getExpressionGroup(expression.expression ?? expression.argument)
  }

  if (expression.type === 'UnaryExpression' && expression.operator === 'void') {
    return getExpressionGroup(expression.argument)
  }

  if (['AssignmentExpression', 'UpdateExpression'].includes(expression.type)) {
    return 'assignment'
  }

  if (['CallExpression', 'NewExpression', 'TaggedTemplateExpression'].includes(expression.type)) {
    return 'call'
  }

  if (expression.type === 'SequenceExpression') {
    const groups = expression.expressions.map(getExpressionGroup)

    return groups.every((group) => group === groups[0]) ? groups[0] : null
  }

  return null
}

module.exports = {
  meta: {
    type: 'layout',
    docs: { description: 'Require blank lines between assignment and function-call groups, but not within them' },
    fixable: 'whitespace',
    schema: [],
    messages: {
      expectedBlankLine: 'Expected a blank line between assignments and function calls.',
      unexpectedBlankLine: 'Unexpected blank line within a group of {{group}} statements.'
    }
  },
  create(context) {
    const sourceCode = context.sourceCode
    const lineEnding = sourceCode.text.includes('\r\n') ? '\r\n' : '\n'

    const checkStatements = (node) => {
      const statements = node.type === 'SwitchCase' ? node.consequent : node.body

      let previousStatement = null
      let previousGroup = null

      for (const statement of statements) {
        const group = statement.type === 'ExpressionStatement' ? getExpressionGroup(statement.expression) : null

        if (previousGroup && group) {
          const nextToken = sourceCode.getFirstToken(statement)
          const statementEnd = sourceCode.getLastToken(previousStatement)
          const expressionEnd = sourceCode.getLastToken(previousStatement.expression)
          const hasLeadingSemicolon =
            statementEnd.value === ';' &&
            statementEnd.loc.start.line > expressionEnd.loc.end.line &&
            statementEnd.loc.end.line === nextToken.loc.start.line
          const previousToken = hasLeadingSemicolon ? expressionEnd : statementEnd
          const separators = sourceCode.getTokensBetween(previousToken, nextToken, { includeComments: true })
          const tokens = [previousToken, ...separators, nextToken]
          const hasBlankLine = tokens.some(
            (token, index) => index > 0 && token.loc.start.line > tokens[index - 1].loc.end.line + 1
          )

          if (previousGroup !== group && !hasBlankLine) {
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
          } else if (
            previousGroup === group &&
            hasBlankLine &&
            !isAwaitStatement(statement) &&
            !separators.some(({ type }) => type === 'Line' || type === 'Block')
          ) {
            context.report({
              node: statement,
              messageId: 'unexpectedBlankLine',
              data: { group: group === 'call' ? 'function call' : 'assignment' },
              fix(fixer) {
                return tokens.slice(1).flatMap((token, index) => {
                  const range = [tokens[index].range[1], token.range[0]]
                  const gap = sourceCode.text.slice(...range)
                  const spacing = gap.replace(/(\r?\n)(?:[ \t]*\r?\n)+/g, '$1')

                  return spacing === gap ? [] : [fixer.replaceTextRange(range, spacing)]
                })
              }
            })
          }
        }

        previousStatement = statement
        previousGroup = group
      }
    }

    return {
      Program: checkStatements,
      BlockStatement: checkStatements,
      SwitchCase: checkStatements,
      StaticBlock: checkStatements,
      TSModuleBlock: checkStatements
    }
  }
}
