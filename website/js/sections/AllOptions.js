import { h } from 'hyperapp'

import AJAX from '../../snippets/ajax'
import EVENT_DELEGATION_HTML from '../../snippets/event-delegation-html'
import EVENT_DELEGATION_JS from '../../snippets/event-delegation-js'
import SCROLLABLE_CONTAINER from '../../snippets/scrollable-container'
import DISABLE_TOUCH from '../../snippets/disable-touch'
import HIDE_TOOLTIPS_ON_SCROLL from '../../snippets/hide-tooltips-on-scroll'
import CANCEL_LIFECYCLE_FUNCTION from '../../snippets/cancel-lifecycle-function'
import BUTTONS_WITH_TOOLTIPS_TOUCH from '../../snippets/buttons-with-tooltips-touch'

import Section from '../components/Section'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import Heading from '../components/Heading'
import ResultBox from '../components/ResultBox'
import OptionsTable from '../components/OptionsTable'
import Tippy from '../components/Tippy'
import ExternalLink from '../components/ExternalLink'

const TITLE = 'All Options'
const Subheading = Heading(TITLE)

const INITIAL_AJAX_CONTENT = '<div style="margin:5px 0;">Loading...</div>'

export default () => (state, actions) => (
  <Section title={TITLE} emoji="🔮">
    <p>Below is a list of all possible options you can pass to tippy.</p>

    <OptionsTable />

    <Subheading>
      <Emoji class="section__emoji">🌐</Emoji> AJAX tooltips
    </Subheading>
    <p>
      Lifecycle functions allow you to do powerful things with tippys. Here's an
      example of dynamic content which on show, fetches a new random image from
      the Unsplash API.
    </p>
    <ResultBox>
      <Tippy
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
    <Code content={AJAX} />

    <p>
      Note that if you don't specify the dimensions of the image (
      <code>width</code> and <code>height</code>
      ), the tooltip will be positioned incorrectly once it loads. This is
      because the position of the tooltip is updated before the image's
      dimensions become known by the browser.
    </p>
    <p>
      <strong>Improved animation</strong>
    </p>
    <ResultBox>
      <Tippy
        placement="bottom"
        animation="fade"
        animateFill={false}
        duration={200}
        theme="ajax"
        onShow={tip => {
          if (tip.state.isFetching === true || tip.state.canFetch === false) {
            return
          }

          tip.state.isFetching = true
          tip.state.canFetch = false

          const { tooltip, content } = tip.popperChildren

          fetch('https://unsplash.it/200/?random')
            .then(response => response.blob())
            .then(blob => {
              tip.state.isFetching = false

              const url = URL.createObjectURL(blob)

              if (!tip.state.isVisible) {
                return
              }

              const img = new Image()
              img.width = 200
              img.height = 200
              img.src = url

              if (!tip._transitionEndListener) {
                tip._transitionEndListener = event => {
                  if (event.target === event.currentTarget) {
                    content.style.opacity = '1'
                    tip.setContent(img)
                  }
                }
              }
              tooltip.addEventListener(
                'transitionend',
                tip._transitionEndListener
              )

              if (!tip._baseHeight) {
                tip._baseHeight = tooltip.clientHeight
              }

              content.style.opacity = '0'
              tip.setContent(img)
              const height = tooltip.clientHeight
              tooltip.style.height = tip._baseHeight + 'px'
              void tooltip.offsetHeight
              tooltip.style.height = height + 'px'
              tip.setContent('')

              function loop() {
                tip.popperInstance.update()
                if (tip.state.isVisible) {
                  requestAnimationFrame(loop)
                }
              }
              loop()
            })
            .catch(() => {
              tip.state.isFetching = false
            })
        }}
        onHidden={tip => {
          tip.state.canFetch = true
          tip.setContent(INITIAL_AJAX_CONTENT)
          const { tooltip } = tip.popperChildren
          tooltip.style.height = null
          tooltip.removeEventListener(
            'transitionend',
            tip._transitionEndListener
          )
          tip._transitionEndListener = null
        }}
        content={INITIAL_AJAX_CONTENT}
      >
        <button class="btn">Hover for a new image</button>
      </Tippy>
    </ResultBox>
    <p>
      See the{' '}
      <ExternalLink to="https://codepen.io/atomiks/pen/LgjMbW">
        CodePen demo
      </ExternalLink>
      .
    </p>

    <Subheading>
      <Emoji class="section__emoji">📡</Emoji> Event delegation
    </Subheading>
    <p>
      Event delegation only requires minimal setup. Your setup should look
      similar to this, with a parent element wrapping the child elements you
      would like to give tooltips to:
    </p>
    <Code content={EVENT_DELEGATION_HTML} />

    <p>
      Then, specify a CSS selector as the <code>target</code> that matches child
      elements which should receive tooltips
    </p>
    <Code content={EVENT_DELEGATION_JS} />
    <p>
      <Emoji size="small">⚠️</Emoji>
      Avoid binding a Tippy instance to the body, as{' '}
      <code>mouseover / mouseout</code> events will constantly fire as the
      cursor moves over the page. Instead, give it to the nearest possible
      parent element.
    </p>

    <Subheading>Tooltips inside a scrollable container</Subheading>
    <p>
      Add the following options to prevent the tippy from staying stuck within
      the viewport.
    </p>
    <Code content={SCROLLABLE_CONTAINER} />

    <Subheading>Hiding tooltips on scroll</Subheading>
    <p>
      In some cases it may be desirable to hide tooltips when scrolling (for
      example, on touch devices).
    </p>
    <Code content={HIDE_TOOLTIPS_ON_SCROLL} />

    <Subheading>Cancel tooltips from showing or hiding</Subheading>
    <p>
      If you return <code>false</code> in the <code>onShow</code> or{' '}
      <code>onHide</code> lifecycle function, it will cancel the operation. Note
      that this is synchronous, so it won't wait for an AJAX request, etc.
    </p>
    <Code content={CANCEL_LIFECYCLE_FUNCTION} />

    <Subheading>Buttons with tooltips on touch devices</Subheading>
    <p>
      A tooltip on a button is generally used to convey information before the
      user decides to click on it. On touch devices, this isn't possible because
      a tap is required to show the tooltip, which will fire a click event.
    </p>
    <p>
      On iOS, a tap will show the tooltip but click events won't fire until a
      second tap. This allows the user to see the tooltip before deciding to
      click the button. On Android, clicking the button will show the tooltip
      and also fire a click event.
    </p>
    <p>
      Depending on your use case, one of these will be preferred, so user agent
      checking may be needed. If neither behavior is preferred, consider using
      the <code>touchHold: true</code> option which allows the user to see the
      tooltip while pressing and holding the button, but won't fire a click
      event unless the click appears to be intentional.
    </p>
    <Code content={BUTTONS_WITH_TOOLTIPS_TOUCH} />
  </Section>
)
