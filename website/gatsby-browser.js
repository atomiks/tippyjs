/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 * **These should be gatsby plugins, but some weren't working.**
 * **For now I'm monkey-patching them...**
 */
import 'normalize.css'
import 'animate.css/source/_base.css'
import 'animate.css/source/attention_seekers/rubberBand.css'
import 'animate.css/source/attention_seekers/tada.css'
import 'animate.css/source/attention_seekers/wobble.css'
import 'focus-visible'
import elasticScroll from 'elastic-scroll-polyfill'
import { toKebabCase } from './src/utils'

function addDataLabelToTdElements() {
  const labels = Array.from(document.querySelectorAll('th')).map(
    th => th.textContent,
  )
  const rowTds = Array.from(document.querySelectorAll('tbody tr')).map(tr =>
    Array.from(tr.querySelectorAll('td')),
  )
  rowTds.forEach(tds => {
    tds.forEach((td, index) => {
      td.setAttribute('data-label', labels[index])
    })
  })
}

function addElasticScrollingToCodeBlocks() {
  if (/Mac/.test(navigator.platform)) {
    elasticScroll({ targets: 'pre[class*="language"]' })
  }
}

function highlightDeprecatedOptions() {
  const deprecatedOptions = Array.from(document.querySelectorAll('del')).map(
    del => del.closest('tr'),
  )
  deprecatedOptions.forEach(el => {
    el.style.opacity = 0.5
  })
}

function autoLinkHeaders() {
  const headers = Array.from(document.querySelectorAll('h3,h4,h5,h6'))
  headers.forEach(header => {
    const a = document.createElement('a')
    const href = toKebabCase(header.textContent)
    a.id = href
    a.href = `#${href}`
    a.className = 'link-icon'
    a.textContent = '#'
    a.setAttribute('aria-hidden', 'true')
    header.insertBefore(a, header.firstChild)
  })
}

export function onRouteUpdate() {
  addDataLabelToTdElements()
  addElasticScrollingToCodeBlocks()
  highlightDeprecatedOptions()
  autoLinkHeaders()
}
