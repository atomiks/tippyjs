import React, { Component } from 'react'
import { SkipNavLink, SkipNavContent } from '@reach/skip-nav'
import { MDXProvider } from '@mdx-js/react'
import { Container, Demo, Button, Row, Col, Flex } from './Framework'
import Tippy, { TippySingleton } from './Tippy'
import Nav from './Nav'
import NavButtons from './NavButtons'
import Header from './Header'
import Main from './Main'
import Footer from './Footer'
import SEO from './SEO'
import Image from './Image'
import CSS from '../css'
import slugify from 'slugify'
import elasticScroll from 'elastic-scroll-polyfill'

import 'normalize.css'
import 'animate.css/source/_base.css'
import 'animate.css/source/attention_seekers/rubberBand.css'
import 'animate.css/source/attention_seekers/tada.css'
import 'animate.css/source/attention_seekers/wobble.css'
import 'focus-visible'

let hrefs = []

class Heading extends React.Component {
  constructor(props) {
    super(props)

    let href = slugify(String(this.props.children), {
      lower: true,
    })

    // Check for duplicate #s
    if (hrefs.indexOf(href) !== -1) {
      let counter = 1

      while (hrefs.indexOf(href + counter) !== -1) {
        counter++
      }

      href = `${href}-${counter}`
    }

    hrefs.push(href)

    this.state = { href }
  }

  componentWillUnmount() {
    hrefs = hrefs.filter(href => href !== this.state.href)
  }

  render() {
    const Tag = `h${this.props.level}`

    return (
      <Tag {...this.props}>
        <a
          className="link-icon"
          id={this.state.href}
          href={`#${this.state.href}`}
        >
          #
        </a>
        {this.props.children}
      </Tag>
    )
  }
}

const components = {
  Tippy,
  TippySingleton,
  Demo,
  Button,
  Row,
  Col,
  Flex,
  Image,
  h3: props => <Heading {...props} level={3} />,
  h4: props => <Heading {...props} level={4} />,
  h5: props => <Heading {...props} level={5} />,
  h6: props => <Heading {...props} level={6} />,
  tr: props => {
    const isExtraProp = !!props.children[0].props.children[0] // <strong>
    return (
      <tr {...props} style={{ background: isExtraProp ? '#fff8de' : '' }} />
    )
  },
  // TODO: find a better way to do this
  td: class extends React.Component {
    ref = React.createRef()

    state = { dataLabel: '' }

    componentDidMount() {
      let child = this.ref.current
      let i = 0

      while ((child = child.previousSibling) != null) {
        i++
      }

      this.setState({
        dataLabel: ['Prop', 'Type', 'Default', 'Description'][i],
      })
    }

    render() {
      return (
        <td ref={this.ref} {...this.props} data-label={this.state.dataLabel} />
      )
    }
  },
  pre: class extends React.Component {
    ref = React.createRef()

    componentDidMount() {
      if (/Mac/.test(navigator.userAgent)) {
        elasticScroll({ targets: this.ref.current })
      }
    }

    render() {
      return <pre ref={this.ref} {...this.props} />
    }
  },
}

class Layout extends Component {
  state = {
    isNavOpen: false,
  }

  openNav = () => {
    this.setState({ isNavOpen: true })
  }

  closeNav = () => {
    this.setState({ isNavOpen: false })
  }

  render() {
    const { isNavOpen } = this.state
    const { children, pageContext } = this.props
    return (
      <MDXProvider components={components}>
        <CSS />
        <SEO pageContext={pageContext} />
        <SkipNavLink />
        <Main>
          <Header
            openNav={this.openNav}
            isNavOpen={isNavOpen}
            pageIndex={pageContext.frontmatter.index}
          />
          <Nav isOpen={isNavOpen} close={this.closeNav} />
          <SkipNavContent>
            <Container>
              <h2>{pageContext.frontmatter.title}</h2>
              {children}
              <NavButtons next={pageContext.frontmatter.index + 1} />
            </Container>
          </SkipNavContent>
          <Footer>© {new Date().getFullYear()} - MIT License</Footer>
        </Main>
      </MDXProvider>
    )
  }
}

export default Layout
