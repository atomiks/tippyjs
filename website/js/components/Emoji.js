import { h } from 'hyperapp'
import { getEmojiSrc } from '../utils'

export default ({ smal, ...props }, [char]) => (
  <span {...props}>
    <img
      class="emoji"
      draggable={0}
      alt={char}
      src={getEmojiSrc(char)}
      style={{
        width: props.small && '25px'
      }}
    />
  </span>
)
