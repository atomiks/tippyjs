import { h } from 'hyperapp'

import HTML_BUTTON from '../../snippets/html-button.md'
import OPTIONS_OBJECT from '../../snippets/options-object.md'
import DATA_ATTRIBUTES from '../../snippets/data-attributes.md'
import SET_DEFAULTS from '../../snippets/set-defaults.md'

import Section from '../components/Section'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import Tippy from '../components/Tippy'
import ResultBox from '../components/ResultBox'
import Heading from '../components/Heading'

const TITLE = 'Customizing Tooltips'
const Subheading = Heading(TITLE)

export default () => (
  <Section title={TITLE} emoji="⚙️">
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
      <Emoji class="section__emoji">🏷</Emoji> Data attributes
    </Subheading>
    <p>
      You can also specify options on the reference element itself by adding{' '}
      <code>data-tippy-*</code> attributes. This will override the options
      specified in the instance.
    </p>

    <p>
      Used in conjunction with the Auto Method, you can give elements custom
      tooltips without ever touching JavaScript.
    </p>

    <Code content={DATA_ATTRIBUTES} />

    <ResultBox>
      <Tippy delay={50} arrow={true} animation="shift-toward">
        <button class="btn">Text</button>
      </Tippy>
    </ResultBox>

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
  </Section>
)
