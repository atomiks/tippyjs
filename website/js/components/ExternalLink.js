import { h } from 'hyperapp'

export default ({ to }, children) => (
  <a href={to} target="_blank" rel="noopener noreferrer">
    {children}
  </a>
)
