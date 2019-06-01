/**!
 * tippy.js v5.0.0-alpha.0
 * (c) 2017-2019 atomiks
 * MIT License
 */
import { b as isBrowser, a as tippy } from './tippy.chunk.js'
import 'popper.js'

var css =
  '.tippy-tooltip[data-animation=fade][data-state=hidden]{opacity:0}.tippy-tooltip[data-animation=shift-away][data-placement^=top][data-state=hidden]{transform:translateY(10px)}.tippy-tooltip[data-animation=shift-away][data-placement^=bottom][data-state=hidden]{transform:translateY(-10px)}.tippy-tooltip[data-animation=shift-away][data-placement^=left][data-state=hidden]{transform:translateX(10px)}.tippy-tooltip[data-animation=shift-away][data-placement^=right][data-state=hidden]{transform:translateX(-10px)}.tippy-tooltip[data-animation=shift-away][data-state=hidden]{opacity:0}.tippy-iOS{cursor:pointer!important;-webkit-tap-highlight-color:transparent}.tippy-popper{pointer-events:none;max-width:calc(100% - 8px);transition-timing-function:cubic-bezier(.165,.84,.44,1)}.tippy-tooltip{position:relative;color:#fff;border-radius:.25rem;font-size:.875rem;line-height:1.4;text-align:center;background-color:#333;overflow:hidden;transition-property:visibility,opacity,transform;outline:0}.tippy-tooltip[data-placement^=top] .tippy-backdrop{transform-origin:0 25%;border-radius:40% 40% 0 0}.tippy-tooltip[data-placement^=top] .tippy-backdrop[data-state=visible]{transform:scale(1) translate(-50%,-55%)}.tippy-tooltip[data-placement^=top] .tippy-backdrop[data-state=hidden]{transform:scale(.2) translate(-50%,-45%)}.tippy-tooltip[data-placement^=top] .tippy-svgArrow{transform-origin:50% 0;margin:0 3px;bottom:-7px;bottom:-6.5px}.tippy-tooltip[data-placement^=top] .tippy-svgArrow svg{transform:rotate(180deg)}.tippy-tooltip[data-placement^=top] .tippy-arrow{border-width:8px 8px 0;border-top-color:#333;margin:0 3px;transform-origin:50% 0;bottom:-7px}.tippy-tooltip[data-placement^=bottom] .tippy-backdrop{transform-origin:0 -50%;border-radius:0 0 30% 30%}.tippy-tooltip[data-placement^=bottom] .tippy-backdrop[data-state=visible]{transform:scale(1) translate(-50%,-45%)}.tippy-tooltip[data-placement^=bottom] .tippy-backdrop[data-state=hidden]{transform:scale(.2) translate(-50%)}.tippy-tooltip[data-placement^=bottom] .tippy-svgArrow{transform-origin:50% 7px;margin:0 3px;top:-7px}.tippy-tooltip[data-placement^=bottom] .tippy-svgArrow svg{transform:rotate(0)}.tippy-tooltip[data-placement^=bottom] .tippy-arrow{border-width:0 8px 8px;border-bottom-color:#333;margin:0 3px;transform-origin:50% 7px;top:-7px}.tippy-tooltip[data-placement^=left] .tippy-backdrop{transform-origin:50% 0;border-radius:50% 0 0 50%}.tippy-tooltip[data-placement^=left] .tippy-backdrop[data-state=visible]{transform:scale(1) translate(-50%,-50%)}.tippy-tooltip[data-placement^=left] .tippy-backdrop[data-state=hidden]{transform:scale(.2) translate(-75%,-50%)}.tippy-tooltip[data-placement^=left] .tippy-svgArrow{transform-origin:33.33333333% 50%;margin:3px 0;right:-12px}.tippy-tooltip[data-placement^=left] .tippy-svgArrow svg{transform:rotate(90deg)}.tippy-tooltip[data-placement^=left] .tippy-arrow{border-width:8px 0 8px 8px;border-left-color:#333;margin:3px 0;transform-origin:0 50%;right:-7px}.tippy-tooltip[data-placement^=right] .tippy-backdrop{transform-origin:-50% 0;border-radius:0 50% 50% 0}.tippy-tooltip[data-placement^=right] .tippy-backdrop[data-state=visible]{transform:scale(1) translate(-50%,-50%)}.tippy-tooltip[data-placement^=right] .tippy-backdrop[data-state=hidden]{transform:scale(.2) translate(-25%,-50%)}.tippy-tooltip[data-placement^=right] .tippy-svgArrow{transform-origin:66.66666666% 50%;margin:3px 0;left:-12px}.tippy-tooltip[data-placement^=right] .tippy-svgArrow svg{transform:rotate(-90deg)}.tippy-tooltip[data-placement^=right] .tippy-arrow{border-width:8px 8px 8px 0;border-right-color:#333;margin:3px 0;transform-origin:7px 50%;left:-7px}.tippy-tooltip[data-size=small]{padding:.1875rem .375rem;font-size:.75rem}.tippy-tooltip[data-size=large]{padding:.375rem .75rem;font-size:1rem}.tippy-tooltip[data-arrow]{overflow:visible}.tippy-tooltip[data-animatefill]{background-color:transparent!important}.tippy-tooltip[data-interactive],.tippy-tooltip[data-interactive] .tippy-svgArrow path{pointer-events:auto}.tippy-tooltip[data-inertia][data-state=visible]{transition-timing-function:cubic-bezier(.54,1.5,.38,1.11)}.tippy-tooltip[data-inertia][data-state=hidden]{transition-timing-function:ease}.tippy-arrow{border-color:transparent;border-style:solid}.tippy-arrow,.tippy-svgArrow{position:absolute}.tippy-arrow[data-state=hidden],.tippy-svgArrow[data-state=hidden]{opacity:0}.tippy-svgArrow{width:18px;height:7px;fill:#333;pointer-events:none}.tippy-svgArrow svg{position:absolute;left:0}.tippy-backdrop{position:absolute;background-color:#333;border-radius:50%;width:calc(110% + 2rem);left:50%;top:50%;z-index:-1;transition:all cubic-bezier(.46,.1,.52,.98);-webkit-backface-visibility:hidden;backface-visibility:hidden}.tippy-backdrop[data-state=hidden]{opacity:0}.tippy-backdrop:after{content:"";float:left;padding-top:100%}.tippy-content{padding:.3125rem .5625rem}.tippy-backdrop+.tippy-content{transition-property:opacity;will-change:opacity}.tippy-backdrop+.tippy-content[data-state=hidden]{opacity:0}'

/**
 * Injects a string of CSS styles to a style node in <head>
 */

function injectCSS(css) {
  if (isBrowser) {
    var style = document.createElement('style')
    style.textContent = css
    style.setAttribute('data-tippy-stylesheet', '')
    var head = document.head
    var firstChild = head.firstChild

    if (firstChild) {
      head.insertBefore(style, firstChild)
    } else {
      head.appendChild(style)
    }
  }
}

injectCSS(css)

export default tippy
//# sourceMappingURL=tippy.bundle.js.map
