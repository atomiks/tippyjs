import { h } from 'hyperapp'
import Emoji from './Emoji'
import Code from './Code'
import Heading from './Heading'
import ResultBox from './ResultBox'
import Tippy from './Tippy'
import { toKebabCase } from '../utils'

const APPEND_TO_FUNC = `
tippy(list, {
  appendTo(ref) {
    return ref.parentNode
  }
})
`

const Prop = (props, children) => {
  const id = toKebabCase(props.name)
  return (
    <tr id={id}>
      <td>
        <code class="prop">
          <a href={'#' + id}>{props.name}</a>
        </code>
      </td>
      <td>
        <code>{props.default}</code>
      </td>
      <td>
        {Array.isArray(props.value) ? (
          props.value.map(i => (
            <div>
              <code>{i}</code>
            </div>
          ))
        ) : (
          <code>{props.value}</code>
        )}
      </td>
      <td>{children}</td>
    </tr>
  )
}

export default () => (state, actions) => (
  <section class="section" id="all-options">
    <Emoji class="section__icon-wrapper">🔮</Emoji>
    <Heading>All Props</Heading>
    <p>
      Below is a list of all possible props to configure a tippy. All of them
      are optional.
    </p>
    <div class="table-wrapper">
      <table class="table">
        <thead>
          <tr>
            <th>Prop</th>
            <th>Default</th>
            <th>Value</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <Prop name="allowHTML" default="true" value="Boolean">
            Determines if HTML can be rendered in the tippy.
          </Prop>
          <Prop name="animateFill" default="true" value="Boolean">
            Determines if the tippy's background fill should be animated.
          </Prop>
          <Prop
            name="animation"
            default="&quot;shift-away&quot;"
            value={[
              '"fade"',
              '"scale"',
              '"shift-toward"',
              '"perspective"',
              '"shift-away"'
            ]}
          >
            The type of transition animation.
          </Prop>
          <Prop
            name="appendTo"
            default="document.body"
            value={['Element', 'Function']}
          >
            The element to append the tippy to. Use a function that returns an
            element to dynamically append the tippy relative to the reference
            element.
            <Code lang="js">{APPEND_TO_FUNC}</Code>
          </Prop>
          <Prop name="arrow" default="false" value="Boolean">
            Determines if an arrow should be added to the tippy pointing toward
            the reference element.
          </Prop>
          <Prop
            name="arrowType"
            default="&quot;sharp&quot;"
            value={['"sharp"', '"round"']}
          >
            The type of arrow. <code>"sharp"</code> is a CSS triangle using the
            border method, while <code>"round"</code> is a custom SVG shape.
          </Prop>
          <Prop
            name="arrowTransform"
            default="&quot;&quot;"
            value={['"scaleX(2)"', '"scale(0.8)"']}
          >
            CSS transform to apply to the arrow. Only <code>scale</code> and{' '}
            <code>translate</code> are supported. It is dynamic. Apply the
            transform that you would normally give to a <code>"top"</code>{' '}
            placement, even if the placement is different.
          </Prop>
          <Prop name="delay" default="0" value={['Number', '[show, hide]']}>
            Delay in ms once a trigger event is fired before a tippy shows or
            hides. Use an array of numbers such as <code>[100, 500]</code> to
            specify a different value for show and hide. Add <code>null</code>{' '}
            in the array to use the default value, e.g. <code>[null, 50]</code>.
          </Prop>
          <Prop
            name="duration"
            default="[275, 250]"
            value={['Number', '[show, hide]']}
          >
            Duration of the CSS transition animation in ms. Use an array of
            numbers such as <code>[100, 500]</code> to specify a different value
            for show and hide. Add <code>null</code> in the array to use the
            default value, e.g. <code>[null, 50]</code>.
          </Prop>
          <Prop name="distance" default="10" value="Number">
            How far in pixels the tooltip element is from the reference element.
            Only applies to a single axis and not to the parent popper element,
            see{' '}
            <a class="link" href="#offset">
              offset
            </a>.
          </Prop>
          <Prop name="flip" default="true" value="Boolean">
            Determines if the tooltip flips so that it is placed within the
            viewport as best it can be if there is not enough room.
          </Prop>
          <Prop
            name="flipBehavior"
            default="&quot;flip&quot;"
            value={['"flip"', 'Array']}
          >
            Determines the order of flipping, i.e. which placements to prefer if
            a certain placement cannot be used. Use an array such as{' '}
            <code>["bottom", "left"]</code> to prefer the "left" placement if
            "bottom" is unavailable. By default, it chooses the opposite axis,
            i.e. "top".
          </Prop>
          <Prop name="flipTransition" default="true" value="Boolean">
            Flips are transitioned by default due to the tooltip element's
            transition duration. Setting this to false will disable transitions
            when it's fully shown.
          </Prop>
          <Prop name="followCursor" default="false" value="Boolean">
            Determines if the tippy follows the user's mouse cursor while
            showing.
          </Prop>
          <Prop
            name="hideOnClick"
            default="true"
            value={['Boolean', '"toggle"']}
          >
            Determines if the tooltip should hide if its reference element was
            clicked. For click-triggered tooltips, using <code>false</code> will
            prevent the tooltip from ever hiding once it is showing. To prevent
            clicks outside of the tippy from hiding it but still allow it to be
            toggled, use the string <code>"toggle"</code>.
          </Prop>
          <Prop name="inertia" default="false" value="Boolean">
            Adds an attribute to the tippy element that changes the CSS
            transition timing function to add an inertial "slingshot" effect to
            the animation.
          </Prop>
          <Prop name="interactive" default="false" value="Boolean">
            Determines if a tooltip should be interactive, i.e. able to be
            hovered over or clicked without hiding.
          </Prop>
          <Prop name="interactiveBorder" default="false" value="Boolean">
            Determines the size of the invisible border around a tippy that will
            prevent it from hiding (only relevant for the hover trigger). Useful
            to prevent the tooltip from accidentally hiding from clumsy cursor
            movements.
          </Prop>
          <Prop name="lazy" default="true" value="Boolean">
            By default, the <code>popperInstance</code> (the positioning engine
            for the tippy) is lazily created. That is, it's only created when
            necessary (i.e. triggering the tippy for the first time). Setting
            this prop to false allows you to access the instance synchronously
            without needing to show the tooltip.
          </Prop>
          <Prop name="livePlacement" default="true" value="Boolean">
            Determines if the popper instance should listen to scroll events.
            This means it will update the position on scroll. If you don't want
            the tippy to flip around when scrolling, and the tippy's reference
            is not in a scrollable container, you can set this to false.
          </Prop>
          <Prop name="multiple" default="false" value="Boolean">
            Determines if the reference can have multiple tippy instances.
          </Prop>
          <Prop name="offset" default="false" value="Boolean">
            An offset that Popper.js uses to offset the popper element. Can work
            with both the x and y axis, distinct from{' '}
            <a href="#distance">distance</a>.
          </Prop>
          <Prop name="onHidden" default="noop" value="Function">
            Lifecycle function invoked when a tippy has fully transitioned out.
          </Prop>
          <Prop name="onHide" default="noop" value="Function">
            Lifecycle function invoked when a tippy begins to transition out.
          </Prop>
          <Prop name="onShow" default="noop" value="Function">
            Lifecycle function invoked when a tippy begins to transition in.
          </Prop>
          <Prop name="onShown" default="noop" value="Function">
            Lifecycle function invoked when a tippy has fully transitioned in.
          </Prop>
          <Prop name="performance" default="false" value="Boolean">
            If true, disables <code>data-tippy-*</code> attributes which reduces
            init execution by half.
          </Prop>
          <Prop
            name="placement"
            default="&quot;top&quot;"
            value={['"top"', '"bottom"', '"left"', '"right"']}
            type="string"
          >
            Positions the tippy relative to its reference element.
          </Prop>
          <Prop name="popperOptions" default="{}" value="Object">
            Specify custom Popper.js options. See the{' '}
            <a
              target="_blank"
              href="https://popper.js.org/popper-documentation.html"
            >
              Popper.js documentation
            </a>{' '}
            for more.
          </Prop>
          <Prop
            name="size"
            default="&quot;regular&quot;"
            value={['"small"', '"regular"', '"large"']}
          >
            The size of the tippy.
          </Prop>
          <Prop name="sticky" default="false" value="Boolean">
            Ensures the tippy stays stuck to its reference element if it moves
            around while showing.
          </Prop>
          <Prop name="target" default="&quot;&quot;" value="String">
            CSS selector used for event delegation.
          </Prop>
          <Prop name="theme" default="&quot;dark&quot;" value="String">
            Themes added as classes (each separated by a space) to the tippy's
            class list, which adds a <code>-theme</code> suffix, i.e.{' '}
            <code>"dark-theme"</code>.
          </Prop>
          <Prop name="touchHold" default="false" value="Boolean">
            Determines trigger behavior on touch devices. If true, instead of a
            tap on the reference and a tap elsewhere to hide the tippy, the
            reference must be pressed and held for the tippy to show. Letting go
            from the screen will hide it.
          </Prop>
          <Prop
            name="trigger"
            default="&quot;mouseenter focus&quot;"
            value="String"
          >
            The events (each separated by a space) which cause a tooltip to
            show.
          </Prop>
          <Prop name="zIndex" default="9999" value="Number">
            The <code>z-index</code> of the popper element.
          </Prop>
        </tbody>
      </table>
    </div>

    <h3>
      AJAX tooltips <Emoji class="section__icon-wrapper">🌐</Emoji>
    </h3>
    <p>
      Lifecycle functions allow you to do powerful things with tippys. Here's an
      example of dynamic content which on show, fetches a new random image from
      the Unsplash API. Note: this requires a browser which supports the newer
      fetch API.
    </p>
    <ResultBox>
      <Tippy
        key="ajax"
        onShow={actions.ajax.onShow}
        onHidden={actions.ajax.onHidden}
        arrow={true}
        content={
          <div>
            {state.ajax.error && 'Loading failed'}
            {!state.ajax.imageSrc ? (
              'Loading...'
            ) : (
              <img
                style={{ display: 'block' }}
                width="200"
                height="200"
                src={state.ajax.imageSrc}
              />
            )}
          </div>
        }
      >
        <button class="btn">Hover for a new image</button>
      </Tippy>
    </ResultBox>
    <a href="https://codepen.io/anon/pen/GEmOQy" target="_blank">
      CodePen Demo
    </a>

    <h3>
      Event delegation <Emoji class="section__icon-wrapper">📡</Emoji>
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
      <Emoji class="section__icon-wrapper">⚠️</Emoji>
      Avoid binding a Tippy instance to the body, as{' '}
      <code>mouseover / mouseoff</code> events will constantly fire as the
      cursor moves over the page. Instead, give it to the nearest possible
      parent element.
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
      <Emoji class="section__emoji">⚠️</Emoji>
      <code>Array.from</code> needs a polyfill for older browsers.
    </p>
  </section>
)
