import { h } from 'hyperapp'
import Emoji from './Emoji'
import Heading from './Heading'
const Subheading = Heading('Why')

export default () => (
  <section class="section" id="getting-started">
    <Emoji class="section__icon-wrapper">🤔</Emoji>
    <Heading>Why use Tippy.js?</Heading>

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
    </ul>

    <p>
      These are the reasons behind Tippy.js. JavaScript logic is required to
      properly manage the position of these "poppers" (elements that exist
      outside the normal flow of the document).
    </p>
  </section>
)
