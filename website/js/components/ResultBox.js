import { h } from 'hyperapp'

export default (props, children) => (
  <div class="section__result">
    <p class="section__result-text">Result:</p>
    {children}
  </div>
)
