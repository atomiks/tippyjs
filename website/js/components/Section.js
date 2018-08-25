import { h } from 'hyperapp'
import { toKebabCase } from '../utils'
import Emoji from './Emoji'
import Heading from './Heading'

export default ({ title, emoji }, children) => (
  <section class="section" id={toKebabCase(title)}>
    <Emoji class="section__icon-wrapper" size="large">
      {emoji}
    </Emoji>
    <Heading>{title}</Heading>
    {children}
  </section>
)
