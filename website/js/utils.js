import twemoji from 'twemoji'

export const isBrowser =
  typeof window !== 'undefined' && typeof document !== 'undefined'

export const DIR = './website/snippets/'

export const prerender = (main, tag) => {
  const output = './docs/index.html'
  if (!isBrowser && typeof nodeRequire !== 'undefined') {
    try {
      const fs = nodeRequire('fs')
      const html = fs.readFileSync(output, 'utf8')
      fs.writeFileSync(output, html.replace(tag, tag + main))
    } catch (e) {}
  }
}

export const snippet = name => `./website/snippets/${name}`

export const getEmojiSrc = char => {
  const result = twemoji.parse(char, {
    folder: 'svg',
    ext: '.svg',
  })
  return result.match(/src="(.+)"/)[1]
}

export const toKebabCase = str =>
  str &&
  str
    .match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g)
    .map(x => x.toLowerCase())
    .join('-')
