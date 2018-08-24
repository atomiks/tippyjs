import { h } from 'hyperapp'
import Code from '../components/Code'
import Emoji from '../components/Emoji'
import Tippy from '../components/Tippy'
import ResultBox from '../components/ResultBox'
import Heading from '../components/Heading'
const Subheading = Heading('CreatingTootips')
import VIRTUAL_REFERENCE from '../../snippets/virtual-reference'
import AUTO_TIPPY_BUTTON from '../../snippets/auto-tippy-button'
import FUNCTION_BUTTON from '../../snippets/function-button'
import FUNCTION_CALL from '../../snippets/function-call'

export default () => (
  <section class="section" id="creating-tooltips">
    <Emoji class="section__icon-wrapper">🔧</Emoji>
    <Heading>Creating Tooltips</Heading>

    <Subheading>Method 1: Auto</Subheading>
    <p>
      Give your reference element a <code>data-tippy</code> attribute containing
      the tooltip content.
    </p>
    <Code content={AUTO_TIPPY_BUTTON} />
    <p>
      When tippy is loaded in the document, it will search for elements with the
      attribute and give them a tooltip automatically. This means you won't have
      to touch JavaScript at all.
    </p>
    <Subheading>Method 2: Function</Subheading>
    <p>
      Use the <code>tippy</code> function.
    </p>
    <Code content={FUNCTION_BUTTON} />
    <Code content={FUNCTION_CALL} />
    <ResultBox>
      <Tippy>
        <button class="btn">Text</button>
      </Tippy>
    </ResultBox>

    <Subheading>
      Accepted inputs <Emoji class="section__emoji">🎛</Emoji>
    </Subheading>
    <p>
      A single{' '}
      <Tippy.secondary
        content={
          <div>
            <strong>D</strong>ocument <strong>O</strong>bject <strong>M</strong>odel
            - the tree structure of the HTML document where each node (such as a
            DIV tag) is represented by an object
          </div>
        }
      >
        <span tabindex="0" class="tippy">
          DOM
        </span>
      </Tippy.secondary>{' '}
      <code>Element</code> (or an array of them) will work:
    </p>

    <Code content="tippy(document.querySelector('.btn'))" />
    <p>
      As well as a <code>NodeList</code>:
    </p>
    <Code content="tippy(document.querySelectorAll('.btn'))" />

    <Subheading>
      Advanced <Emoji class="section__emoji">🤯</Emoji>
    </Subheading>
    <p>
      You can use a virtual element as the positioning reference instead of a
      real element:
    </p>
    <Code content={VIRTUAL_REFERENCE} />

    <p>
      Popper.js uses these properties to determine the position of the tooltip.
    </p>
  </section>
)
