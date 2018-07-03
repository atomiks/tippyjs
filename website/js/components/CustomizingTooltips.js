import { h } from 'hyperapp'
import Emoji from './Emoji'
import Code from './Code'
import Tippy from './Tippy'
import ResultBox from './ResultBox'
import Heading from './Heading'
const Subheading = Heading('Customizing Tooltips')

const HTML_BUTTON = `<button class="btn">Text</button>`
const OBJECT_OF_PROPS = `
tippy('.btn', {
  content: "I'm a tooltip!",
  delay: 100,
  arrow: true,
  arrowType: 'round',
  size: 'large',
  duration: 500
  animation: 'scale'
})
`
const DATA_ATTRIBUTES = `
<button
  class="btn"
  data-tippy="I'm a Tippy tooltip!"
  data-tippy-delay="50"
  data-tippy-arrow="true"
  data-tippy-animation="shift-toward"
>
  Text
</button>
`
const MULTIPLE_CONTENT = `
<button class="btn" data-tippy-content="Tooltip A">Text</button>
<button class="btn" data-tippy-content="Tooltip B">Text</button>
<button class="btn" data-tippy-content="Tooltip C">Text</button>
`
const MULTIPLE_CONTENT_CONFIG = `
tippy('.btn', {
  animation: 'shift-toward',
  arrow: true,
  delay: 50
})
`
const SET_DEFAULTS = `
tippy.setDefaults({
  arrow: true,
  arrowType: 'round',
  duration: 0
})
`

export default () => (
  <section class="section" id="customizing-tooltips">
    <Emoji class="section__icon-wrapper">⚙️</Emoji>
    <Heading>Customizing Tooltips</Heading>

    <p>
      <code>tippy()</code> takes an object of props as a second argument for you
      to configure the tooltips being created. Here's an example:
    </p>

    <Code lang="html">{HTML_BUTTON}</Code>
    <Code lang="js">{OBJECT_OF_PROPS}</Code>

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

    <Code lang="html">{DATA_ATTRIBUTES}</Code>

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

    <Code lang="html">{MULTIPLE_CONTENT}</Code>
    <Code lang="js">{MULTIPLE_CONTENT_CONFIG}</Code>

    <Subheading>Default config</Subheading>
    <p>
      Use the <code>tippy.setDefaults()</code> method to change the default
      configuration for tippys. It will apply these settings to every future
      instance.
    </p>

    <Code lang="js">{SET_DEFAULTS}</Code>
  </section>
)
