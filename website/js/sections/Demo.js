import { h } from 'hyperapp'
import logo from '../../assets/img/logo.svg'
import Tippy from '../components/Tippy'
import Emoji from '../components/Emoji'

const ANIMATIONS = [
  'shift-away',
  'shift-toward',
  'perspective',
  'fade',
  'scale'
]

const printValue = value =>
  Array.isArray(value) ? `[${value.join(', ')}]` : value

export default () => (
  <section class="section" id="demo">
    <h2 class="section__heading">Tippy's features</h2>
    <div class="feature">
      <h3 class="feature__heading">Default</h3>
      <p>
        The default tippy tooltip looks like this when given no options. It has
        a nifty backdrop filling animation!
      </p>
      <Tippy content="I'm the default tooltip!">
        <button class="btn">Try me!</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji size="medium" class="feature__icon">
        ↕️
      </Emoji>
      <h3 class="feature__heading">Placement</h3>
      <p>
        A tooltip can be placed in four different ways in relation to its
        reference element. Additionally, the tooltip can be shifted using the
        suffix <code>-start</code> or <code>-end</code>.
      </p>
      {['top', 'bottom', 'left', 'right', 'top-start', 'top-end'].map(
        placement => (
          <Tippy placement={placement}>
            <button class="btn">
              {placement[0].toUpperCase() + placement.slice(1)}
            </button>
          </Tippy>
        )
      )}
    </div>

    <div class="feature">
      <Emoji size="medium" class="feature__icon">
        ▶️
      </Emoji>
      <h3 class="feature__heading">Arrows</h3>
      <p>
        Arrows point toward the reference element. There are two different types
        of arrows: sharp and round. You can transform the proportion and scale
        of the arrows any way you like.
      </p>
      <Tippy arrow={true} animation="fade">
        <button class="btn">Default</button>
      </Tippy>
      <Tippy arrow={true} arrowType="round" animation="fade">
        <button class="btn">Round</button>
      </Tippy>
      <Tippy arrow={true} arrowTransform="scaleX(1.5)" animation="fade">
        <button class="btn">Wide</button>
      </Tippy>
      <Tippy arrow={true} arrowTransform="scaleX(0.75)" animation="fade">
        <button class="btn">Skinny</button>
      </Tippy>
      <Tippy arrow={true} arrowTransform="scale(0.75)" animation="fade">
        <button class="btn">Small</button>
      </Tippy>
      <Tippy arrow={true} arrowTransform="scale(1.35)" animation="fade">
        <button class="btn">Large</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji size="medium" class="feature__icon">
        👏
      </Emoji>
      <h3 class="feature__heading">Triggers</h3>
      <p>Triggers define the types of events that cause a tooltip to show.</p>
      <Tippy trigger="mouseenter">
        <button class="btn">Hover or touch</button>
      </Tippy>
      <Tippy trigger="focus" hideOnClick={false}>
        <button class="btn">Focus or touch</button>
      </Tippy>
      <Tippy trigger="click">
        <button class="btn">Click</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji size="medium" class="feature__icon">
        ✍️
      </Emoji>
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
      <Emoji size="medium" class="feature__icon">
        💫
      </Emoji>
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
            Inertia ({animation[0] + animation.slice(1)})
          </button>
        </Tippy>
      ))}
      <Tippy
        animation="height"
        animateFill={false}
        lazy={false}
        distance={20}
        flip={false}
        onShow={tip => {
          tip.state.isMounted = true
          function loop() {
            tip.popperInstance.update()
            if (tip.state.isMounted) {
              requestAnimationFrame(loop)
            }
          }
          loop()
        }}
        onHidden={tip => {
          tip.state.isMounted = false
        }}
      >
        <button class="btn">Transition height (custom)</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji size="medium" class="feature__icon">
        ⏱️
      </Emoji>
      <h3 class="feature__heading">Duration</h3>
      <p>A tippy can have different transition durations.</p>
      {[0, 200, 1000, [250, 1000], [1000, 500]].map(duration => (
        <Tippy duration={duration}>
          <button class="btn">{printValue(duration)}</button>
        </Tippy>
      ))}
    </div>

    <div class="feature">
      <Emoji size="medium" class="feature__icon">
        ⏳
      </Emoji>
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
      {[0, 200, 800, [800, 0], [200, 800]].map(delay => (
        <Tippy delay={delay}>
          <button class="btn">{printValue(delay)}</button>
        </Tippy>
      ))}
    </div>

    <div class="feature">
      <Emoji size="medium" class="feature__icon">
        🖼️
      </Emoji>
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
      <Emoji size="medium" class="feature__icon">
        🖌️
      </Emoji>
      <h3 class="feature__heading">Themes</h3>
      <p>
        A tippy can have any kind of theme you want! Creating a custom theme is
        a breeze.
      </p>
      <Tippy
        content="Included in dist/themes/translucent.css"
        theme="translucent"
      >
        <button class="btn">Translucent</button>
      </Tippy>
      <Tippy
        content="Included in dist/themes/light.css"
        theme="light"
        animation="fade"
        arrow={true}
      >
        <button class="btn">Light</button>
      </Tippy>
      <Tippy
        content="Custom made for this demo. But I will probably include it soon!"
        theme="light-border"
        animateFill={false}
        animation="fade"
        arrow={true}
      >
        <button class="btn">Light-border</button>
      </Tippy>
      <Tippy
        content="Awesome colors! Custom made for this demo."
        theme="gradient"
      >
        <button class="btn">Gradient</button>
      </Tippy>
      <Tippy
        content="The style used in Gmail. Custom made for this demo."
        theme="google"
        animateFill={false}
        animation="fade"
        duration={200}
      >
        <button class="btn">Google</button>
      </Tippy>
    </div>

    <div class="feature">
      <Emoji size="medium" class="feature__icon">
        😍
      </Emoji>
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
        </Tippy.secondary>
        , and it's constantly improving.
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
        <button
          class="btn"
          oncontextmenu={event => {
            event.preventDefault()
          }}
        >
          Touch &amp; hold
        </button>
      </Tippy>
      <Tippy
        interactive={true}
        placement="bottom"
        arrow={true}
        theme="light-border"
        appendTo={ref => ref.parentNode}
        animation="fade"
        onHide={tip => {
          const anchor = tip.popper.querySelector('a')
          if (anchor && anchor._tippy && anchor._tippy.state.isVisible) {
            return false
          }
        }}
        trigger="click"
        content={
          <ul class="tippy-list">
            <li>
              <Tippy
                interactive={true}
                placement="right"
                theme="light-border"
                animateFill={false}
                appendTo={ref => ref.parentNode}
                animation="fade"
                content={
                  <ul class="tippy-list">
                    <li>
                      <Tippy
                        content="So many levels deep..."
                        onShow={tip => {
                          return tip.reference.closest('.tippy-popper')._tippy
                            .state.isVisible
                        }}
                      >
                        <button class="btn" style={{ margin: 0 }}>
                          Action
                        </button>
                      </Tippy>
                    </li>
                  </ul>
                }
              >
                <a style={{ cursor: 'pointer' }}>Open submenu ></a>
              </Tippy>
            </li>
          </ul>
        }
      >
        <button class="btn">Dropdown nesting (click)</button>
      </Tippy>
      <Tippy
        content="I'm hugging the tooltip!"
        distance={0}
        animation="fade"
        animateFill={false}
      >
        <button class="btn">Distance</button>
      </Tippy>
      <Tippy
        content="I'm offset by 10px on the x-axis, and 50px on the y-axis"
        offset="10, 50"
        animation="fade"
        animateFill={false}
      >
        <button class="btn">Offset</button>
      </Tippy>
    </div>
  </section>
)
