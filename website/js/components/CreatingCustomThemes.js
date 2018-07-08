import { h } from 'hyperapp'
import Emoji from './Emoji'
import Code from './Code'
import ResultBox from './ResultBox'
import Tippy from './Tippy'
import Heading from './Heading'
const Subheading = Heading('CreatingCustomThemes')
import THEME_CSS from '../../snippets/theme-css'
import THEME_JS from '../../snippets/theme-js'
import TIPPY_ELEMENT from '../../snippets/tippy-element'
import TIPPY_ELEMENT_ARROW from '../../snippets/tippy-element-arrow'
import CSS_ARROW from '../../snippets/css-arrow'

export default () => (
  <section class="section">
    <Emoji class="section__icon-wrapper">🖌️</Emoji>
    <Heading>Creating Custom Themes</Heading>

    <Subheading>Tippy element structure</Subheading>
    <p>
      To know what selectors to use, it's helpful to understand the structure of
      a tippy element.
    </p>
    <Code content={TIPPY_ELEMENT} />

    <p>
      A tippy is essentially three nested <code>div</code>s.
    </p>

    <ul>
      <li>
        <code>tippy-popper</code> is what Popper.js uses to position the tippy.
        You shouldn't apply any styles directly to this element, but you will
        need it when targeting a specific placement (<code>x-placement</code>).
      </li>
      <li>
        <code>tippy-tooltip</code> is the actual tooltip. Use this to style the
        tooltip when <code>animateFill: false</code>.
      </li>
      <li>
        <code>tippy-backdrop</code> is the background fill of the tooltip. Use
        this when <code>animateFill: true</code>.
      </li>
      <li>
        <code>tippy-content</code> is anything inside the tooltip.
      </li>
    </ul>

    <p>
      However, depending on the options you supply, additional elements may
      exist inside it, such as an arrow or backdrop (default) element.
    </p>

    <Code content={TIPPY_ELEMENT_ARROW} />

    <Subheading>Creating a theme</Subheading>

    <p>
      If you wanted to make a theme called <code>honeybee</code>, then your CSS
      would look like:
    </p>
    <Code content={THEME_CSS} />

    <p>
      The <code>-theme</code> suffix is required.
    </p>

    <p>
      To apply the theme to the tooltip, specify a <code>theme</code> option{' '}
      <em>without</em> the <code>-theme</code> suffix:
    </p>
    <Code content={THEME_JS} />

    <ResultBox>
      <Tippy theme="honeybee" animateFill={false}>
        <button class="btn">Custom theme</button>
      </Tippy>
    </ResultBox>

    <Subheading>Styling the arrow</Subheading>
    <p>
      There are two arrow selectors: <code>.tippy-arrow</code> and{' '}
      <code>.tippy-roundarrow</code>. The first is the pure CSS triangle shape,
      while the second is a custom SVG.
    </p>
    <Code content={CSS_ARROW} />
    <p>
      You will need to style the arrow for each different popper placement (top,
      bottom, left, right), which is why the selector is so long.
    </p>
  </section>
)
