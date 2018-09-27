import { h } from 'hyperapp'
import { toKebabCase } from '../utils'
import Code from './Code'

import APPEND_TO from '../../snippets/append-to'
import WAIT from '../../snippets/wait'

const Prop = (props, children) => {
  const id = toKebabCase(props.name) + '-option'
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

export default () => (
  <div class="table-wrapper">
    <table class="table" cellspacing="0">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Default</th>
          <th>Value</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        <Prop name="a11y" default="true" value="Boolean">
          If <code>true</code>, ensures the reference element can receive focus
          by adding <code>tabindex="0"</code> if the element is not natively
          focusable like a <code>button</code>.
        </Prop>
        <Prop name="allowHTML" default="true" value="Boolean">
          Determines if HTML can be rendered in the tippy.
        </Prop>
        <Prop name="animateFill" default="true" value="Boolean">
          Determines if the tippy's background fill should be animated. Disabled
          if <code>arrow: true</code>.
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
          <Code content={APPEND_TO} />
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
        <Prop
          name="content"
          default="&quot;&quot;"
          value={['String', 'Element']}
        >
          The content of the tippy.
        </Prop>
        <Prop name="delay" default="[0, 20]" value={['Number', '[show, hide]']}>
          Delay in ms once a trigger event is fired before a tippy shows or
          hides. Use an array of numbers such as <code>[100, 500]</code> to
          specify a different value for show and hide. Use <code>null</code> in
          the array to use the default value, e.g. <code>[null, 50]</code>.
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
          How far in pixels the tippy element is from the reference element.
          Only applies to a single axis and not to the parent popper element,
          see{' '}
          <a class="link" href="#offset">
            offset
          </a>
          .
        </Prop>
        <Prop name="flip" default="true" value="Boolean">
          Determines if the tippy flips so that it is placed within the viewport
          as best it can be if there is not enough room.
        </Prop>
        <Prop
          name="flipBehavior"
          default="&quot;flip&quot;"
          value={['"flip"', 'Array']}
        >
          Determines the order of flipping, i.e. which placements to prefer if a
          certain placement cannot be used. Use an array such as{' '}
          <code>["bottom", "left"]</code> to prefer the "left" placement if
          "bottom" is unavailable. By default, it chooses the opposite axis,
          i.e. "top".
        </Prop>
        <Prop
          name="followCursor"
          default="false"
          value={['Boolean', '"vertical"', '"horizontal"']}
        >
          Determines if the tippy follows the user's mouse cursor while showing.
          Use the strings <code>"vertical"</code> or <code>"horizontal"</code>
          to only follow the cursor on a single axis.
        </Prop>
        <Prop name="hideOnClick" default="true" value={['Boolean', '"toggle"']}>
          Determines if the tippy should hide if its reference element was
          clicked. For click-triggered tippys, using <code>false</code> will
          prevent the tippy from ever hiding once it is showing. To prevent
          clicks outside of the tippy from hiding it but still allow it to be
          toggled, use the string <code>"toggle"</code>.
        </Prop>
        <Prop name="inertia" default="false" value="Boolean">
          Adds an attribute to the tippy element that changes the CSS transition
          timing function to add an inertial "slingshot" effect to the
          animation.
        </Prop>
        <Prop name="interactive" default="false" value="Boolean">
          Determines if a tippy should be interactive, i.e. able to be hovered
          over or clicked without hiding.
        </Prop>
        <Prop name="interactiveBorder" default="false" value="Boolean">
          Determines the size of the invisible border around a tippy that will
          prevent it from hiding (only relevant for the hover trigger). Useful
          to prevent the tippy from accidentally hiding from clumsy cursor
          movements.
        </Prop>
        <Prop name="interactiveDebounce" default="0" value="Number">
          A number in ms that debounces the <code>onMouseMove</code> handler
          which determines when the tippy should hide.
        </Prop>
        <Prop name="lazy" default="true" value="Boolean">
          By default, the <code>popperInstance</code> (the positioning engine
          for the tippy) is lazily created. That is, it's only created when
          necessary (i.e. triggering the tippy for the first time). Setting this
          prop to false allows you to access the instance synchronously without
          needing to show the tippy.
        </Prop>
        <Prop name="livePlacement" default="true" value="Boolean">
          Determines if the popper instance should listen to scroll events. This
          means it will update the position on scroll. If you don't want the
          tippy to flip around when scrolling, and the tippy's reference is not
          in a scrollable container, you can set this to false.
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
          Positions the tippy relative to its reference element. Use the suffix{' '}
          <code>-start</code> or <code>-end</code> to shift the tippy to the
          start or end of the reference element, instead of centering it. For
          example, <code>top-start</code> or <code>left-end</code>.
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
          name="shouldPopperHideOnBlur"
          default="(FocusOutEvent) => true"
          value="Function"
        >
          A function that returns a boolean to determine if the popper element
          should hide if it's blurred (applies only if interactive).{' '}
          <span style={{ display: 'block', marginBottom: '10px' }} />
          If the popper element is blurred (i.e. no elements within it are in
          focus), the popper is hidden. However, there are cases in which you
          may need to keep it visible even when not in focus.
        </Prop>
        <Prop name="showOnInit" default="false" value="Boolean">
          If <code>true</code>, the tooltip will be shown immediately once the
          instance is created.
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
        <Prop name="touch" default="true" value="Boolean">
          Determines if the tippy displays on touch devices.
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
          value={['"mouseenter"', '"focus"', '"click"', '"manual"']}
        >
          The events (each separated by a space) which cause a tippy to show.
          Use manual to only trigger the tippy programmatically.
        </Prop>
        <Prop name="updateDuration" default="200" value="Number">
          The transition duration between position updates for the{' '}
          <code>sticky</code> option. Set to <code>0</code> to prevent flips
          from transitioning.
        </Prop>
        <Prop name="wait" default="null" value="Function">
          A function that, when defined, will wait until you manually invoke{' '}
          <code>show()</code> when a tippy is triggered. It takes the tippy
          instance and the trigger event as arguments.
          <Code content={WAIT} />
        </Prop>
        <Prop name="zIndex" default="9999" value="Number">
          The <code>z-index</code> of the popper element.
        </Prop>
      </tbody>
    </table>
  </div>
)
