const fs = require('fs')
const path = require('path')
const docsPath = path.join(__dirname, '..', 'docs')

fs.readdirSync(docsPath)
  .filter(filename => !filename.includes('v2'))
  .forEach(file => {
    fs.unlinkSync(path.join(docsPath, file))
  })
