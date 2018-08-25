import { h } from 'hyperapp'
import { getEmojiSrc } from '../utils'

const SIZES = {
  large: '75px',
  medium: '40px',
  small: '25px'
}

export default ({ size, ...props }, [char]) => (
  <span {...props}>
    <img
      class="emoji"
      draggable={0}
      alt={char}
      src={getEmojiSrc(char)}
      style={{ width: SIZES[size] }}
    />
  </span>
)
