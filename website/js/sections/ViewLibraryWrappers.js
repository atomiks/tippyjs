import { h } from 'hyperapp'
import Section from '../components/Section'
import Heading from '../components/Heading'
import Emoji from '../components/Emoji'
import ExternalLink from '../components/ExternalLink'

const TITLE = 'View Library Wrappers'

export default () => (
  <Section title={TITLE} emoji="🎁">
    <p>
      If you would like to use Tippy.js as a declarative component, there are
      wrappers available.
    </p>

    <ul>
      <li>
        <ExternalLink to="https://github.com/atomiks/tippy.js-react">
          React
        </ExternalLink>
      </li>
      <li>
        ...feel free to contribute a Vue, Angular, Preact, Hyperapp, etc
        component that can be published officially
      </li>
    </ul>
  </Section>
)
