import { h } from 'hyperapp'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import Tippy from '../components/Tippy'
import ResultBox from '../components/ResultBox'
import Heading from '../components/Heading'
const Subheading = Heading('Customizing Tooltips')
import HTML_BUTTON from '../../snippets/html-button.md'
import OPTIONS_OBJECT from '../../snippets/options-object.md'
import DATA_ATTRIBUTES from '../../snippets/data-attributes.md'
import MULTIPLE_CONTENT_HTML from '../../snippets/multiple-content-html.md'
import MULTIPLE_CONTENT_JS from '../../snippets/multiple-content-js.md'
import SET_DEFAULTS from '../../snippets/set-defaults.md'

export default () => (
  <section class="section">
    <Emoji class="section__icon-wrapper">⚙️</Emoji>
    <Heading>Customizing Tooltips</Heading>

    <p>
      <code>tippy()</code> takes an object of options as a second argument for
      you to configure the tooltips being created. Here's an example:
    </p>

    <Code content={HTML_BUTTON} />
    <Code content={OPTIONS_OBJECT} />

    <ResultBox>
      <Tippy
        content="I'm a tooltip!"
        delay={100}
        arrow={true}
        arrowType="round"
        size="large"
        duration={500}
        animation="scale"
      >
        <button class="btn">Text</button>
      </Tippy>
    </ResultBox>

    <Subheading>
      Data attributes <Emoji class="section__emoji">🏷</Emoji>
    </Subheading>
    <p>
      You can also specify options on the reference element itself by adding{' '}
      <code>data-tippy-*</code> attributes. This will override the options
      specified in the instance.
    </p>

    <p>
      Used in conjunction with the auto-tippy method, you can give elements
      custom tooltips without ever touching JavaScript.
    </p>

    <Code content={DATA_ATTRIBUTES} />

    <ResultBox>
      <Tippy delay={50} arrow={true} animation="shift-toward">
        <button class="btn">Text</button>
      </Tippy>
    </ResultBox>

    <p>
      Using <code>data-tippy-content</code> therefore allows you to use the
      function for common custom configuration while giving each tooltip
      different content.
    </p>

    <Code content={MULTIPLE_CONTENT_HTML} />
    <Code content={MULTIPLE_CONTENT_JS} />

    <Subheading>Default config</Subheading>
    <p>
      Use the <code>tippy.setDefaults()</code> method to change the default
      configuration for tippys. It will apply these settings to every future
      instance.
    </p>

    <Code content={SET_DEFAULTS} />

    <p>
      Note that the auto-initializing function is deferred with{' '}
      <code>setTimeout()</code>, which means you can change the default config
      before the tooltips are automatically created.
    </p>
  </section>
)
