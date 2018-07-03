import { h } from 'hyperapp'
import logo from '../../assets/img/logo.svg'
import { emoji } from '../utils'

export default () => (state, { demo }) => (
  <section class="section" id="demo">
    <h2 class="section__heading">Tippy's features</h2>
    <div class="feature">
      <h3 class="feature__heading">Default</h3>
      <p>
        The default tippy tooltip looks like this when given no options. It has
        a nifty backdrop filling animation!
      </p>
      <button class="btn" title="I'm the default tooltip!">
        Try me!
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('↕️')} />
      <h3 class="feature__heading">Placement</h3>
      <p>
        A tooltip can be placed in four different ways in relation to its
        reference element. Additionally, the tooltip can be shifted.
      </p>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-placement="top"
      >
        Top
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-placement="bottom"
      >
        Bottom
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-placement="left"
      >
        Left
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-placement="right"
      >
        Right
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-placement="top-start"
      >
        Top-Start
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-placement="top-end"
      >
        Top-End
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('▶️')} />
      <h3 class="feature__heading">Arrows</h3>
      <p>
        Arrows point toward the reference element. There are two different types
        of arrows: sharp and round. You can transform the proportion and scale
        of the arrows any way you like.
      </p>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-arrow="true"
        data-tippy-animation="fade"
      >
        Default
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-arrow="true"
        data-tippy-arrowType="round"
        data-tippy-animation="fade"
      >
        Round
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-arrow="true"
        data-tippy-arrowTransform="scaleX(1.5)"
        data-tippy-animation="fade"
      >
        Wide
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-arrow="true"
        data-tippy-arrowTransform="scaleX(0.75)"
        data-tippy-animation="fade"
      >
        Skinny
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-arrow="true"
        data-tippy-arrowTransform="scale(0.75)"
        data-tippy-animation="fade"
      >
        Small
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-arrow="true"
        data-tippy-arrowTransform="scale(1.35)"
        data-tippy-animation="fade"
      >
        Large
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('👏')} />
      <h3 class="feature__heading">Triggers</h3>
      <p>Triggers define the types of events that cause a tooltip to show.</p>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-trigger="mouseenter"
      >
        Hover or touch
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-trigger="focus"
        data-tippy-hideOnClick="false"
      >
        Focus or touch
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-trigger="click"
      >
        Click
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('✍️')} />
      <h3 class="feature__heading">Interactivity</h3>
      <p>
        Tooltips can be interactive, meaning they won't hide when you hover over
        or click on them.
      </p>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-interactive="true"
      >
        Interactive (hover)
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-interactive="true"
        data-tippy-trigger="click"
      >
        Interactive (click)
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('💫')} />
      <h3 class="feature__heading">Animations</h3>
      <p>Tooltips can have different types of animations.</p>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="shift-away"
        data-tippy-arrow="true"
      >
        Shift away
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="shift-toward"
        data-tippy-arrow="true"
      >
        Shift toward
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="fade"
        data-tippy-arrow="true"
      >
        Fade
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="scale"
        data-tippy-arrow="true"
      >
        Scale
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="perspective"
        data-tippy-arrow="true"
      >
        Perspective
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="shift-away"
        data-tippy-inertia="true"
        data-tippy-duration="[600, 300]"
        data-tippy-arrow="true"
      >
        Inertia (shift-away)
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="shift-toward"
        data-tippy-inertia="true"
        data-tippy-duration="[600, 300]"
        data-tippy-arrow="true"
      >
        Inertia (shift-toward)
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="scale"
        data-tippy-inertia="true"
        data-tippy-duration="[600, 300]"
        data-tippy-arrow="true"
      >
        Inertia (scale)
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-animation="perspective"
        data-tippy-inertia="true"
        data-tippy-duration="[600, 300]"
        data-tippy-arrow="true"
      >
        Inertia (perspective)
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('⏱️')} />
      <h3 class="feature__heading">Duration</h3>
      <p>A tippy can have different transition durations.</p>
      <button class="btn" title="I'm a Tippy tooltip!" data-tippy-duration="0">
        0ms
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-duration="200"
      >
        200ms
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-duration="1000"
      >
        1000ms
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-duration="[500, 200]"
      >
        [500ms, 200ms]
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('⏳')} />
      <h3 class="feature__heading">Delay</h3>

      <p>
        Tooltips can delay showing or{' '}
        <span
          tabindex="0"
          class="tippy"
          title="*Hide delay is always 0 on touch devices for UX reasons"
        >
          hiding*
        </span>{' '}
        after a trigger.
      </p>
      <button class="btn" title="I'm a Tippy tooltip!" data-tippy-delay="100">
        100ms
      </button>
      <button class="btn" title="I'm a Tippy tooltip!" data-tippy-delay="500">
        500ms
      </button>
      <button
        class="btn"
        title="I'm a Tippy tooltip!"
        data-tippy-delay="[500, 200]"
      >
        [500ms, 200ms]
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('📡')} />
      <h3 class="feature__heading">
        Event delegation <span class="badge">v2.1</span>
      </h3>
      <p>
        Bind a Tippy instance to a parent container and freely add new child
        elements without needing to create Tippy instances for them.
      </p>
      <div id="demo__event-delegation" title="Shared title" data-exclude>
        <button class="btn">Shared title</button>
        <button class="btn" title="Custom title">
          Custom title
        </button>
        <button class="btn" data-tippy-placement="right">
          Custom options
        </button>
      </div>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('🖼️')} />
      <h3 class="feature__heading">HTML</h3>
      <p>
        Tooltips can contain HTML, allowing you to craft awesome interactive
        popovers.
      </p>
      <button
        oncreate={demo.htmlTippy}
        class="btn"
        data-tippy-interactive="true"
        data-tippy-theme="light rounded"
        data-tippy-arrow="true"
        data-tippy-size="large"
        data-tippy-arrowTransform="scale(2)"
        data-tippy-animation="fade"
        data-tippy-distance="15"
        data-tippy-interactiveBorder="20"
        data-local
      >
        HTML Templates
      </button>
      <div id="feature__html" data-template>
        <div style={{ padding: '20px' }}>
          <img width="100" src={logo} />
          <h3>
            Look! The tippy logo is inside a <strong>tippy</strong>.
          </h3>
          <button class="btn" data-close>
            Close
          </button>
        </div>
      </div>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('🖌️')} />
      <h3 class="feature__heading">Themes</h3>
      <p>
        A tippy can have any kind of theme you want! Creating a custom theme is
        a breeze.
      </p>
      <button class="btn" title="See-through!" data-tippy-theme="translucent">
        Translucent
      </button>
      <button
        class="btn"
        title="Nice n' light"
        data-tippy-theme="light"
        data-tippy-arrow="true"
      >
        Light
      </button>
      <button class="btn" title="Awesome colors!" data-tippy-theme="gradient">
        Gradient
      </button>
    </div>

    <div class="feature">
      <div class="feature__icon" oncreate={emoji('😍')} />
      <h3 class="feature__heading">Misc</h3>
      <p>
        Tippy has a ton of{' '}
        <span
          title="Missing a feature you need? Submit a <a class='is-white' href='https://github.com/atomiks/tippyjs/issues' target='_blank'>feature request</a> on the GitHub repo!"
          class="tippy"
          tabindex="0"
          data-tippy-interactive="true"
          data-tippy-size="large"
        >
          features
        </span>, and it's constantly improving.
      </p>
      <button
        class="btn"
        title="How cool's this?!"
        data-tippy-followCursor="true"
        data-tippy-arrow="true"
        data-tippy-animation="fade"
      >
        Follow cursor
      </button>
      <button
        class="btn"
        title="You'll need a touch device for this one."
        data-tippy-touchHold="true"
      >
        Touch &amp; Hold
      </button>
      <button
        class="btn"
        title="I'm hugging the tooltip!"
        data-tippy-distance="0"
        data-tippy-animation="fade"
      >
        Distance
      </button>
      <button
        class="btn"
        title="10px x-axis, 50px y-axis offset"
        data-tippy-offset="10, 50"
      >
        Offset
      </button>
      <button class="btn" title="I'm a Tippy tooltip!" data-tippy-size="small">
        Small
      </button>
      <button class="btn" title="I'm a Tippy tooltip!" data-tippy-size="large">
        Large
      </button>
    </div>
  </section>
)
