import React, {Component, createRef} from 'react';
import styled from 'styled-components';
import {MEDIA, Link} from './Framework';
import {StaticQuery, graphql} from 'gatsby';
import {sortActivePages} from '../utils';
import X from 'react-feather/dist/icons/x';
import ElasticScroll from './ElasticScroll';

const Navbar = styled.nav`
  display: ${props => (props.isMounted ? 'block' : 'none')};
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 250px;
  background: linear-gradient(180deg, rgba(121, 148, 198, 0.92), #565791);
  backdrop-filter: saturate(180%);
  color: white;
  overflow-y: auto;
  z-index: 2;
  transform: ${props =>
    props.isOpen
      ? 'translate3d(-4%, 0, 0) scaleX(1)'
      : 'translate3d(-100%, 0, 0) scaleX(0)'};
  transition: transform ${props => (props.isOpen ? '0.55s' : '0.3s')},
    visibility 0.2s, opacity 0.8s;
  transition-timing-function: ${props =>
    props.isOpen ? 'cubic-bezier(.165, 1.3, 0.4, 1)' : 'ease'};
  visibility: ${props => (props.isOpen ? 'visible' : 'hidden')};
  box-shadow: 4px 0 32px 0 rgba(0, 32, 64, 0.25);
  opacity: ${props => (props.isOpen ? 1 : 0)};

  ${MEDIA.lg} {
    padding-top: 0;
    display: block;
    visibility: visible;
    transform: none;
    box-shadow: none;
    opacity: 1;
    will-change: transform, opacity;
  }
`;

const List = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

const ListItem = styled.li`
  margin: 0;

  &:first-child {
    padding-top: 32px;
  }

  &:last-child {
    padding-bottom: 32px;
  }

  > a {
    display: block;
    padding: 4px 25px;
    padding-left: calc(25px + 4%);
    font-size: 17px;
    border: 1px dashed transparent;

    ${MEDIA.lg} {
      padding-left: 25px;
    }

    &:hover {
      border-bottom-color: transparent;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.15);
    }

    &:active {
      border-color: white;
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
  background: white;
  color: #7761d1;
  box-shadow: 0 5px 0 rgba(0, 32, 64, 0.2);

  &:active {
    box-shadow: 0 2px 0 rgba(0, 32, 64, 0.2);
    transform: translateY(4px);
  }

  ${MEDIA.lg} {
    display: none;
  }
`;

const XIcon = styled(X)`
  height: 32px;
  width: 32px;
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

  handleBlur = e => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      this.props.close();
    }
  };

  handleOutsideClick = e => {
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
      <ElasticScroll>
        <Navbar
          id="main-nav"
          ref={this.ref}
          style={{transition: transitions ? '' : 'none'}}
          isOpen={isOpen}
          isMounted={isMounted}
          onBlur={this.handleBlur}
        >
          <XButton aria-label="Close Menu" onClick={this.handleClose}>
            <XIcon />
          </XButton>
          <List>
            <StaticQuery
              query={allMdxQuery}
              render={data => {
                return sortActivePages(data.allMdx.edges).map(({node}) => (
                  <ListItem key={node.frontmatter.path}>
                    <Link to={node.frontmatter.path}>
                      {node.frontmatter.title}
                    </Link>
                  </ListItem>
                ));
              }}
            />
          </List>
        </Navbar>
      </ElasticScroll>
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
