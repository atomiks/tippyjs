// This build step allows users to import the addons like this:
// import {addon} from 'tippy.js/addons'
// instead of needing to do:
// import {addon} from 'tippy.js/esm/tippy-addons'
const fs = require('fs')

const DIRS = ['cjs', 'esm']
const FILENAMES = [
  'tippy-addons.js',
  'tippy-addons.js.map',
  'tippy-addons.min.js',
  'tippy-addons.min.js.map',
]
const CHUNK_FILENAME_RE = /\.\/chunk-.+?\.js/g
const SOURCEMAP_PATH_RE = /..\/src\/addons\//g
const ADDONS_PATH = './addons'

if (!fs.existsSync(ADDONS_PATH)) {
  fs.mkdirSync(ADDONS_PATH)
}

DIRS.forEach(dir => {
  fs.readdirSync(dir)
    .filter(filename => FILENAMES.includes(filename))
    .forEach(filename => {
      const newDir = `${ADDONS_PATH}/${dir}`
      const oldPath = `${dir}/${filename}`
      const newPath = `${newDir}/${filename}`

      if (!filename.endsWith('.map')) {
        const fileContents = fs.readFileSync(oldPath, 'utf8')

        // Access the chunk file from the root directory folder
        const newFileContents = fileContents.replace(CHUNK_FILENAME_RE, match =>
          match.replace('./', `../${dir}/`),
        )

        if (!fs.existsSync(newDir)) {
          fs.mkdirSync(newDir)
        }

        fs.writeFileSync(newPath, newFileContents)
        fs.unlinkSync(oldPath)
      } else {
        fs.renameSync(oldPath, newPath)
        const fileContents = fs.readFileSync(newPath, 'utf8')

        // Since Rollup places the sourcemaps in `./esm/filename.js.map`, but
        // we move the file one more level deep `./addons/esm/filename.js.map`
        const newFileContents = fileContents.replace(SOURCEMAP_PATH_RE, match =>
          match.replace('../', `../../`),
        )

        fs.writeFileSync(newPath, newFileContents)
      }
    })
})
