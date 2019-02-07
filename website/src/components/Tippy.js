import tippy from '../../../src/js'
import '../../../index.css'
import '../../../themes/light.css'
import '../../../themes/light-border.css'
import '../../../themes/google.css'
import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'

// These props are not native to `tippy.js` and are specific to React only.
const REACT_ONLY_PROPS = ['children', 'onCreate', 'isVisible', 'isEnabled']

// Avoid Babel's large '_objectWithoutProperties' helper function.
function getNativeTippyProps(props) {
  return Object.keys(props).reduce((acc, key) => {
    if (REACT_ONLY_PROPS.indexOf(key) === -1) {
      acc[key] = props[key]
    }
    return acc
  }, {})
}

class Tippy extends React.Component {
  state = { isMounted: false }

  container = typeof document !== 'undefined' && document.createElement('div')

  static propTypes = {
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element])
      .isRequired,
    children: PropTypes.element.isRequired,
    onCreate: PropTypes.func,
    isVisible: PropTypes.bool,
    isEnabled: PropTypes.bool,
  }

  get isReactElementContent() {
    return React.isValidElement(this.props.content)
  }

  get options() {
    return {
      ...getNativeTippyProps(this.props),
      content: this.isReactElementContent ? this.container : this.props.content,
    }
  }

  get isManualTrigger() {
    return this.props.trigger === 'manual'
  }

  componentDidMount() {
    this.setState({ isMounted: true })

    this.tip = tippy(ReactDOM.findDOMNode(this), this.options)

    const { onCreate, isEnabled, isVisible } = this.props

    if (onCreate) {
      onCreate(this.tip)
    }

    if (isEnabled === false) {
      this.tip.disable()
    }

    if (this.isManualTrigger && isVisible === true) {
      this.tip.show()
    }
  }

  componentDidUpdate() {
    this.tip.set(this.options)

    const { isEnabled, isVisible } = this.props

    if (isEnabled === true) {
      this.tip.enable()
    }
    if (isEnabled === false) {
      this.tip.disable()
    }

    if (this.isManualTrigger) {
      if (isVisible === true) {
        this.tip.show()
      }
      if (isVisible === false) {
        this.tip.hide()
      }
    }
  }

  componentWillUnmount() {
    this.tip.destroy()
    this.tip = null
  }

  render() {
    return (
      <React.Fragment>
        {this.props.children}
        {this.isReactElementContent &&
          this.state.isMounted &&
          ReactDOM.createPortal(this.props.content, this.container)}
      </React.Fragment>
    )
  }
}

Tippy.defaultProps = {
  content: "I'm a Tippy tooltip!",
  ignoreAttributes: true,
}

export function TippyGroup({ children, ...props }) {
  const instances = React.useRef([])

  React.useEffect(() => {
    tippy.group(instances.current, props)
    return () => {
      instances.current = null
    }
  }, [])

  return React.Children.map(children, child => {
    return React.cloneElement(child, {
      ...child.props,
      onCreate: instance => {
        if (child.props.onCreate) {
          child.props.onCreate(instance)
        }
        instances.current.push(instance)
      },
    })
  })
}

export default Tippy
