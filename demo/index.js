import tippy from '../src/index'
import '../src/scss/index.scss'
import '../src/scss/themes/light.scss'
import '../src/scss/themes/light-border.scss'
import '../src/scss/themes/google.scss'
import '../src/scss/themes/translucent.scss'

const container = document.querySelector('.container')

const themes = ['dark', 'light', 'light-border', 'google', 'translucent']
const placements = ['top', 'bottom', 'left', 'right']
const arrows = [false, true]
const arrowTypes = ['sharp', 'round']

themes.forEach(theme => {
  const h1 = document.createElement('h1')
  h1.textContent = theme
  container.append(h1)

  placements.forEach(placement => {
    arrows.forEach(arrow => {
      arrowTypes.forEach(arrowType => {
        const button = document.createElement('button')
        button.textContent = 'Button'
        container.append(button)
        tippy(button, {
          content: 'Tooltip',
          showOnInit: true,
          theme,
          placement,
          arrow,
          arrowType,
        })
      })
    })
  })
})
