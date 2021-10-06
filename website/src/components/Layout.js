import React, {Component} from 'react';
import {SkipNavLink, SkipNavContent} from '@reach/skip-nav';
import {MDXProvider} from '@mdx-js/react';
import styled from '@emotion/styled';
import {
  Container,
  Demo,
  Button,
  Row,
  Col,
  Flex,
  MEDIA,
  ExternalLink,
} from './Framework';
import Tippy from './Tippy';
import Nav from './Nav';
import NavButtons from './NavButtons';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import SEO from './SEO';
import Image from './Image';
import Icon from './Icon';
import ElasticScroll from './ElasticScroll';
import CSS from '../css';

import 'normalize.css';
import 'animate.css/source/_base.css';
import 'animate.css/source/attention_seekers/rubberBand.css';
import 'animate.css/source/attention_seekers/tada.css';
import 'animate.css/source/attention_seekers/wobble.css';
import 'focus-visible';

const LinkIcon = styled.a`
  display: inline-block;
  position: absolute;
  padding: 10px 0;
  opacity: 0;
  transition: opacity 0.2s;
  width: 32px;
  top: -10px;
  right: -16px;
  color: #81edff;

  &:hover,
  &:focus {
    opacity: 1;
    text-decoration: none;
  }

  ${MEDIA.md} {
    right: initial;
    text-align: center;
    width: 30px;
    left: -30px;
  }
`;

const A = styled.a`
  font-weight: bold;
  border-bottom: 2px solid #425991;
  transition: color 0.25s, border-color 0.2s;

  &:hover {
    color: #fff;
    border-bottom: 2px solid rgba(255, 255, 255, 0.6);
    text-decoration: none;
  }

  &:active {
    border-bottom-style: dashed;
  }
`;

let hrefs = new Set();

class Heading extends React.Component {
  constructor(props) {
    super(props);

    let href = []
      .concat(this.props.children)
      .filter((child) => typeof child === 'string')
      .join(' ')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/-$/g, '')
      .toLowerCase();

    // Check for duplicate #s
    if (hrefs.has(href)) {
      let counter = 1;

      while (hrefs.has(href + counter)) {
        counter++;
      }

      href = `${href}-${counter}`;
    }

    hrefs.add(href);

    this.state = {href};
  }

  render() {
    const {level, ...props} = this.props;
    const Tag = `h${level}`;

    return (
      <Tag {...props}>
        <LinkIcon
          className="link-icon"
          id={this.state.href}
          href={`#${this.state.href}`}
        >
          #
        </LinkIcon>
        {props.children}
      </Tag>
    );
  }
}

const components = {
  Tippy,
  Demo,
  Button,
  Row,
  Col,
  Flex,
  Image,
  Icon,
  a: (props) => {
    const extendedProps = {...props};
    const re = /^(\.\.)?[/#]/.test(props.href);

    if (props.href && !re) {
      extendedProps.rel = 'nofollow noreferrer';
      extendedProps.target = '_blank';
    }

    return <A {...extendedProps} />;
  },
  h3: (props) => <Heading {...props} level={3} />,
  h4: (props) => <Heading {...props} level={4} />,
  h5: (props) => <Heading {...props} level={5} />,
  h6: (props) => <Heading {...props} level={6} />,
  pre: (props) => (
    <ElasticScroll>
      <pre {...props} />
    </ElasticScroll>
  ),
};

class Layout extends Component {
  constructor() {
    super();
    hrefs = new Set();
  }

  state = {
    isNavOpen: false,
  };

  openNav = () => {
    this.setState({isNavOpen: true});
  };

  closeNav = () => {
    this.setState({isNavOpen: false});
  };

  render() {
    const {isNavOpen} = this.state;
    const {children, pageContext} = this.props;

    const HeaderToUse = Header;

    return (
      <MDXProvider components={components}>
        <CSS />
        <SEO pageContext={pageContext} />
        <SkipNavLink />
        <Main>
          <HeaderToUse
            openNav={this.openNav}
            isNavOpen={isNavOpen}
            pageIndex={pageContext.frontmatter.index}
          />
          <Nav isOpen={isNavOpen} close={this.closeNav} />
          <SkipNavContent>
            <Container>
              {pageContext.frontmatter.title !== 'Demo' && (
                <h2>{pageContext.frontmatter.title}</h2>
              )}
              {children}
            </Container>
            <NavButtons next={pageContext.frontmatter.index + 1} />
          </SkipNavContent>
          <Footer>
            <p>© {new Date().getFullYear()} — MIT License</p>
            <small>
              Icons made by Freepik from{' '}
              <ExternalLink href="https://flaticon.com">
                www.flaticon.com
              </ExternalLink>
            </small>
          </Footer>
        </Main>
      </MDXProvider>
    );
  }
}

export default Layout;
