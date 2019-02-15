const fs = require('fs')

const PRISM_SOURCE_PATH = 'node_modules/prismjs/prism.js'
const MONKEY_PATCH_RE = /\/\/ __gatsby-monkey-patch-start[\s\S]*__gatsby-monkey-patch-end/

const prismSource = fs.readFileSync(PRISM_SOURCE_PATH, 'utf8')
const prismExtensions = fs.readFileSync('src/prism-extensions.js', 'utf8')

fs.writeFileSync(
  PRISM_SOURCE_PATH,
  prismSource.replace(MONKEY_PATCH_RE, '') + prismExtensions,
)
