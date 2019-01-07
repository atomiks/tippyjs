import React, { Component } from 'react'
import Tippy from '../Tippy'
import { Button } from '../Framework'

class AjaxSmooth extends Component {
  state = {
    isFetching: false,
    canFetch: true,
    imageURL: null,
    showImage: false,
  }

  onShow = tip => {
    if (this.state.isFetching === true || this.state.canFetch === false) {
      return
    }

    this.setState({
      isFetching: true,
      canFetch: false,
      showImage: false,
    })

    const { popper } = tip
    const { tooltip, content } = tip.popperChildren

    // Because the tooltip has `position: absolute`,
    // it no longer affects the parent popper's layout.
    // We need to explicitly give it a width.
    popper.style.width = '200px'

    fetch('https://unsplash.it/200/?random')
      .then(response => response.blob())
      .then(blob => {
        this.setState({
          isFetching: false,
          imageURL: URL.createObjectURL(blob),
        })

        if (!tip.state.isVisible) {
          return
        }

        // Wait until the height transition has finished before
        // fading the content in. Since we have `overflow: hidden`
        // on the tooltip this isn't actually needed, but if you
        // have an arrow element it will be.
        if (!tip._transitionEndListener) {
          tip._transitionEndListener = event => {
            if (
              event.target === event.currentTarget &&
              event.propertyName === 'height'
            ) {
              content.style.opacity = '1'
              this.setState({ showImage: true })
            }
          }
        }
        tooltip.addEventListener('transitionend', tip._transitionEndListener)

        // Store the base height of the tooltip when it has the
        // initial Loading... content.
        if (!tip._baseHeight) {
          tip._baseHeight = tooltip.clientHeight || 30
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
        tooltip.style.height = tip._baseHeight + 'px'
        // Cause reflow so we can start the height transition.
        void tooltip.offsetHeight
        // Start the transition.
        tooltip.style.height = height + 'px'
        // Remove the Loading... content and wait until the
        // transition finishes.
        tip.setContent('')
      })
      .catch(() => {
        this.setState({ isFetching: false })
      })
  }

  onHidden = tip => {
    this.setState({
      canFetch: true,
      imageURL: null,
    })
    const { tooltip } = tip.popperChildren
    tooltip.style.height = null
    tooltip.removeEventListener('transitionend', tip._transitionEndListener)
    tip._transitionEndListener = null
  }

  render() {
    const { imageURL, showImage } = this.state

    return (
      <Tippy
        content={
          showImage ? (
            <img src={imageURL} alt="Unsplash" />
          ) : (
            <div style={{ margin: 5 }}>Loading...</div>
          )
        }
        animation="fade"
        animateFill={false}
        duration={200}
        theme="ajax"
        onShow={this.onShow}
        onHidden={this.onHidden}
      >
        <Button>Hover for a new image</Button>
      </Tippy>
    )
  }
}

export default AjaxSmooth
