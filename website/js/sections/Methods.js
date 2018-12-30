import { h } from 'hyperapp'

import SET_METHOD from '../../snippets/set-method'
import ACCESS_TIPPY_INSTANCE from '../../snippets/access-tippy-instance'

import Section from '../components/Section'
import Heading from '../components/Heading'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import ResultBox from '../components/ResultBox'
import Tippy from '../components/Tippy'
import { Emojis } from './TableOfContents'

const TITLE = 'Methods'
const Subheading = Heading(TITLE)

export default () => (
  <Section title={TITLE} emoji={Emojis.METHODS}>
    <p>
      Tippy instances have methods available which allow you to control the
      tooltip without the use of UI events. There are several ways to access a
      Tippy instance.
    </p>

    <Code lang="html" content="<button>Text</button>" />
    <Code content={ACCESS_TIPPY_INSTANCE} />

    <Subheading>Show the tooltip</Subheading>
    <Code content="tip.show()" />

    <Subheading>Hide the tooltip</Subheading>
    <Code content="tip.hide()" />

    <Subheading>Custom transition duration</Subheading>
    <p>Pass a number in as an argument to override the instance option:</p>
    <Code content="tip.show(200)" />

    <Subheading>Disable the tooltip</Subheading>
    <p>The tooltip can be temporarily disabled from showing/hiding:</p>
    <Code content="tip.disable()" />

    <p>To re-enable:</p>
    <Code content="tip.enable()" />

    <Subheading>Destroy the tooltip</Subheading>
    <p>
      To permanently destroy the tooltip and remove all listeners from the
      reference element:
    </p>
    <Code content="tip.destroy()" />

    <p>
      The <code>_tippy</code> property is deleted from the reference element
      upon destruction.
    </p>

    <Subheading>Update the tooltip</Subheading>
    <p>
      Pass an object of new props to the <code>set()</code> method to update the
      tooltip. The tooltip element will be redrawn to reflect the change.
    </p>
    <Code content={SET_METHOD} />

    <Subheading>Update the tooltip content</Subheading>
    <p>There is a shortcut for directly updating the tooltip content.</p>
    <Code content="tip.setContent('New content')" />

    <Subheading>Static methods</Subheading>
    <p>
      There are a few static methods on the <code>tippy</code> function itself.
      These methods are global and do not affect a single instance.
    </p>
    <p>
      Hide all visible poppers on the page (except those with{' '}
      <code>hideOnClick</code> set to <code>false</code>):
    </p>
    <Code content="tippy.hideAllPoppers()" />
    <p>Disable animation-related default props:</p>
    <Code content="tippy.disableAnimations()" />
    <p>Set the default props for each new tippy instance:</p>
    <Code content="tippy.setDefaults(props)" />
    <p>Create a single tooltip and return the instance directly:</p>
    <Code content="tippy.one(reference, options)" />
  </Section>
)
