const expressionWrappers = new Set([
  'ChainExpression',
  'ParenthesizedExpression',
  'TSAsExpression',
  'TSTypeAssertion',
  'TSNonNullExpression',
  'TSSatisfiesExpression',
  'TSInstantiationExpression'
])

const isAwaitStatement = (statement) => {
  if (statement.type !== 'ExpressionStatement') {
    return false
  }

  let expression = statement.expression

  while (
    expressionWrappers.has(expression.type) ||
    (expression.type === 'UnaryExpression' && expression.operator === 'void')
  ) {
    expression = expression.expression ?? expression.argument
  }

  return expression.type === 'AwaitExpression'
}

module.exports = { isAwaitStatement }
