const predicatePattern = /^(?:(?:is|are|has|can|was|does|did|requires|owns|uses)[A-Z]|gl_|[xyzwrgbauv]$)/
const identifierPattern = /^[A-Za-z_]\w*$/

const findInvalidBooleanNames = (source) => {
  const tokens = source.replace(/\/\/[^\r\n]*|\/\*[\s\S]*?\*\//g, ' ').match(/[A-Za-z_]\w*|[^\s]/g) ?? []
  const invalidNames = new Set()
  const checkName = (name) => {
    if (!predicatePattern.test(name)) {
      invalidNames.add(name)
    }
  }

  for (let index = 0; index < tokens.length; index++) {
    if (tokens[index] !== 'bool' || !identifierPattern.test(tokens[index + 1] ?? '') || tokens[index + 2] === '(') {
      continue
    }

    checkName(tokens[index + 1])

    let nestingDepth = 0

    for (let cursor = index + 2; cursor < tokens.length; cursor++) {
      const token = tokens[cursor]

      if (nestingDepth === 0 && [';', ')', '}'].includes(token)) {
        break
      }

      if (['(', '[', '{'].includes(token)) {
        nestingDepth++
      }

      if ([')', ']', '}'].includes(token)) {
        nestingDepth--
      }

      if (token !== ',' || nestingDepth !== 0) {
        continue
      }

      const name = tokens[cursor + 1]

      if (!identifierPattern.test(name ?? '') || !['=', ',', ';', '['].includes(tokens[cursor + 2])) {
        break
      }

      checkName(name)
    }
  }

  return [...invalidNames]
}

const validateShaderNames = (source) => {
  const invalidNames = findInvalidBooleanNames(source)

  if (invalidNames.length) {
    throw new Error(`Shader Boolean names must describe state: ${invalidNames.join(', ')}`)
  }
}

module.exports = { findInvalidBooleanNames, validateShaderNames }
