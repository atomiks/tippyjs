import { injectCSS } from '../../src/css'

afterEach(() => {
  document.head.innerHTML = ''
})

describe('injectCSS', () => {
  const styles = 'body { color: red; }'

  it('injects a string of css styles into the document `head`', () => {
    expect(document.head.querySelector('style')).toBe(null)
    injectCSS(styles)
    const styleNode = document.head.querySelector('style')
    expect(styleNode).toBeTruthy()
    expect(styleNode.textContent).toBe(styles)
    styleNode.remove()
  })

  it('places the node before the first child if it exists', () => {
    document.head.append(document.createElement('title'))
    injectCSS(styles)
    const styleNode = document.head.querySelector('style')
    expect(document.head.children[0]).toBe(styleNode)
  })
})
