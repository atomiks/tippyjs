import { h } from 'hyperapp'
import { emoji } from '../utils'
import Code from './Code'

export default () => (state, { allOptions }) => (
  <section class="section" id="all-options">
    <div class="section__icon-wrapper" oncreate={emoji('🔮')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#all-options">
        All options
      </a>
    </div>
    <p>
      Below is a list of all possible options you can supply to{' '}
      <code>tippy()</code>. The values are the default ones used, with the
      different inputs being listed as a comment next to it.
    </p>
    <Code lang="js">
      {`tippy(ref, {
  // Available v2.3+ - If true, HTML can be injected in the title attribute
  allowTitleHTML: true,

  // If true, the tooltip's background fill will be animated (material effect)
  animateFill: true,

  // The type of animation to use
  animation: 'shift-away', // 'shift-toward', 'fade', 'scale', 'perspective'

  // Which element to append the tooltip to
  appendTo: document.body, // Element or Function that returns an element

  // Whether to display the arrow. Disables the animateFill option
  arrow: false,

  // Transforms the arrow element to make it larger, wider, skinnier, offset, etc.
  arrowTransform: '', // CSS syntax: 'scaleX(0.5)', 'scale(2)', 'translateX(5px)' etc.

  // The type of arrow. 'sharp' is a triangle and 'round' is an SVG shape
  arrowType: 'sharp', // 'round'

  // The tooltip's Popper instance is not created until it is shown for the first
  // time by default to increase performance
  createPopperInstanceOnInit: false,

  // Delays showing/hiding a tooltip after a trigger event was fired, in ms
  delay: 0, // Number or Array [show, hide] e.g. [100, 500]

  // How far the tooltip is from its reference element in pixels
  distance: 10,

  // The transition duration
  duration: [350, 300], // Number or Array [show, hide]

  // If true, whenever the title attribute on the reference changes, the tooltip
  // will automatically be updated
  dynamicTitle: false,

  // If true, the tooltip will flip (change its placement) if there is not enough
  // room in the viewport to display it
  flip: true,

  // The behavior of flipping. Use an array of placement strings, such as
  // ['right', 'bottom'] for the tooltip to flip to the bottom from the right
  // if there is not enough room
  flipBehavior: 'flip', // 'clockwise', 'counterclockwise', Array

  // Whether to follow the user's mouse cursor or not
  followCursor: false,

  // Upon clicking the reference element, the tooltip will hide.
  // Disable this if you are using it on an input for a focus trigger
  // Use 'persistent' to prevent the tooltip from closing on body OR reference
  // click
  hideOnClick: true, // false, 'persistent'

  // Specifies that the tooltip should have HTML content injected into it.
  // A selector string indicates that a template should be cloned, whereas
  // a DOM element indicates it should be directly appended to the tooltip
  html: false, // 'selector', DOM Element

  // Adds an inertial slingshot effect to the animation. TIP! Use a show duration
  // that is twice as long as hide, such as \`duration: [600, 300]\`
  inertia: false,

  // If true, the tooltip becomes interactive and won't close when hovered over
  // or clicked
  interactive: false,

  // Specifies the size in pixels of the invisible border around an interactive
  // tooltip that prevents it from closing. Useful to prevent the tooltip
  // from closing from clumsy mouse movements
  interactiveBorder: 2,

  // Available v2.2+ - If false, the tooltip won't update its position (or flip)
  // when scrolling
  livePlacement: true,

  // The maximum width of the tooltip. Add units such as px or rem
  // Avoid exceeding 300px due to mobile devices, or don't specify it at all
  maxWidth: '',

  // If true, multiple tooltips can be on the page when triggered by clicks
  multiple: false,

  // Offsets the tooltip popper in 2 dimensions. Similar to the distance option,
  // but applies to the parent popper element instead of the tooltip
  offset: 0, // '50, 20' = 50px x-axis offset, 20px y-axis offset

  // Callback invoked when the tooltip fully transitions out
  onHidden(instance) {},

  // Callback invoked when the tooltip begins to transition out
  onHide(instance) {},

  // Callback invoked when the tooltip begins to transition in
  onShow(instance) {},

  // Callback invoked when the tooltip has fully transitioned in
  onShown(instance) {},

  // If true, data-tippy-* attributes will be disabled for increased performance
  performance: false,

  // The placement of the tooltip in relation to its reference
  placement: 'top', // 'bottom', 'left', 'right', 'top-start', 'top-end', etc.

  // Popper.js options. Allows more control over tooltip positioning and behavior
  popperOptions: {},

  // The size of the tooltip
  size: 'regular', // 'small', 'large'

  // If true, the tooltip's position will be updated on each animation frame so
  // the tooltip will stick to its reference element if it moves
  sticky: false,

  // Available v2.1+ - CSS selector string used for event delegation
  target: null, // e.g. '.className'

  // The theme, which is applied to the tooltip element as a class name, i.e.
  // 'dark-theme'. Add multiple themes by separating each by a space, such as
  // 'dark custom'
  theme: 'dark',

  // Changes trigger behavior on touch devices. It will change it from a tap
  // to show and a tap off to hide, to a touch-and-hold to show, and a release
  // to hide
  touchHold: false,

  // The events on the reference element which cause the tooltip to show
  trigger: 'mouseenter focus', // 'click', 'manual'

  // Transition duration applied to the Popper element to transition between
  // position updates
  updateDuration: 350,

  // The z-index of the popper
  zIndex: 9999
})`}
    </Code>

    <h3>Modifying the default options</h3>
    <p>
      You can modify the options by accessing them via{' '}
      <code>tippy.defaults</code>, which will apply to every future instance.
    </p>

    <h3>More control over tooltips</h3>
    <p>
      Specify a <code>popperOptions</code> property with Popper.js options. View
      the{' '}
      <a target="_blank" href="https://popper.js.org/popper-documentation.html">
        Popper.js documentation
      </a>{' '}
      to see all the options you can specify.
    </p>

    <h3>
      Callbacks <span class="section__emoji" oncreate={emoji('🔊')} />
    </h3>
    <p>
      If you want things to occur during tooltips' show and hide events, you can
      specify callback functions in the options object.
    </p>
    <Code lang="js">
      {`tippy(ref, {
  onShow(instance) {
    // When the tooltip begins to transition in
  },
  onShown(instance) {
    // When the tooltip has fully transitioned in
  },
  onHide(instance) {
    // When the tooltip begins to transition out
  },
  onHidden(instance) {
    // When the tooltip has fully transitioned out and is removed from the DOM
  },
  wait(show, event) {
    // Delays showing the tooltip until you manually invoke show()
  }
})`}
    </Code>

    <h3>
      AJAX tooltips <span class="section__emoji" oncreate={emoji('🌐')} />
    </h3>
    <p>
      Callbacks allow you to do powerful things with tooltips. Here's an example
      of dynamic content which on show, fetches a new random image from the
      Unsplash API. Note: this requires a browser which supports the newer fetch
      API.
    </p>
    <div class="section__result">
      <button class="btn" oncreate={allOptions.ajaxTippy} data-local>
        Hover for a new image
      </button>
      <div id="allOptions__ajax-template">Loading...</div>
    </div>
    <a href="https://codepen.io/anon/pen/GEmOQy" target="_blank">
      CodePen Demo
    </a>

    <h3>
      Event delegation <span class="section__emoji" oncreate={emoji('📡')} />
      <span class="badge">v2.1</span>
    </h3>
    <p>
      Event delegation only requires minimal setup. Your setup should look
      similar to this, with a parent element wrapping the child elements you
      would like to give tooltips to:
    </p>

    <Code lang="html">
      {`<div id="parent" title="Shared title">
  <div class="child">Text</div>
  <div class="child">Text</div>
  <div class="child">Text</div>
  <div class="other">Text</div>
</div>
`}
    </Code>

    <p>
      Then, specify a CSS selector as the <code>target</code> that matches child
      elements which should receive tooltips
    </p>
    <Code lang="js">
      {`tippy('#parent', {
  target: '.child'
})
`}
    </Code>

    <h4>Note</h4>
    <p>
      <span class="section__emoji" oncreate={emoji('⚠️')} />Avoid binding a
      Tippy instance to the body, as <code>mouseover / mouseoff</code> events
      will constantly fire as the cursor moves over the page. Instead, give it
      to the nearest possible parent element.
    </p>
    <h4>Destroying a delegate instance</h4>
    <p>
      When you destroy a delegate's Tippy instance, it will destroy all target
      children's Tippy instances as well. To disable this behavior, pass{' '}
      <code>false</code> into the <code>destroy()</code> method.
    </p>
    <Code lang="js">{`const parent = document.querySelector('#parent')
tippy(parent, { target: '.child' })
// Will not destroy any child target instances (if they had been created)
parent._tippy.destroy(false)
`}</Code>
    <p>
      If the target option is specified, the parent reference(s) become
      delegates and receive a <code>data-tippy-delegate</code> attribute instead
      of <code>data-tippy</code>.
    </p>
    <div class="code-wrapper" data-lang="html">
      <pre>
        <code class="lang-html">{`<div id="parent" title="Shared title" data-tippy-delegate></div>`}</code>
      </pre>
    </div>

    <h3>Tooltips inside a scrollable container</h3>
    <p>
      Add the following options to make the tooltip not stay stuck within the
      viewport.
    </p>

    <Code lang="js">{`tippy('.mySelector', {
  appendTo: document.querySelector('.mySelector').parentNode,
  popperOptions: {
    modifiers: {
      preventOverflow: {
        enabled: false
      },
      hide: {
        enabled: false
      }
    }
  }
})
`}</Code>

    <h3>Disabling tooltips on touch devices</h3>
    <p>
      It can be tricky to determine touch devices accurately, especially
      considering the existence of hybrid devices (a mix of mouse and touch
      input). Simply detecting the user agent is not enough.
    </p>
    <p>
      A user can switch between either input type at any time which is why
      dynamic input detection is enabled. You can hook into Tippy's detection of
      user input changes by defining the following callback function:
    </p>

    <Code lang="js">{`tippy.browser.onUserInputChange = type => {
  console.log('The user is now using', type, 'as an input method')
}
`}</Code>

    <p>
      Whenever the user changes their input method, you can react to it inside
      the callback function. To disable tooltips for touch input but keep them
      enabled for mouse input, you can do the following:
    </p>

    <Code lang="js">
      {`const tip = tippy('[title]')

tippy.browser.onUserInputChange = type => {
  const method = type === 'touch' ? 'disable' : 'enable'
  for (const tooltip of tip.tooltips) {
    tooltip[method]()
  }
}
`}
    </Code>

    <h3>Hiding tooltips on scroll</h3>
    <p>
      Due to the way browsers fire <code>mouseleave</code> events, it may be
      desirable to hide tooltips and immediately disable their event listeners
      whenever scrolling occurs. This might also help reduce the intrusiveness
      of a tooltip on small screen touch devices, as it will begin hiding out of
      the way whenever they scroll, rather than whenever they tap somewhere
      else.
    </p>

    <Code lang="js">{`window.addEventListener('scroll', () => {
  for (const popper of document.querySelectorAll('.tippy-popper')) {
    const instance = popper._tippy

    if (instance.state.visible) {
      instance.popperInstance.disableEventListeners()
      instance.hide()
    }
  }
})
`}</Code>

    <h3>Get all Tippy instances</h3>
    <p>
      Getting all (non-destroyed) Tippy instances on the document can be done in
      one single line:
    </p>

    <Code lang="js">{`Array.from(document.querySelectorAll('[data-tippy]'), el => el._tippy)`}</Code>

    <p>
      This returns an array holding every current Tippy instance (excluding
      delegates). To include delegates, use this selector:
    </p>

    <Code lang="js">{`'[data-tippy], [data-tippy-delegate]'`}</Code>

    <p>
      <span class="section__emoji" oncreate={emoji('⚠️')} />
      <code>Array.from</code> needs a polyfill for older browsers.
    </p>
  </section>
)
