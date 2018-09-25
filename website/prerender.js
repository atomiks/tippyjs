const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const docsPath = path.join(__dirname, '..', 'docs')

const jsBundlePath = `${docsPath}/${fs
  .readdirSync(docsPath)
  .find(filename => filename.endsWith('js'))}`

fs.writeFileSync(
  jsBundlePath,
  `nodeRequire=typeof require!=="undefined"&&require;${fs.readFileSync(
    jsBundlePath,
    'utf8'
  )}`
)

exec(`node ${jsBundlePath}`)
