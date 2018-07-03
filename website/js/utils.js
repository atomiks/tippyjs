import twemoji from 'twemoji'

export const isBrowser = typeof window !== 'undefined'

export const emoji = char => el => {
  el.innerHTML = twemoji.parse(char, {
    folder: 'svg',
    ext: '.svg'
  })
}
