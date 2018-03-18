export const emoji = char =>
  twemoji.parse(char, {
    folder: 'svg',
    ext: '.svg'
  })
