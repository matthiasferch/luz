module.exports = {
  'luz/implementation-padding': 'error',
  'luz/assignment-call-padding': 'error',
  'luz/await-padding': 'error',
  'luz/class-field-padding': 'error',
  'luz/decorator-padding': 'error',
  curly: ['error', 'all'],
  'padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: '*', next: ['if', 'for', 'while', 'switch', 'try', 'return'] },
    { blankLine: 'always', prev: ['if', 'for', 'while', 'do', 'switch', 'try'], next: '*' },
    { blankLine: 'always', prev: '*', next: ['const', 'let', 'var'] },
    { blankLine: 'always', prev: ['const', 'let', 'var'], next: '*' },
    { blankLine: 'any', prev: 'const', next: 'const' },
    { blankLine: 'any', prev: 'let', next: 'let' },
    { blankLine: 'any', prev: 'var', next: 'var' }
  ]
}
