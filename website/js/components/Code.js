import { h } from 'hyperapp'
import Prism from 'prismjs'

const getLang = str => (str.match(/```(js|html|css|shell)/) || [])[1]

export default ({ content, lang }) => {
  lang = getLang(content || '') || lang || 'js'
  return (
    <div class="code-wrapper" data-lang={lang}>
      <pre>
        <code oncreate={Prism.highlightElement} class={`lang-${lang}`}>
          {content.replace(/```(js|html|css|shell)([\s\S]*)```/g, '$2').trim()}
        </code>
      </pre>
    </div>
  )
}
