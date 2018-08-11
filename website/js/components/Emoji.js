import { h } from 'hyperapp'
import { getEmojiSrc } from '../utils'

export default ({ small, ...props }, [char]) => (
  <span {...props}>
    <img
      class="emoji"
      draggable={0}
      alt={char}
      src={getEmojiSrc(char)}
      style={{
        width: small && '25px'
      }}
    />
  </span>
)
