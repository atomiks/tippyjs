import React, {Component} from 'react';
import {SkipNavLink, SkipNavContent} from '@reach/skip-nav';
import {MDXProvider} from '@mdx-js/react';
import styled from 'styled-components';
import {Container, Demo, Button, Row, Col, Flex, MEDIA} from './Framework';
import Tippy, {TippySingleton} from './Tippy';
import Nav from './Nav';
import NavButtons from './NavButtons';
import Header from './Header';
import Main from './Main';
import Footer from './Footer';
import SEO from './SEO';
import Image from './Image';
import Emoji from './Emoji';
import CSS from '../css';
import slugify from 'slugify';
import elasticScroll from 'elastic-scroll-polyfill';

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
  top: -12px;
  right: 0;
  color: #7761d1;

  &:hover,
  &:focus {
    opacity: 1;
    text-decoration: none;
  }

  ${MEDIA.md} {
    right: initial;
    left: -32px;

    &:focus {
      width: 20px;
    }
  }
`;

const A = styled.a`
  font-weight: bold;
  border-bottom: 2px solid #e2eafd;

  &:hover {
    color: #2161f2;
    background: #f0f4fe;
    border-bottom: 2px solid #2161f2;
    text-decoration: none;
  }

  &:active {
    border-bottom-style: dashed;
  }
`;

let hrefs = [];

class Heading extends React.Component {
  constructor(props) {
    super(props);

    let href = slugify(String(this.props.children), {
      lower: true,
    });

    // Check for duplicate #s
    if (hrefs.indexOf(href) !== -1) {
      let counter = 1;

      while (hrefs.indexOf(href + counter) !== -1) {
        counter++;
      }

      href = `${href}-${counter}`;
    }

    hrefs.push(href);

    this.state = {href};
  }

  componentWillUnmount() {
    hrefs = hrefs.filter(href => href !== this.state.href);
  }

  render() {
    const Tag = `h${this.props.level}`;

    return (
      <Tag {...this.props}>
        <LinkIcon
          className="link-icon"
          id={this.state.href}
          href={`#${this.state.href}`}
        >
          #
        </LinkIcon>
        {this.props.children}
      </Tag>
    );
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
  Emoji,
  a: props => {
    const extendedProps = {...props};

    if (props.href && props.href[0] !== '/') {
      extendedProps.rel = 'nofollow noreferrer';
      extendedProps.target = '_blank';
    }

    return <A {...extendedProps} />;
  },
  h3: props => <Heading {...props} level={3} />,
  h4: props => <Heading {...props} level={4} />,
  h5: props => <Heading {...props} level={5} />,
  h6: props => <Heading {...props} level={6} />,
  tr: props => {
    const maybeStrongNode = props.children[0].props.children[0]; // <strong>
    const isPluginRow =
      maybeStrongNode && maybeStrongNode.props
        ? maybeStrongNode.props.mdxType === 'strong'
        : false;
    return <tr {...props} className={isPluginRow ? 'plugin-prop' : ''} />;
  },
  // TODO: find a better way to do this
  td: class extends React.Component {
    ref = React.createRef();

    state = {dataLabel: ''};

    componentDidMount() {
      let child = this.ref.current;
      let i = 0;

      while ((child = child.previousSibling) != null) {
        i++;
      }

      this.setState({
        dataLabel: ['Prop', 'Default', 'Description'][i],
      });
    }

    render() {
      return (
        <td ref={this.ref} {...this.props} data-label={this.state.dataLabel} />
      );
    }
  },
  pre: class extends React.Component {
    ref = React.createRef();

    componentDidMount() {
      if (/Mac/.test(navigator.userAgent)) {
        elasticScroll({targets: this.ref.current});
      }
    }

    render() {
      return <pre ref={this.ref} {...this.props} />;
    }
  },
};

class Layout extends Component {
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
              <h2>{pageContext.frontmatter.title}</h2>
              {children}
            </Container>
            <NavButtons next={pageContext.frontmatter.index + 1} />
          </SkipNavContent>
          <Footer>© {new Date().getFullYear()} - MIT License</Footer>
        </Main>
      </MDXProvider>
    );
  }
}

export default Layout;
