import React, {Component, createRef} from 'react';
import styled from '@emotion/styled';
import {StaticQuery, graphql} from 'gatsby';
import {css} from '@emotion/core';
import {ChevronDown} from 'react-feather';
import {Location} from '@reach/router';
import {MEDIA, Link, Button} from './Framework';
import {sortActivePages, getVersionFromPath} from '../utils';
import X from 'react-feather/dist/icons/x';
import ElasticScroll from './ElasticScroll';
import Tippy from './Tippy';

const Navbar = styled.nav`
  display: ${(props) => (props.isMounted ? 'block' : 'none')};
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 250px;
  background: #1f202899;
  overflow-y: auto;
  z-index: 2;
  transform: ${(props) =>
    props.isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)'};
  transition: ${(props) =>
      props.isOpen ? 'transform 0.5s' : 'transform 0.5s 0.15s'},
    visibility 0.15s, opacity 0.15s;
  transition-timing-function: ${(props) =>
    props.isOpen ? 'cubic-bezier(0.22, 1, 0.36, 1)' : 'ease'};
  visibility: ${(props) => (props.isOpen ? 'visible' : 'hidden')};
  box-shadow: 4px 0 32px 0 rgba(0, 32, 64, 0.25);
  backdrop-filter: blur(15px) saturate(180%);
  opacity: ${(props) => (props.isOpen ? '1' : '0')};

  ${MEDIA.lg} {
    padding-top: 0;
    display: block;
    visibility: visible;
    transform: none;
    box-shadow: none;
    opacity: 1;
    will-change: transform, opacity;
    backdrop-filter: blur(30px) saturate(100%);
  }
`;

const List = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

const ListItem = styled.li`
  margin: 0;

  &:last-of-type {
    padding-bottom: 32px;
  }

  > a {
    display: block;
    padding: 4px 25px;
    font-size: 17px;
    padding-left: 40px;

    ${MEDIA.lg} {
    }

    &:hover {
      border-bottom-color: transparent;
      text-decoration: none;
      color: white;
    }
  }
`;

const XButton = styled.button`
  position: absolute;
  border: none;
  padding: 0;
  top: 8px;
  right: 16px;
  border-radius: 32px;
  height: 40px;
  width: 40px;
  cursor: pointer;
  background: transparent;
  color: #fff;

  &:active {
    box-shadow: 0 2px 0 rgba(0, 32, 64, 0.2);
  }

  ${MEDIA.lg} {
    display: none;
  }
`;

const XIcon = styled(X)`
  margin-top: 4px;
  height: 32px;
  width: 32px;
`;

const VersionButton = styled(Button)`
  background: #424557;
  color: #81edff;
  border: none;
  margin: 15px 25px;
  margin-left: 40px;

  &:hover {
    background-color: white;
    color: #000;
  }
`;

const Li = styled.li`
  list-style: none;

  &:not(:last-of-type) {
    margin-bottom: 5px;
    margin-top: 0;
  }
`;

class Nav extends Component {
  state = {
    isMounted: false,
    transitions: true,
  };

  ref = createRef();

  handleResize = () => {
    this.setState({transitions: false});
    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.setState({transitions: true});
    }, 100);
  };

  handleClose = () => {
    this.props.close();
  };

  handleBlur = (e) => {
    if (!this.ref.current.contains(e.relatedTarget)) {
      this.props.close();
    }
  };

  handleOutsideClick = (e) => {
    if (this.props.isOpen && !this.ref.current.contains(e.target)) {
      this.props.close();
    }
  };

  componentDidMount() {
    this.setState({isMounted: true});
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('mousedown', this.handleOutsideClick, true);
    this.handleResize();

    // TODO: Scroll the container so the currently active link is visible
    // this.ref.current.scrollTop = document
    //   .querySelector('[aria-current]')
    //   .getBoundingClientRect().top
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('mousedown', this.handleOutsideClick, true);
    clearTimeout(this.timeout);
  }

  render() {
    const {isOpen} = this.props;
    const {isMounted, transitions} = this.state;

    return (
      <Location>
        {({location}) => (
          <ElasticScroll>
            <Navbar
              id="main-nav"
              ref={this.ref}
              style={{transition: transitions ? '' : 'none'}}
              isOpen={isOpen}
              isMounted={isMounted}
              onBlur={this.handleBlur}
              tabIndex="-1"
            >
              <XButton aria-label="Close Menu" onClick={this.handleClose}>
                <XIcon />
              </XButton>
              <List>
                <div>
                  <Tippy
                    theme="light"
                    placement="bottom-start"
                    trigger="mouseenter click"
                    interactive={true}
                    arrow={false}
                    offset={[0, 5]}
                    duration={[200, 100]}
                    css={css`
                      font-size: 16px;
                      padding: 8px;
                    `}
                    sticky={true}
                    content={
                      <ul
                        css={css`
                          padding-left: 0;
                        `}
                      >
                        <Li>
                          <Link to="/v6/getting-started/">
                            v6.x docs (latest)
                          </Link>
                        </Li>
                        <Li>
                          <Link to="/v5/getting-started/">v5.x docs</Link>
                        </Li>
                      </ul>
                    }
                  >
                    <VersionButton>
                      {getVersionFromPath(location.pathname)}.x{' '}
                      <ChevronDown
                        size={20}
                        style={{
                          position: 'relative',
                          verticalAlign: -5,
                          top: 1,
                        }}
                      />
                    </VersionButton>
                  </Tippy>
                </div>
                <StaticQuery
                  query={allMdxQuery}
                  render={(data) => {
                    return sortActivePages(data.allMdx.edges, location).map(
                      ({node}) => (
                        <ListItem key={node.frontmatter.path}>
                          <Link to={node.frontmatter.path}>
                            {node.frontmatter.title}
                          </Link>
                        </ListItem>
                      )
                    );
                  }}
                />
              </List>
            </Navbar>
          </ElasticScroll>
        )}
      </Location>
    );
  }
}

export default Nav;

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
`;
