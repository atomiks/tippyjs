import { injectCSS } from '../../src/css'

describe('injectCSS', () => {
  it('injects a string of css styles into the document `head`', () => {
    const styles = 'body { color: red; }'
    expect(document.head.querySelector('style')).toBe(null)
    injectCSS(styles)
    const styleNode = document.head.querySelector('style')
    expect(styleNode).toBeTruthy()
    expect(styleNode.textContent).toBe(styles)
    styleNode.remove()
  })
})
