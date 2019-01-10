import React, { Component, Children, cloneElement, createRef } from 'react'
import elasticScroll from 'elastic-scroll-polyfill'

class ElasticScroll extends Component {
  scroller = createRef()

  componentDidMount() {
    this.instance = elasticScroll({
      targets: this.scroller,
      ...this.props,
    })
  }

  componentWillUnmount() {
    this.instance.disable()
    this.instance = null
  }

  render() {
    return Children.map(this.props.children, child =>
      cloneElement(child, {
        children: <div data-elastic-wrapper>{child.props.children}</div>,
        ref: node => {
          this.scroller = node
          const { ref } = child
          if (ref) {
            if (typeof ref === 'function') {
              ref(node)
            } else if (ref.hasOwnProperty('current')) {
              ref.current = node
            }
          }
        },
      }),
    )
  }
}

export default ElasticScroll
