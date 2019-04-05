// __gatsby-monkey-patch-start
Prism.languages.insertBefore('javascript', 'keyword', {
  module: {
    pattern: /\b(?:import|as|export|from|default)\b/,
    alias: 'keyword',
  },
  op: {
    pattern: /\b(?:typeof|new|of|delete)\b/,
    alias: 'keyword',
  },
  nil: {
    pattern: /\b(?:null|undefined)\b/,
    alias: 'keyword',
  },
  func: {
    pattern: /(\.\s*)[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=(\())/i,
    lookbehind: true,
    alias: 'method',
  },
})

Prism.languages.insertBefore('javascript', 'punctuation', {
  definition: {
    pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=:)/i,
    lookbehind: true,
    alias: 'property',
  },
  access: {
    pattern: /(\.\s*)[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*/i,
    lookbehind: true,
    alias: 'property',
  },
  dom: {
    pattern: /\b(?:window|document|navigator|performance|localStorage)\b/,
    alias: 'variable',
  },
  console: /\bconsole\b/,
  class: {
    pattern: /\b[A-Z][$\w\xA0-\uFFFF]+\b/,
    alias: 'class-name',
  },
})

Prism.languages.insertBefore('javascript', 'operator', {
  spread: {
    pattern: /\.{3}/,
    alias: 'punctuation',
  },
  arrow: {
    pattern: /=>/,
    alias: 'operator',
  },
})

Prism.languages.javascript.punctuation = /[;,.:]/
Prism.languages.insertBefore('javascript', 'punctuation', {
  block: /[()[\]{}]/,
})

Prism.languages.insertBefore('javascript', 'function', {
  method: {
    pattern: /(\.\s*)[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=(\())/i,
    lookbehind: true,
    alias: 'function',
  },
})

Prism.languages.javascript.constant = [
  Prism.languages.javascript.constant,
  {
    pattern: /(const\s+(\{\s*)?)[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*/,
    lookbehind: true,
  },
]

Prism.languages.javascript.string = [
  {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*(?=\1)/,
    lookbehind: true,
  },
  {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*(?=\1)/,
    alias: 'quote',
  },
  {
    pattern: /(["'])(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*(["'])/,
    lookbehind: true,
    alias: 'quote',
  },
]

Prism.languages.insertBefore('javascript', 'keyword', {
  quote: {
    pattern: /['"`]/,
    alias: 'punctuation',
  },
  parameter: [
    {
      pattern: /(function(?:\s+[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*)?\s*\(\s*)[^\s()][^()]*?(?=\s*\))/,
      lookbehind: true,
      inside: Prism.languages.javascript,
    },
    {
      pattern: /[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*(?=\s*=>)/,
      inside: Prism.languages.javascript,
    },
    {
      pattern: /(\(\s*)[^\s()][^()]*?(?=\s*\)\s*=>)/,
      lookbehind: true,
      inside: Prism.languages.javascript,
    },
    {
      pattern: /((?:\b|\s|^)(?!(?:as|async|await|break|case|catch|class|const|continue|debugger|default|delete|do|else|enum|export|extends|finally|for|from|function|get|if|implements|import|in|instanceof|interface|let|new|null|of|package|private|protected|public|return|static|super|switch|this|throw|try|typeof|var|void|while|with|yield)(?![$\w\xA0-\uFFFF]))(?:[_$a-z\xA0-\uFFFF][$\w\xA0-\uFFFF]*\s*)\(\s*)[^\s()][^()]*?(?=\s*\)\s*\{)/,
      lookbehind: true,
      inside: Prism.languages.javascript,
    },
  ],
})

Prism.languages.css.selector = {
  pattern: Prism.languages.css.selector,
  inside: {
    'pseudo-element': /:(?:after|before|first-letter|first-line|selection)|::[-\w]+/,
    'pseudo-class': /:[-\w]+(?:\(.*\))?/,
    class: /\.[-:.\w]+/,
    id: /#[-:.\w]+/,
    attribute: {
      pattern: /\[(?:[^[\]"']|("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1)*\]/,
      greedy: true,
      inside: {
        punctuation: /^\[|\]$/,
        'case-sensitivity': {
          pattern: /(\s)[si]$/i,
          lookbehind: true,
          alias: 'keyword',
        },
        namespace: {
          pattern: /^(\s*)[-*\w\xA0-\uFFFF]*\|(?!=)/,
          lookbehind: true,
          inside: {
            punctuation: /\|$/,
          },
        },
        attribute: {
          pattern: /^(\s*)[-\w\xA0-\uFFFF]+/,
          lookbehind: true,
        },
        value: [
          /("|')(?:\\(?:\r\n|[\s\S])|(?!\1)[^\\\r\n])*\1/,
          {
            pattern: /(=\s*)[-\w\xA0-\uFFFF]+(?=\s*$)/,
            lookbehind: true,
          },
        ],
        operator: /[|~*^$]?=/,
      },
    },
  },
}

Prism.languages.insertBefore('css', 'property', {
  variable: {
    pattern: /(^|[^-\w\xA0-\uFFFF])--[-_a-z\xA0-\uFFFF][-\w\xA0-\uFFFF]*/i,
    lookbehind: true,
  },
})

Prism.languages.insertBefore('css', 'function', {
  operator: {
    pattern: /(\s)[+\-*/](?=\s)/,
    lookbehind: true,
  },
  hexcode: /#[\da-f]{3,8}/i,
  entity: /\\[\da-f]{1,8}/i,
  unit: {
    pattern: /(\d)(?:%|[a-z]+)/,
    lookbehind: true,
  },
  number: /-?[\d.]+/,
})
// __gatsby-monkey-patch-end
