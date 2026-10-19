const statementKeywords = new Set(['if', 'for', 'while', 'switch', 'return'])
const controlKeywords = new Set(['if', 'for', 'while', 'do', 'switch'])
const declarationQualifiers = new Set([
  'const',
  'uniform',
  'in',
  'out',
  'inout',
  'attribute',
  'varying',
  'buffer',
  'shared',
  'lowp',
  'mediump',
  'highp',
  'centroid',
  'flat',
  'smooth',
  'noperspective',
  'invariant',
  'precise',
  'coherent',
  'volatile',
  'restrict',
  'readonly',
  'writeonly'
])
const triviaPattern = /\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|^[ \t]*#(?:\\\r?\n|[^\r\n])*/gm
const assignmentOperators = new Set(['=', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<=', '>>='])

const findShaderLayoutViolations = (source) => {
  const tokens = [
    ...source.matchAll(
      /\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|^[ \t]*#(?:\\\r?\n|[^\r\n])*|[A-Za-z_]\w*|(?:<<|>>)=|[+\-*/%&|^]=|\+\+|--|==|!=|<=|>=|<<|>>|&&|\|\||\^\^|[^\s]/gm
    )
  ]
    .filter((match) => !/^(?:\/\/|\/\*|[ \t]*#)/.test(match[0]))
    .map((match) => ({ value: match[0], offset: match.index, end: match.index + match[0].length }))
  const violations = []

  let cursor = 0

  const getToken = () => tokens[cursor]?.value

  const getExpressionGroup = (startIndex, endIndex) => {
    const values = tokens.slice(startIndex, endIndex).map(({ value }) => value)

    if (values.pop() !== ';') {
      return null
    }

    const findGroupEnd = (start) => {
      let depth = 0

      for (let index = start; index < values.length; index++) {
        if (['(', '[', '{'].includes(values[index])) {
          depth++
        }

        if ([')', ']', '}'].includes(values[index])) {
          depth--
        }

        if (depth === 0) {
          return index
        }
      }

      return values.length
    }

    while (values[0] === '(' && findGroupEnd(0) === values.length - 1) {
      values.shift()
      values.pop()
    }

    let depth = 0
    let hasAssignment = false

    for (const value of values) {
      if (['(', '[', '{'].includes(value)) {
        depth++
      }

      if ([')', ']', '}'].includes(value)) {
        depth--
      }

      if (depth === 0 && assignmentOperators.has(value)) {
        hasAssignment = true
      }

      if (depth === 0 && (value === ',' || (value === '?' && !hasAssignment))) {
        return null
      }
    }

    if (hasAssignment) {
      return 'assignment'
    }

    const hasPrefixUpdate = ['++', '--'].includes(values[0])
    const hasSuffixUpdate = ['++', '--'].includes(values[values.length - 1])

    if (hasPrefixUpdate) {
      values.shift()
    }

    if (hasSuffixUpdate) {
      values.pop()
    }

    if (!/^[A-Za-z_]\w*$/.test(values[0] ?? '')) {
      return null
    }

    let index = 1
    let isCall = false

    while (index < values.length) {
      const value = values[index]

      if (value === '.' && /^[A-Za-z_]\w*$/.test(values[index + 1] ?? '')) {
        index += 2
        isCall = false
      } else if (value === '(' || value === '[') {
        index = findGroupEnd(index) + 1
        isCall = value === '('
      } else {
        return null
      }
    }

    return hasPrefixUpdate || hasSuffixUpdate ? 'assignment' : isCall ? 'call' : null
  }

  const getDeclarationGroup = () => {
    let index = cursor
    let group = 'variable'

    if (
      statementKeywords.has(getToken()) ||
      ['do', 'else', 'break', 'continue', 'discard', 'precision', 'struct'].includes(getToken())
    ) {
      return null
    }

    if (tokens[index]?.value === 'layout') {
      index += 2

      let depth = 1

      while (index < tokens.length && depth > 0) {
        if (tokens[index].value === '(') {
          depth++
        }

        if (tokens[index].value === ')') {
          depth--
        }

        index++
      }
    }

    while (declarationQualifiers.has(tokens[index]?.value)) {
      if (
        ['const', 'uniform', 'in', 'out', 'inout', 'attribute', 'varying', 'buffer', 'shared'].includes(
          tokens[index].value
        )
      ) {
        group = tokens[index].value
      }

      index++
    }

    if (!/^[A-Za-z_]\w*$/.test(tokens[index]?.value ?? '')) {
      return null
    }

    index++

    while (tokens[index]?.value === '[') {
      while (index < tokens.length && tokens[index].value !== ']') {
        index++
      }

      index++
    }

    return /^[A-Za-z_]\w*$/.test(tokens[index]?.value ?? '') && ['=', ';', ',', '['].includes(tokens[index + 1]?.value)
      ? group
      : null
  }

  const skipGroup = () => {
    const closingToken = getToken() === '(' ? ')' : ']'

    cursor++

    while (cursor < tokens.length && getToken() !== closingToken) {
      if (getToken() === '(' || getToken() === '[') {
        skipGroup()
      } else {
        cursor++
      }
    }

    cursor++
  }

  const checkPadding = (previousEnd, token, isRequired = true) => {
    const gap = source.slice(previousEnd, token.offset)
    const hasBlankLine = /\r?\n[ \t]*\r?\n/.test(gap.replace(triviaPattern, 'comment'))

    if (hasBlankLine === isRequired || (!isRequired && /\S/.test(gap))) {
      return
    }

    violations.push({
      rule: isRequired ? 'padding' : 'unexpected-padding',
      keyword: token.value,
      line: source.slice(0, token.offset).split('\n').length,
      offset: token.offset,
      previousEnd
    })
  }

  const readStatements = (isBlock) => {
    let previousEnd = null
    let previousGroup = null
    let previousKeyword = null
    let previousExpressionGroup = null

    while (cursor < tokens.length && (!isBlock || getToken() !== '}')) {
      if (getToken() === 'case' || getToken() === 'default') {
        let conditionalDepth = 0

        cursor++

        while (cursor < tokens.length) {
          const token = getToken()

          cursor++

          if (token === ':' && conditionalDepth === 0) {
            break
          }

          if (token === '?') {
            conditionalDepth++
          }

          if (token === ':') {
            conditionalDepth--
          }
        }

        previousEnd = null
        previousGroup = null
        previousKeyword = null
        previousExpressionGroup = null
        continue
      }

      const group = getDeclarationGroup()
      const keyword = getToken()
      const startIndex = cursor
      const token = tokens[cursor]

      readStatement()

      const expressionGroup =
        group === null && !statementKeywords.has(keyword) && !controlKeywords.has(keyword)
          ? getExpressionGroup(startIndex, cursor)
          : null

      if (
        previousEnd !== null &&
        (statementKeywords.has(keyword) ||
          controlKeywords.has(previousKeyword) ||
          ((group !== null || previousGroup !== null) && group !== previousGroup) ||
          (expressionGroup !== null && previousExpressionGroup !== null && expressionGroup !== previousExpressionGroup))
      ) {
        checkPadding(previousEnd, token)
      } else if (previousEnd !== null && expressionGroup !== null && expressionGroup === previousExpressionGroup) {
        checkPadding(previousEnd, token, false)
      }

      previousEnd = tokens[Math.min(cursor, tokens.length) - 1].end
      previousGroup = group
      previousKeyword = keyword
      previousExpressionGroup = expressionGroup
    }
  }

  const readBody = (controlToken) => {
    const bodyToken = tokens[cursor]
    const hasBraces = getToken() === '{' || (controlToken.value === 'else' && getToken() === 'if')

    readStatement()

    if (!hasBraces && bodyToken) {
      violations.push({
        rule: 'braces',
        keyword: controlToken.value,
        line: source.slice(0, controlToken.offset).split('\n').length,
        offset: controlToken.offset,
        bodyOffset: bodyToken.offset,
        bodyEnd: tokens[Math.min(cursor, tokens.length) - 1].end
      })
    }
  }

  const readStatement = () => {
    const keyword = getToken()

    if (keyword === '{') {
      cursor++

      readStatements(true)

      cursor++

      return
    }

    if (['if', 'for', 'while', 'switch'].includes(keyword)) {
      const controlToken = tokens[cursor]

      cursor++

      skipGroup()
      readBody(controlToken)

      if (keyword === 'if' && getToken() === 'else') {
        const elseToken = tokens[cursor]

        cursor++

        readBody(elseToken)
      }

      return
    }

    if (keyword === 'do') {
      const controlToken = tokens[cursor]

      cursor++

      readBody(controlToken)

      if (getToken() === 'while') {
        cursor++

        skipGroup()

        if (getToken() === ';') {
          cursor++
        }
      }

      return
    }

    while (cursor < tokens.length) {
      const token = getToken()

      if (token === '(' || token === '[') {
        skipGroup()
        continue
      }

      if (token === '{') {
        readStatement()

        return
      }

      cursor++

      if (token === ';' || token === '}') {
        return
      }
    }
  }

  readStatements(false)

  return violations.sort((firstViolation, secondViolation) => firstViolation.offset - secondViolation.offset)
}

const validateShaderLayout = (source, name) => {
  const violations = findShaderLayoutViolations(source)

  if (violations.length) {
    throw new Error(
      violations
        .map(
          ({ rule, keyword, line }) =>
            `${name}:${line}: ${
              rule === 'braces'
                ? `Expected braces around '${keyword}' body.`
                : rule === 'unexpected-padding'
                  ? `Unexpected empty line before '${keyword}' within a statement group.`
                  : `Expected an empty line before '${keyword}'.`
            }`
        )
        .join('\n')
    )
  }
}

const findMissingShaderPadding = (source) => findShaderLayoutViolations(source).filter(({ rule }) => rule === 'padding')

const findUnbracedShaderBodies = (source) => findShaderLayoutViolations(source).filter(({ rule }) => rule === 'braces')

const findUnexpectedShaderPadding = (source) =>
  findShaderLayoutViolations(source).filter(({ rule }) => rule === 'unexpected-padding')

module.exports = {
  findMissingShaderPadding,
  findUnbracedShaderBodies,
  findUnexpectedShaderPadding,
  validateShaderLayout
}
