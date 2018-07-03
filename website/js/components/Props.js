import { h } from 'hyperapp'
import { emoji } from '../utils'
import Code from './Code'

export default () => (state, actions) => (
  <section class="section" id="props">
    <div class="section__icon-wrapper" oncreate={emoji('🏷️')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#props">
        Props
      </a>
    </div>
    <p>
      It's important to distinguish between the object returned from calling{' '}
      <code>tippy()</code> and a Tippy instance. When you call{' '}
      <code>tippy()</code>, it can create multiple tooltips (Tippy instances) at
      once.
    </p>
    <p>
      Tippy instances refer to individual tooltips, whereas the object returned
      from <code>tippy()</code> refers to the collection.
    </p>

    <h3>
      <code>tippy()</code> object
    </h3>
    <div class="code-wrapper" data-lang="js">
      <pre>
        <code class="lang-js">{`const tip = tippy('.btn')`}</code>
      </pre>
    </div>
    <p>
      <code>tip</code> is a plain object.
    </p>
    <Code lang="js">
      {`{
  // selector that was supplied to tippy()
  selector: '.btn',

  // default + instance options merged together
  options: { ... },

  // Array of all Tippy instances that were created
  tooltips: [Tippy, Tippy, Tippy, ...],

  // Method to destroy all the tooltips that were created
  destroyAll() { }
}`}
    </Code>

    <h3>Tippy instances</h3>
    <p>
      Stored on reference elements via the <code>_tippy</code> property, and
      inside the <code>tooltips</code> array of the <code>tippy()</code> object.
    </p>
    <Code lang="js">{`tippy('.btn')
const btn = document.querySelector('.btn')
const tipInstance = btn._tippy`}</Code>

    <p>
      <code>tipInstance</code> is a Tippy instance.
    </p>
    <Code lang="js">
      {`{
  // id of the Tippy instance (1 to Infinity)
  id: 1,

  // Popper element that contains the tooltip
  popper: Element,

  // Popper instance is not created until shown for the first time,
  // unless specified otherwise
  popperInstance: null,

  // Reference element that is the trigger for the tooltip
  reference: Element,

  // Array of objects containing the event + handler function of each trigger
  listeners: [{ ... }, { ... }, ...],

  // Defaults + instance + attribute options merged together
  options: { ... },

  // The state of the tooltip
  state: {
    // Has the instance been destroyed?
    destroyed: false,
    // Is the instance enabled?
    enabled: true,
    // Is the tooltip currently visible and not transitioning out?
    visible: false
  },

  // title content of the tooltip (null if HTML)
  title: 'example'
}`}
    </Code>
    <h3>Shortcuts</h3>
    <p>There are several shortcuts available for accessing the instance.</p>
    <Code lang="js">{`// The popper element has the instance attached to it:
popper._tippy
// As does the reference element (as seen above):
reference._tippy
// The popper also has the reference directly attached:
popper._reference`}</Code>
  </section>
)
