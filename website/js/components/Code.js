import { h } from 'hyperapp'

export const view = ({ lang }, children) => (
  <div class="code-wrapper" data-lang={lang}>
    <pre>
      <code class={`lang-${lang}`}>{children}</code>
    </pre>
  </div>
)
