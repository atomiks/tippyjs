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
  flow: {
    pattern: /\b(?:return|await)\b/,
    alias: 'keyword',
  },
})

Prism.languages.insertBefore('javascript', 'punctuation', {
  definition: {
    pattern: /[a-z]\w*(?=:)/i,
    lookbehind: true,
    alias: 'property',
  },
  access: {
    pattern: /(\.\s*)[a-z_$][\w$]*/i,
    lookbehind: true,
    alias: 'property',
  },
  dom: {
    pattern: /\b(?:window|document|navigator|performance|localStorage)\b/,
    alias: 'variable',
  },
  console: /\bconsole\b/,
  class: {
    pattern: /\b[A-Z][A-Za-z0-9_]+\b/,
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

Prism.languages.insertBefore('javascript', 'function', {
  method: {
    pattern: /(\.\s*)[a-z_$][\w$]*(?=(\())/i,
    lookbehind: true,
    alias: 'function',
  },
})

Prism.languages.insertBefore('javascript', 'keyword', {
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

// __gatsby-monkey-patched__
