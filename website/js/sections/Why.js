import { h } from 'hyperapp'
import Section from '../components/Section'
import { Emojis } from './TableOfContents'

const TITLE = 'Why Use Tippy.js?'

export default () => (
  <Section title={TITLE} emoji={Emojis.WHY}>
    <p>
      You might be wondering why you should use a 14 kB JS library for tooltips
      and popovers instead of a CSS solution. Pure CSS tooltips are great for
      simple tooltips when the reference element is positioned in a certain way,
      but they:
    </p>

    <ul>
      <li>
        Will overflow when the tooltip is large and the reference is close to
        the window edge
      </li>
      <li>Can't flip to stay optimally visible within the viewport</li>
      <li>Can't follow the mouse cursor</li>
      <li>
        Difficult to work with self-closing elements like <code>img</code>
      </li>
      <li>JavaScript is required for dynamic HTML content</li>
      <li>JavaScript is required to perform side effects (e.g. AJAX)</li>
    </ul>

    <p>
      In addition, Tippy automatically handles many use cases available
      declaratively in a simple option API. Options like{' '}
      <code>followCursor</code>, <code>interactive</code>, <code>touch</code>,{' '}
      <code>arrow</code>, and the <code>on*</code> lifecycle functions make
      dealing with tooltips & popovers a breeze.
    </p>
  </Section>
)
