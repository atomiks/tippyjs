import { h } from 'hyperapp'

import Section from '../components/Section'
import Emoji from '../components/Emoji'
import Heading from '../components/Heading'

const TITLE = 'Browser Support'

export default () => (state, actions) => (
  <Section title={TITLE} emoji="💻">
    <p>
      Tippy supports browsers with <code>requestAnimationFrame</code> and{' '}
      <code>MutationObserver</code> support.
    </p>
    <p>
      <Emoji size="small">⚠️</Emoji> IE11 requires a <code>classList</code>{' '}
      polyfill if using an SVG element as the reference.
    </p>
  </Section>
)
