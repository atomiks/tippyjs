import { h } from 'hyperapp'
import Section from '../components/Section'
import Heading from '../components/Heading'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import ExternalLink from '../components/ExternalLink'

const TITLE = 'Table of Contents'
const Subheading = Heading(TITLE)

export const Emojis = {
  WHY: '🤔',
  GETTING_STARTED: '📦',
  CREATING_TOOLTIPS: '🔧',
  CUSTOMIZING_TOOLTIPS: '⚙️',
  ALL_OPTIONS: '🔮',
  OBJECTS: '🏷️',
  METHODS: '🕹',
  HTML_CONTENT: '🖼️',
  CREATING_CUSTOM_THEMES: '🖌️',
}

export default () => (
  <Section title={TITLE} emoji="🗺️">
    <ul class="table-of-contents">
      <li>
        <a href="#why-use-tippy-js">
          <Emoji size="small">{Emojis.WHY}</Emoji>
          Why Use Tippy.js?
        </a>
      </li>
      <li>
        <a href="#getting-started">
          <Emoji size="small">{Emojis.GETTING_STARTED}</Emoji>
          Getting Started
        </a>
      </li>
      <li>
        <a href="#creating-tooltips">
          <Emoji size="small">{Emojis.CREATING_TOOLTIPS}</Emoji>
          Creating Tooltips
        </a>
      </li>
      <li>
        <a href="#customizing-tooltips">
          <Emoji size="small">{Emojis.CUSTOMIZING_TOOLTIPS}</Emoji>
          Customizing Tooltips
        </a>
      </li>
      <li>
        <a href="#all-options">
          <Emoji size="small">{Emojis.ALL_OPTIONS}</Emoji>
          All Options
        </a>
      </li>
      <li>
        <a href="#objects">
          <Emoji size="small">{Emojis.OBJECTS}</Emoji>
          Objects
        </a>
      </li>
      <li>
        <a href="#methods">
          <Emoji size="small">{Emojis.METHODS}</Emoji>
          Methods
        </a>
      </li>
      <li>
        <a href="#html-content">
          <Emoji size="small">{Emojis.HTML_CONTENT}</Emoji>
          HTML Content
        </a>
      </li>
      <li>
        <a href="#creating-custom-themes">
          <Emoji size="small">{Emojis.CREATING_CUSTOM_THEMES}</Emoji>
          Creating Custom Themes
        </a>
      </li>
    </ul>
  </Section>
)
