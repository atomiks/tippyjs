import React, { Component, Children, cloneElement } from 'react'
import elasticScroll from 'elastic-scroll-polyfill'

const elasticWrapperStyles = {
  display: 'inline-block',
  width: '100%',
}

class ElasticScroll extends Component {
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
        children: (
          <div data-elastic-wrapper style={elasticWrapperStyles}>
            {child.props.children}
          </div>
        ),
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
