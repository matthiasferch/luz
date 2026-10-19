module.exports = [
  {
    selector: 'default',
    filter: { regex: '^(?:fps|FPS)(?:[A-Z_]|$)|(?:Fps|FPS)(?:[A-Z_]|$)', match: true },
    format: null,
    custom: { regex: '^(?:fps|FPS)(?:[A-Z_]|$)|(?:Fps|FPS)(?:[A-Z_]|$)', match: false }
  },
  {
    selector: [
      'variable',
      'parameter',
      'parameterProperty',
      'classProperty',
      'typeProperty',
      'objectLiteralProperty',
      'accessor'
    ],
    types: ['number'],
    filter: { regex: '^(?:culled|rendered|submitted)$', match: true },
    format: null,
    custom: { regex: '^(?:culled|rendered|submitted)$', match: false }
  },
  {
    selector: [
      'variable',
      'parameter',
      'parameterProperty',
      'classProperty',
      'typeProperty',
      'objectLiteralProperty',
      'accessor'
    ],
    filter: { regex: '^should[A-Z]', match: true },
    format: null,
    custom: { regex: '^should[A-Z]', match: false }
  },
  {
    selector: ['class', 'interface'],
    format: ['PascalCase'],
    leadingUnderscore: 'allow'
  },
  {
    selector: ['variable', 'parameter'],
    modifiers: ['destructured'],
    format: null
  },
  {
    selector: ['variable', 'parameter', 'parameterProperty', 'classProperty', 'typeProperty', 'accessor'],
    types: ['boolean'],
    filter: { regex: '^(?:__[A-Z_]+__|[xyzwrgbauv]|depthMask)$', match: false },
    format: ['PascalCase'],
    prefix: ['is', 'has', 'can', 'are', 'was', 'does', 'did', 'requires', 'owns', 'uses']
  },
  {
    selector: ['variable', 'parameter'],
    format: null,
    custom: {
      regex: '^(?:max|min|config|env|tex|tmp)(?:[A-Z_]|$)|(?:Max|Min|Config|Env|Tex|Tmp)(?:[A-Z_]|$)',
      match: false
    }
  }
]
