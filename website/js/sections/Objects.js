import { h } from 'hyperapp'

import TIP_COLLECTION from '../../snippets/tip-collection'
import TIP_INSTANCE from '../../snippets/tip-instance'
import ACCESS_TIPPY_INSTANCE from '../../snippets/access-tippy-instance'
import SHORTCUTS from '../../snippets/shortcuts'

import Section from '../components/Section'
import Emoji from '../components/Emoji'
import Code from '../components/Code'
import Heading from '../components/Heading'
import { Emojis } from './TableOfContents'

const TITLE = 'Objects'
const Subheading = Heading(TITLE)

export default () => (
  <Section title={TITLE} emoji={Emojis.OBJECTS}>
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
    <Code content="const collection = tippy('.btn')" />
    <p>
      <code>collection</code> is a plain object.
    </p>
    <Code content={TIP_COLLECTION} />

    <Subheading>Tippy instances</Subheading>
    <p>A Tippy instance refers to the object of a single tooltip.</p>
    <Code content={ACCESS_TIPPY_INSTANCE} />

    <p>
      <code>tip</code> is also a plain object.
    </p>
    <Code content={TIP_INSTANCE} />

    <Subheading>Shortcuts</Subheading>
    <p>There are a couple of shortcuts available for accessing the instance.</p>
    <Code content={SHORTCUTS} />
  </Section>
)
