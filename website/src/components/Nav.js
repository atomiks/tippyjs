import React, { Component, createRef } from 'react'
import styled from 'styled-components'
import { MEDIA, Link } from './Framework'
import { StaticQuery, graphql } from 'gatsby'
import { sortPagesByIndex } from '../utils'
import X from 'react-feather/dist/icons/x'
import ElasticScroll from './ElasticScroll'

const Navbar = styled.nav`
  display: ${props => (props.isMounted ? 'block' : 'none')};
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 250px;
  border-right: 1px solid rgba(0, 16, 64, 0.08);
  background-clip: padding-box;
  padding: 16px 0;
  background: #4b4f74;
  color: white;
  overflow-y: auto;
  z-index: 1;
  transform: ${props =>
    props.isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)'};
  transition: transform ${props => (props.isOpen ? '0.45s' : '0.3s')},
    visibility 0.2s;
  transition-timing-function: ${props =>
    props.isOpen
      ? 'cubic-bezier(.165, .84, .44, 1)'
      : 'cubic-bezier(.77, 0, .175, 1)'};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  box-shadow: 5px 0 30px 0 rgba(0, 32, 64, 0.25);

  ${MEDIA.lg} {
    display: block;
    visibility: visible;
    transform: none;
    box-shadow: none;
  }
`

const List = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
`

const ListItem = styled.li`
  margin: 0;

  &:not(:last-child) {
    border-bottom: 1px dotted rgba(0, 16, 64, 0.1);
  }

  > a {
    display: block;
    padding: 12px 25px;

    &:hover {
      border-bottom-color: transparent;
    }
  }
`

const XButton = styled.button`
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: inherit;
  padding: 0;

  ${MEDIA.lg} {
    display: none;
  }
`

class Nav extends Component {
  state = {
    isMounted: false,
    transitions: true,
  }

  ref = createRef()

  handleResize = () => {
    this.setState({ transitions: false })
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.setState({ transitions: true })
    }, 100)
  }

  handleClose = () => {
    this.props.close()
  }

  handleBlur = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.props.close()
    }
  }

  handleOutsideClick = e => {
    if (this.props.isOpen && !this.ref.current.contains(e.target)) {
      this.props.close()
    }
  }

  componentDidMount() {
    this.setState({ isMounted: true })
    window.addEventListener('resize', this.handleResize)
    window.addEventListener('click', this.handleOutsideClick, true)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('click', this.handleOutsideClick, true)
    clearTimeout(this.timeout)
  }

  render() {
    const { isOpen } = this.props
    const { isMounted, transitions } = this.state
    return (
      <ElasticScroll>
        <Navbar
          id="main-nav"
          ref={this.ref}
          style={{ transition: transitions ? '' : 'none' }}
          isOpen={isOpen}
          isMounted={isMounted}
          onBlur={this.handleBlur}
        >
          <XButton aria-label="Close Menu" onClick={this.handleClose}>
            <X style={{ width: 36, height: 36 }} />
          </XButton>
          <List>
            <StaticQuery
              query={allMdxQuery}
              render={data => {
                return sortPagesByIndex(data.allMdx.edges).map(({ node }) => (
                  <ListItem key={node.frontmatter.path}>
                    <Link to={node.frontmatter.path}>
                      {node.frontmatter.title}
                    </Link>
                  </ListItem>
                ))
              }}
            />
          </List>
        </Navbar>
      </ElasticScroll>
    )
  }
}

export default Nav

const allMdxQuery = graphql`
  query {
    allMdx {
      edges {
        node {
          frontmatter {
            title
            path
            index
          }
        }
      }
    }
  }
`
