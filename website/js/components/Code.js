import { h } from 'hyperapp'

export default ({ lang }, children) => (
  <div class="code-wrapper" data-lang={lang}>
    <pre>
      <code class={`lang-${lang}`}>{children}</code>
    </pre>
  </div>
)
