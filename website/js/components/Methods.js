import { h } from 'hyperapp'
import Emoji from './Emoji'
import Code from './Code'
import Heading from './Heading'
const Subheading = Heading('Methods')

const ELEMENT = `
<button data-tippy="Hello">Text</button>
`
const UPDATE = `
tip.set({
  content: 'New content',
  arrow: true,
  duration: 1000,
  animation: 'perspective'
})
`

export default () => (
  <section class="section">
    <Emoji class="section__icon-wrapper">🕹</Emoji>

    <Heading>Methods</Heading>
    <p>
      Tippy instances have 7 methods available which allow you to control the
      tooltip without the use of UI events.
    </p>

    <Code lang="html">{ELEMENT}</Code>
    <Code lang="js">const btn = document.querySelector('button')</Code>

    <p>
      The Tippy instance is stored on the button element via the{' '}
      <code>_tippy</code> property.{' '}
    </p>
    <Code lang="js">const tip = btn._tippy</Code>
    <blockquote class="blockquote">
      <strong>Why is it prefixed with an underscore?</strong> Since we're
      attaching a non-standard property to an <code>Element</code>, we prefix it
      with an underscore. In the future, there may exist a real{' '}
      <code>tippy</code> property of elements that would get overwritten by the
      library, and real DOM properties are never prefixed with an underscore.
    </blockquote>

    <Subheading>Show the tooltip</Subheading>
    <Code lang="js">tip.show()</Code>

    <Subheading>Hide the tooltip</Subheading>
    <Code lang="js">tip.hide()</Code>

    <Subheading>Custom transition duration</Subheading>
    <p>Pass a number in as an argument to override the instance option:</p>
    <Code lang="js">tip.show(200)</Code>

    <Subheading>Disable the tooltip</Subheading>
    <p>The tooltip can be temporarily disabled from showing/hiding:</p>
    <Code lang="js">tip.disable()</Code>

    <p>To re-enable:</p>
    <Code lang="js">tip.enable()</Code>

    <Subheading>Destroy the tooltip</Subheading>
    <p>
      To permanently destroy the tooltip and remove all listeners from the
      reference element:
    </p>
    <Code lang="js">tip.destroy()</Code>

    <p>
      The <code>_tippy</code> property is deleted from the reference element
      upon destruction.
    </p>

    <Subheading>Update the tooltip</Subheading>
    <p>
      Pass an object of new props to the <code>set()</code> method to update the
      tip. The tooltip element will be redrawn to reflect the change (this
      involves creating a new popper element, so the old reference is thrown
      away).
    </p>
    <Code lang="js">{UPDATE}</Code>
  </section>
)
