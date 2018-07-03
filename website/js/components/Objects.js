import { h } from 'hyperapp'
import Emoji from './Emoji'
import Code from './Code'
import Heading from './Heading'
const Subheading = Heading('Objects')

const TIP_COLLECTION = `
{
  // targets that should receive a tippy
  targets: '.btn',

  // default props + options merged together
  props: { ... },

  // array of all instances that were created
  instances: [tip, tip, tip, ...],

  // method to destroy all the tooltips that were created
  destroyAll() { ... }
}
`

export default () => (
  <section class="section">
    <Emoji class="section__icon-wrapper">🏷️</Emoji>
    <Heading>Objects</Heading>
    <p>
      When using Tippy.js, there are two types of objects to think about:
      collections and instances.
    </p>

    <Subheading>Collections</Subheading>
    <p>
      Whenever you call <code>tippy()</code>, you are potentially creating many
      tippys at once. It returns an object containing information about the
      tippys you created.
    </p>

    <Code lang="js">const tipCollection = tippy('.btn')</Code>
    <p>
      <code>tipCollection</code> is a plain object.
    </p>

    <Code lang="js">{TIP_COLLECTION}</Code>

    <h3>Tippy instances</h3>
    <p>
      Stored on reference elements via the <code>_tippy</code> property, and
      inside the <code>instances</code> array of the collection.
    </p>
    <Code lang="js">{`tippy('.btn')
const btn = document.querySelector('.btn')
const tip = btn._tippy`}</Code>

    <p>
      Alternatively, you can use the <code>tippy.one()</code> method to return
      the instance directly, because only a single tippy is created.
    </p>

    <Code lang="js">{`const tip = tippy.one('.btn')`}</Code>

    <p>
      <code>tip</code> is also a plain object.
    </p>
    <Code lang="js">
      {`{
  // id of the instance (1 to Infinity)
  id: 1,

  // Reference element that is the trigger for the tooltip
  reference: Element,

  // Popper element that contains the tooltip
  popper: Element,

  // Object that contains the child elements of the popper element
  popperChildren: { ... }

  // Popper instance is not created until shown for the first time,
  // unless specified otherwise
  popperInstance: null,

  // Instance props + attribute options merged together
  props: { ... },

  // The state of the instance
  state: {
    // Has the instance been destroyed?
    isDestroyed: false,
    // Is the instance enabled?
    isEnabled: true,
    // Is the tooltip currently visible and not transitioning out?
    isVisible: false
  },

  // Methods, you'll learn more in a later section
  enable() { ... },
  disable() { ... },
  show() { ... },
  hide() { ... },
  set() { ... },
  destroy() { ... },
  clearDelayTimeouts() { ... }
}`}
    </Code>
    <h3>Shortcuts</h3>
    <p>There are several shortcuts available for accessing the instance.</p>
    <Code lang="js">{`// The popper element has the instance attached to it:
popper._tippy
// As does the reference element (as seen above):
reference._tippy`}</Code>
  </section>
)
