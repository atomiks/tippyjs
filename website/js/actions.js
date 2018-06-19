import anime from 'animejs'
import tippy from '../../dist/tippy.js'

export default {
  header: {
    animateLogo(el) {
      anime({
        targets: el,
        translateY: [0, 210],
        duration: 2000,
        elasticity: 250,
        delay: 400,
        rotate: 0.01
      })
    },
    animateVersion(el) {
      anime({
        targets: el,
        scale: [0, 1],
        opacity: [0, 1],
        duration: 2500,
        delay: 1000
      })
    },
    animateItems(el) {
      el.style.pointerEvents = 'none'
      anime({
        targets: el,
        translateY: [100, 0],
        opacity: [0, 1],
        rotate: 0.01,
        delay: 1500,
        duration: 2000,
        elasticity: 200,
        begin() {
          el.style.pointerEvents = 'auto'
        }
      })
    }
  },
  demo: {
    htmlTippy(el) {
      if (el._tippy) return

      const container = el.parentNode
      const button = container.querySelector('[data-close]')
      button.onclick = () => el._tippy.hide()
      tippy(el, {
        html: container.querySelector('[data-template]'),
        appendTo: el.parentNode
      })
    }
  },
  creatingHTMLTemplates: {
    htmlTippy(el) {
      if (el._tippy) return
      const template = document.createElement('div')
      template.innerHTML = `<h3>Cool <span style="color: pink;">HTML</span> inside here!</h3>`
      tippy(el, { html: template })
    }
  },
  allOptions: {
    ajaxTippy(el) {
      if (el._tippy) return

      const template = el.parentNode.querySelector('#allOptions__ajax-template')
      const initialText = template.textContent

      const tip = tippy(el, {
        animation: 'shift-toward',
        arrow: true,
        html: template,
        onShow(instance) {
          const content = instance.popper.querySelector('.tippy-content')

          if (tip.loading || content.textContent !== initialText) return

          tip.loading = true

          fetch('https://unsplash.it/200/?random')
            .then(resp => resp.blob())
            .then(blob => {
              content.innerHTML = `<img width="200" height="200" src="${URL.createObjectURL(
                blob
              )}">`
              tip.loading = false
            })
            .catch(e => {
              content.innerHTML = 'Loading failed'
              tip.loading = false
            })
        },
        onHidden(instance) {
          instance.popper.querySelector(
            '.tippy-content'
          ).innerHTML = initialText
        },
        popperOptions: {
          modifiers: {
            preventOverflow: { enabled: false },
            hide: { enabled: false }
          }
        }
      })
    }
  }
}
