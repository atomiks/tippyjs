import { h } from 'hyperapp'
import { getEmojiSrc } from '../utils'

const Sizes = {
  large: '75px',
  medium: '40px',
  small: '25px'
}

export default ({ size, ...props }, [char]) => (
  <span {...props}>
    <img
      class="emoji"
      draggable="false"
      alt={char}
      src={getEmojiSrc(char)}
      style={{ width: Sizes[size] }}
    />
  </span>
)
