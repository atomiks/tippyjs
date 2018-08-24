import { h } from 'hyperapp'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import Heading from '../components/Heading'
const Subheading = Heading('AllOptions')
import ResultBox from '../components/ResultBox'
import OptionsTable from '../components/OptionsTable'
import Tippy from '../components/Tippy'
import AJAX from '../../snippets/ajax.md'
import EVENT_DELEGATION_HTML from '../../snippets/event-delegation-html'
import EVENT_DELEGATION_JS from '../../snippets/event-delegation-js'
import SCROLLABLE_CONTAINER from '../../snippets/scrollable-container'
import DISABLE_TOUCH from '../../snippets/disable-touch'

export default () => (state, actions) => (
  <section class="section" id="all-options">
    <Emoji class="section__icon-wrapper">🔮</Emoji>
    <Heading>All Options</Heading>
    <p>Below is a list of all possible options you can pass to tippy.</p>

    <OptionsTable />

    <Subheading>AJAX tooltips</Subheading>
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

    <Subheading>Event delegation</Subheading>
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
      <Emoji small>⚠️</Emoji>
      Avoid binding a Tippy instance to the body, as{' '}
      <code>mouseover / mouseoff</code> events will constantly fire as the
      cursor moves over the page. Instead, give it to the nearest possible
      parent element.
    </p>

    <Subheading>Tooltips inside a scrollable container</Subheading>
    <p>
      Add the following options to make the tooltip not stay stuck within the
      viewport.
    </p>
    <Code content={SCROLLABLE_CONTAINER} />
  </section>
)
