const fs = require('fs')

const prismExtensions = fs.readFileSync('src/prism-extensions.js', 'utf8')
const prism = fs.readFileSync('node_modules/prismjs/prism.js')
const hasBeenMonkeyPatched = prism.includes('__gatsby-monkey-patched__')

if (!hasBeenMonkeyPatched) {
  fs.appendFileSync('node_modules/prismjs/prism.js', prismExtensions)
}
