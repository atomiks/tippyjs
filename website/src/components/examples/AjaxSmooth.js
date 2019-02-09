import React, { Component } from 'react'
import Tippy from '../Tippy'
import { Button } from '../Framework'

class AjaxSmooth extends Component {
  state = {
    isFetching: false,
    canFetch: true,
    imageURL: null,
  }

  onShow = instance => {
    if (this.state.isFetching === true || this.state.canFetch === false) {
      return
    }

    this.setState({
      isFetching: true,
      canFetch: false,
    })

    const { popper } = instance
    const { tooltip, content } = instance.popperChildren

    // Set up our transition styles
    tooltip.style.transitionDuration = '0.2s'
    tooltip.style.transitionProperty = 'height, visibility, opacity'

    // Because the tooltip has `position: absolute`,
    // it no longer affects the parent popper's layout.
    // We need to explicitly give it a width.
    popper.style.width = '200px'
    popper.style.height = '200px'

    fetch('https://unsplash.it/200/?random')
      .then(response => response.blob())
      .then(blob => {
        this.setState({ isFetching: false })

        if (!instance.state.isVisible) {
          return
        }

        // Wait until the height transition has finished before
        // fading the content in. Since we have `overflow: hidden`
        // on the tooltip this isn't actually needed, but if you
        // have an arrow element it will be.
        if (!instance._transitionEndListener) {
          instance._transitionEndListener = event => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === 'height'
            ) {
              content.style.opacity = '1'
              this.setState({ imageURL: URL.createObjectURL(blob) })
            }
          }
          tooltip.addEventListener(
            'transitionend',
            instance._transitionEndListener,
          )
        }

        // Store the base height of the tooltip when it has the
        // initial Loading... content.
        if (!instance._baseHeight) {
          instance._baseHeight = tooltip.clientHeight
        }

        // Here is where we find out the height of the tooltip
        // when it has the content. We could technically hardcode
        // 200px as the value, but it's useful to know how to do
        // this with dynamic content.
        content.style.opacity = '0'
        const height = 200
        // Apply the height to the parent popper element.
        popper.style.height = height + 'px'
        // Reset the tooltip's height to the base height.
        tooltip.style.height = instance._baseHeight + 'px'
        // Cause reflow so we can start the height transition.
        void tooltip.offsetHeight
        // Start the transition.
        tooltip.style.height = height + 'px'
        // Remove the Loading... content and wait until the
        // transition finishes.
        instance.setContent('')
      })
      .catch(() => {
        this.setState({ isFetching: false })
      })
  }

  onHidden = instance => {
    this.setState({
      canFetch: true,
      imageURL: null,
    })

    const { tooltip } = instance.popperChildren
    tooltip.style.height = null
    tooltip.removeEventListener(
      'transitionend',
      instance._transitionEndListener,
    )
    instance._transitionEndListener = null
  }

  render() {
    const { imageURL } = this.state

    return (
      <Tippy
        content={
          imageURL ? (
            <img src={imageURL} alt="Unsplash" />
          ) : (
            <div style={{ margin: 5 }}>Loading...</div>
          )
        }
        animation="fade"
        animateFill={false}
        theme="ajax"
        onShow={this.onShow}
        onHidden={this.onHidden}
      >
        <Button>Smooth transition</Button>
      </Tippy>
    )
  }
}

export default AjaxSmooth
