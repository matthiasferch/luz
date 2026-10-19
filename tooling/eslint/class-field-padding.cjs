const getFieldGroup = (member) => {
  if (!['PropertyDefinition', 'TSAbstractPropertyDefinition'].includes(member.type)) {
    return null
  }

  const visibility = member.key.type === 'PrivateIdentifier' ? 'private' : (member.accessibility ?? 'public')

  return `${visibility}:${Boolean(member.static)}:${Boolean(member.readonly)}`
}

module.exports = {
  meta: {
    type: 'layout',
    docs: { description: 'Group adjacent class fields by visibility, static, and readonly modifiers' },
    fixable: 'whitespace',
    schema: [],
    messages: {
      expectedBlankLine: 'Expected a blank line between class fields with different modifiers.',
      unexpectedBlankLine: 'Unexpected blank line between class fields with the same modifiers.'
    }
  },
  create(context) {
    const sourceCode = context.sourceCode
    const lineEnding = sourceCode.text.includes('\r\n') ? '\r\n' : '\n'

    return {
      ClassBody(node) {
        for (let index = 1; index < node.body.length; index++) {
          const previousMember = node.body[index - 1]
          const member = node.body[index]
          const previousGroup = getFieldGroup(previousMember)
          const group = getFieldGroup(member)

          if (!previousGroup || !group || previousMember.decorators?.length || member.decorators?.length) {
            continue
          }

          const nextToken = sourceCode.getFirstToken(member)
          const memberEnd = sourceCode.getLastToken(previousMember)
          const precedingToken = sourceCode.getTokenBefore(memberEnd)
          const hasLeadingSemicolon =
            memberEnd.value === ';' &&
            memberEnd.loc.start.line > precedingToken.loc.end.line &&
            memberEnd.loc.end.line === nextToken.loc.start.line
          const isPaddingRequired = previousGroup !== group
          const previousToken = hasLeadingSemicolon && !isPaddingRequired ? precedingToken : memberEnd
          const separators = sourceCode.getTokensBetween(previousToken, nextToken, { includeComments: true })

          if (separators.some(({ type }) => type === 'Line' || type === 'Block')) {
            continue
          }

          const tokens = [previousToken, ...separators, nextToken]
          const hasBlankLine = tokens.some(
            (token, tokenIndex) => tokenIndex > 0 && token.loc.start.line > tokens[tokenIndex - 1].loc.end.line + 1
          )

          if (hasBlankLine === isPaddingRequired) {
            continue
          }

          context.report({
            node: member,
            messageId: isPaddingRequired ? 'expectedBlankLine' : 'unexpectedBlankLine',
            fix(fixer) {
              if (isPaddingRequired) {
                const padding =
                  tokens[1].loc.start.line === previousToken.loc.end.line ? lineEnding + lineEnding : lineEnding

                return fixer.insertTextAfter(previousToken, padding)
              }

              return tokens.slice(1).flatMap((token, tokenIndex) => {
                const range = [tokens[tokenIndex].range[1], token.range[0]]
                const gap = sourceCode.text.slice(...range)
                const spacing = gap.replace(/(\r?\n)(?:[ \t]*\r?\n)+/g, '$1')

                return spacing === gap ? [] : [fixer.replaceTextRange(range, spacing)]
              })
            }
          })
        }
      }
    }
  }
}
