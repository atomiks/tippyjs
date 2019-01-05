import React, { Component } from 'react'
import styled from 'styled-components'
import { MEDIA, MEDIA_SIZES, Link } from './Framework'
import { StaticQuery, graphql } from 'gatsby'
import { sortPagesByIndex } from '../utils'
import X from 'react-feather/dist/icons/x'

const Navbar = styled.nav`
  position: fixed;
  top: 0;
  bottom: 0;
  width: 250px;
  border-right: 1px solid rgba(0, 16, 64, 0.08);
  background-clip: padding-box;
  padding: 16px 0;
  background: #f7f8fc;
  overflow-y: auto;
  z-index: 1;
  transition: transform ${props => (props.isOpen ? '0.45s' : '0.3s')};
  transition-timing-function: ${props =>
    props.isOpen
      ? 'cubic-bezier(.165, .84, .44, 1)'
      : 'cubic-bezier(.77, 0, .175, 1)'};
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
    windowWidth: 1200,
    transitions: true,
  }

  get transform() {
    return this.props.isOpen || this.state.windowWidth >= MEDIA_SIZES.lg
      ? 'translate3d(0, 0, 0)'
      : 'translate3d(-100%, 0, 0)'
  }

  handleResize = () => {
    this.setState({
      windowWidth: window.innerWidth,
      transitions: false,
    })
    clearTimeout(this.timeout)
    this.timeout = setTimeout(() => {
      this.setState({ transitions: true })
    }, 100)
  }

  handleClose = () => {
    this.props.close()
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize)
    clearTimeout(this.timeout)
  }

  render() {
    return (
      <Navbar
        isOpen={this.props.isOpen}
        style={{
          transform: this.transform,
          transition: this.state.transitions ? '' : 'none',
        }}
      >
        <XButton onClick={this.handleClose}>
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
