import { h } from 'hyperapp'
import logo from '../../assets/img/logo.svg'
import Tippy from './Tippy'
import Emoji from './Emoji'

const PLACEMENTS = ['top', 'bottom', 'left', 'right', 'top-start', 'top-end']
const ANIMATIONS = [
  'shift-away',
  'shift-toward',
  'perspective',
  'fade',
  'scale'
]

export default () => (
  <section class="section" id="demo">
    <h2 class="section__heading">Tippy's features</h2>
    <div class="feature">
      <h3 class="feature__heading">Default</h3>
      <p>
        The default tippy tooltip looks like this when given no options. It has
        a nifty backdrop filling animation!
      </p>
      <Tippy key="a" content="I'm the default tooltip!">
        <button class="btn">Try me!</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">↕️</Emoji>
      <h3 class="feature__heading">Placement</h3>
      <p>
        A tooltip can be placed in four different ways in relation to its
        reference element. Additionally, the tooltip be shifted.
      </p>
      {PLACEMENTS.map(placement => (
        <Tippy key={placement} placement={placement}>
          <button class="btn">
            {placement[0].toUpperCase() + placement.slice(1)}
          </button>
        </Tippy>
      ))}
    </div>

    <div class="feature">
      <Emoji class="feature__icon">▶️</Emoji>
      <h3 class="feature__heading">Arrows</h3>
      <p>
        Arrows point toward the reference element. There are two different types
        of arrows: sharp and round. You can transform the proportion and scale
        of the arrows any way you like.
      </p>
      <Tippy key="default" arrow={true} animation="fade">
        <button class="btn">Default</button>
      </Tippy>
      <Tippy key="round" arrow={true} arrowType="round" animation="fade">
        <button class="btn">Round</button>
      </Tippy>
      <Tippy
        key="wide"
        arrow={true}
        arrowTransform="scaleX(1.5)"
        animation="fade"
      >
        <button class="btn">Wide</button>
      </Tippy>
      <Tippy
        key="skinny"
        arrow={true}
        arrowTransform="scaleX(0.75)"
        animation="fade"
      >
        <button class="btn">Skinny</button>
      </Tippy>
      <Tippy
        key="small"
        arrow={true}
        arrowTransform="scale(0.75)"
        animation="fade"
      >
        <button class="btn">Small</button>
      </Tippy>
      <Tippy
        key="large"
        arrow={true}
        arrowTransform="scale(1.35)"
        animation="fade"
      >
        <button class="btn">Large</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">👏</Emoji>
      <h3 class="feature__heading">Triggers</h3>
      <p>Triggers define the types of events that cause a tooltip to show.</p>
      <Tippy key="mouseenter" trigger="mouseenter">
        <button class="btn">Hover or touch</button>
      </Tippy>
      <Tippy key="focus" trigger="focus">
        <button class="btn">Focus or touch</button>
      </Tippy>
      <Tippy trigger="click">
        <button class="btn">Click</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">✍️</Emoji>
      <h3 class="feature__heading">Interactivity</h3>
      <p>
        Tooltips can be interactive, meaning they won't hide when you hover over
        or click on them.
      </p>
      <Tippy interactive={true}>
        <button class="btn">Interactive (hover)</button>
      </Tippy>
      <Tippy interactive={true} trigger="click">
        <button class="btn">Interactive (click)</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">💫</Emoji>
      <h3 class="feature__heading">Animations</h3>
      <p>Tooltips can have different types of animations.</p>
      {ANIMATIONS.map(animation => (
        <Tippy animation={animation} arrow={true}>
          <button class="btn">
            {animation[0].toUpperCase() + animation.slice(1)}
          </button>
        </Tippy>
      ))}
      {ANIMATIONS.filter(animation => animation !== 'fade').map(animation => (
        <Tippy
          animation={animation}
          duration={[600, 300]}
          inertia={true}
          arrow={true}
        >
          <button class="btn">
            Inertia ({animation[0].toUpperCase() + animation.slice(1)})
          </button>
        </Tippy>
      ))}
    </div>

    <div class="feature">
      <Emoji class="feature__icon">⏱️</Emoji>
      <h3 class="feature__heading">Duration</h3>
      <p>A tippy can have different transition durations.</p>
      <Tippy duration={0}>
        <button class="btn">0ms</button>
      </Tippy>
      <Tippy duration={200}>
        <button class="btn">200ms</button>
      </Tippy>
      <Tippy duration={1000}>
        <button class="btn">1000ms</button>
      </Tippy>
      <Tippy duration={1000}>
        <button class="btn">1000ms</button>
      </Tippy>
      <Tippy duration={[250, 1000]}>
        <button class="btn">[250ms, 1000ms]</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">⏳</Emoji>
      <h3 class="feature__heading">Delay</h3>

      <p>
        Tooltips can delay showing or{' '}
        <Tippy.secondary content="*Hide delay is always 0 on touch devices for UX reasons">
          <span class="tippy" tabindex="0">
            hiding*
          </span>
        </Tippy.secondary>{' '}
        after a trigger.
      </p>

      <Tippy>
        <button class="btn">0ms</button>
      </Tippy>
      <Tippy delay={200}>
        <button class="btn">200ms</button>
      </Tippy>
      <Tippy delay={800}>
        <button class="btn">800ms</button>
      </Tippy>
      <Tippy delay={[800, 0]}>
        <button class="btn">[800ms, 0ms]</button>
      </Tippy>
      <Tippy delay={[200, 800]}>
        <button class="btn">[200ms, 800ms]</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">📡</Emoji>
      <h3 class="feature__heading">
        Event delegation <span class="badge">v2.1</span>
      </h3>
      <p>
        Bind a Tippy instance to a parent container and freely add new child
        elements without needing to create Tippy instances for them.
      </p>
      <Tippy target=".btn" content="I'm a Tippy tooltip!">
        <div>
          <button class="btn">Shared title</button>
          <button class="btn" data-tippy-content="Custom content">
            Custom content
          </button>
          <button class="btn" data-tippy-placement="right">
            Custom options
          </button>
        </div>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">🖼️</Emoji>
      <h3 class="feature__heading">HTML</h3>
      <p>
        Tooltips can contain HTML, allowing you to craft awesome interactive
        popovers.
      </p>
      <Tippy
        appendTo={el => el.parentNode}
        interactive={true}
        theme="light rounded"
        arrow={true}
        size="large"
        arrowTransform="scale(2)"
        distance={15}
        interactiveBorder={20}
        content={
          <div class="template" style={{ padding: '20px' }}>
            <img width="100" src={logo} />
            <h3>
              Look! The tippy logo is inside a <strong>tippy</strong>.
            </h3>
            <button
              class="btn"
              onclick={e => e.target.closest('.tippy-popper')._tippy.hide()}
            >
              Close
            </button>
          </div>
        }
      >
        <button class="btn">HTML Templates</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">🖌️</Emoji>
      <h3 class="feature__heading">Themes</h3>
      <p>
        A tippy can have any kind of theme you want! Creating a custom theme is
        a breeze.
      </p>
      <Tippy content="See-though!" theme="translucent">
        <button class="btn">Translucent</button>
      </Tippy>
      <Tippy content="Nice n' light" theme="light" arrow={true}>
        <button class="btn">Light</button>
      </Tippy>
      <Tippy content="Awesome colors!" theme="gradient">
        <button class="btn">Gradient</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji class="feature__icon">😍</Emoji>
      <h3 class="feature__heading">Misc</h3>
      <p>
        Tippy has a ton of{' '}
        <Tippy.secondary
          interactive={true}
          content={
            <div>
              Missing a feature you need? Submit a{' '}
              <a
                class="is-white"
                href="https://github.com/atomiks/tippyjs/issues"
                target="_blank"
              >
                feature request
              </a>{' '}
              on the GitHub repo!
            </div>
          }
        >
          <span class="tippy" tabindex="0">
            features
          </span>
        </Tippy.secondary>, and it's constantly improving.
      </p>
      <Tippy
        content="How cool's this?!"
        followCursor={true}
        arrow={true}
        animation="fade"
      >
        <button class="btn">Follow cursor</button>
      </Tippy>
      <Tippy
        content="You'll need a touch device for this one."
        touchHold={true}
      >
        <button class="btn">Touch &amp; Hold</button>
      </Tippy>
      <Tippy content="I'm hugging the tooltip!" distance={0} animation="fade">
        <button class="btn">Distance</button>
      </Tippy>
      <Tippy
        content="I'm hugging the tooltip!"
        offset="10, 50"
        animation="fade"
      >
        <button class="btn">Offset</button>
      </Tippy>
      <Tippy size="small">
        <button class="btn">Small</button>
      </Tippy>
      <Tippy size="large">
        <button class="btn">Large</button>
      </Tippy>
    </div>
  </section>
)
