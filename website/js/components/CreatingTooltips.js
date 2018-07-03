import { h } from 'hyperapp'
import { emoji } from '../utils'
import Code from './Code'

export default () => (state, actions) => (
  <section class="section" id="creating-tooltips">
    <div class="section__icon-wrapper" oncreate={emoji('🔧')} />
    <div class="section__heading-wrapper">
      <a class="section__heading" href="#creating-tooltips">
        Creating tooltips
      </a>
    </div>

    <h3>
      1. Add your tooltip content{' '}
      <span class="section__emoji" oncreate={emoji('✍️')} />
    </h3>

    <p>
      First, give your reference element(s) a{' '}
      <span tabindex="0" class="tippy" title="The browser's default tooltip">
        title
      </span>{' '}
      attribute containing your tooltip content.
    </p>

    <Code lang="html">{`<button class="btn" title="I'm a tooltip!">Text</button>`}</Code>

    <p>
      If you hover over the button, you'll notice the browser's default tooltip
      (usually the native OS tooltip) appears after a delay.
    </p>

    <h3>
      2. Create a tippy <span class="section__emoji" oncreate={emoji('🌟')} />
    </h3>

    <p>
      To give the elements a tippy, you'll need to add in some JavaScript inside{' '}
      <code>script</code> tags on your HTML page{' '}
      <span
        tabindex="0"
        class="tippy"
        title="<code>tippy()</code> must be invoked after the elements have been constructed in the DOM"
      >
        just before the closing
      </span>{' '}
      <code>body</code> tag.
    </p>

    <Code lang="html">
      {`<script>
tippy('.btn')
</script>
`}
    </Code>

    <div class="section__result">
      <p class="section__result-text">Result:</p>
      <button class="btn" title="I'm a tooltip!">
        Text
      </button>
    </div>

    <p>
      When the <code>tippy()</code> function is invoked and given a CSS selector
      string, it will find all the elements which match it, check if they have a
      non-empty <code>title</code>
      attribute, and then apply its magic to give them a cool tooltip.
    </p>

    <h3>
      Mutations <span class="section__emoji" oncreate={emoji('🛠')} />
    </h3>

    <p>
      The reference element(s) get modified by Tippy in the following manner:
    </p>

    <Code lang="html">
      {`<!-- Before -->
<button class="btn" title="I'm a tooltip!">Text</button>
<!-- After -->
<button class="btn" data-tippy data-original-title="I'm a tooltip!">Text</button>
`}
    </Code>

    <ul>
      <li>
        <code>title</code> attribute is removed
      </li>
      <li>
        <code>data-tippy</code> attribute is added
      </li>
      <li>
        <code>data-original-title</code> attribute is added containing the{' '}
        <code>title</code> string
      </li>
    </ul>

    <p>
      Additionally, once the tooltip has fully transitioned in, an{' '}
      <code>aria-describedby</code> attribute is added for{' '}
      <span tabindex="0" class="tippy" title="Short for accessibility">
        a11y
      </span>.
    </p>

    <h3>
      Additional input types{' '}
      <span class="section__emoji" oncreate={emoji('🎛')} />
    </h3>
    <p>
      A single{' '}
      <span
        tabindex="0"
        class="tippy"
        title="<strong>D</strong>ocument <strong>O</strong>bject <strong>M</strong>odel - the tree structure of the HTML document where each node (such as a DIV tag) is represented by an object"
      >
        DOM
      </span>{' '}
      <code>Element</code> (or an array of them) will work:
    </p>

    <Code lang="js">{`tippy(document.querySelector('.btn'))`}</Code>
    <p>
      As well as a <code>NodeList</code>:
    </p>
    <Code lang="js">{`tippy(document.querySelectorAll('.btn'))`}</Code>

    <p>
      <span class="badge">v2.5</span> Use <code>tippy.one()</code> if you are
      creating a single tooltip. This will return the tooltip instance directly,
      rather than a collection object (because <code>tippy()</code> can create
      multiple tooltip instances at once).
    </p>
    <Code lang="js">{`tippy.one(document.querySelector('.btn'))`}</Code>

    <h3>
      Tippify all titled elements{' '}
      <span class="section__emoji" oncreate={emoji('🍭')} />
    </h3>
    <p>
      Use this{' '}
      <span
        tabindex="0"
        class="tippy"
        title="Elements can be selected based on the existence of an attribute by wrapping the attribute inside square brackets. You can do any attribute, such as [class] and [id]."
      >
        selector
      </span>:
    </p>

    <Code lang="js">{`tippy('[title]')`}</Code>

    <h3>
      Advanced <span class="section__emoji" oncreate={emoji('🤯')} />
    </h3>
    <p>
      You can use a virtual element as the positioning reference instead of a
      real element:
    </p>
    <Code lang="js">
      {`const virtualReference = {
  attributes: {
    title: "I'm a tooltip!"
  },
  getBoundingClientRect() {
    return {
      width: 100,
      height: 100,
      top: 100,
      left: 100,
      right: 200,
      bottom: 200
    }
  },
  clientHeight: 100,
  clientWidth: 100
}

tippy(virtualReference)`}
    </Code>
    <p>
      Popper.js uses these properties to determine the position of the tooltip.
    </p>
  </section>
)
