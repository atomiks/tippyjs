import React, { Component } from 'react'
import styled from 'styled-components'
import TippyLogo from '../images/logo.svg'
import { MEDIA, Container, Flex, ExternalLink } from './Framework'
import GitHub from 'react-feather/dist/icons/github'
import CloudLightning from 'react-feather/dist/icons/cloud-lightning'
import Menu from 'react-feather/dist/icons/menu'
import VersionNotice from './VersionNotice'

const HeaderRoot = styled.header`
  position: relative;
  background: linear-gradient(91deg, #f1eefc, #9dc6ff 70%, #a5bcff);
  padding: 25px 0;
  text-align: center;
  margin-bottom: 50px;
`

const Logo = styled.img`
  height: 70px;
  margin-bottom: 10px;
`

const Title = styled.h1`
  font-size: 48px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 25px;
`

const ButtonLink = styled(ExternalLink)`
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 12px 24px;
  border-radius: 4px;
  transition: all 0.15s;
  color: #4574c0;
  margin: 0 10px 10px;
  font-weight: 500;

  &:hover {
    background: white;
    border-bottom-color: white;
    box-shadow: 0 8px 16px -2px rgba(0, 32, 128, 0.25);
  }
`

const MenuButton = styled.button`
  position: absolute;
  top: -10px;
  left: 15px;
  color: inherit;
  font-weight: bold;
  border: none;
  background: none;
  text-transform: uppercase;
  border-radius: 4px;
  padding: 0;

  ${MEDIA.lg} {
    display: none;
  }
`

const iconStyles = {
  verticalAlign: -6,
  marginRight: 10,
}

const cloudLightningStyles = {
  ...iconStyles,
  color: '#f88e27',
}

const githubStyles = {
  ...iconStyles,
  color: '#333',
}

const menuStyles = {
  width: 36,
  height: 36,
}

class Header extends Component {
  state = {
    displayVersionNotice: false,
  }

  componentDidMount() {
    // People who visit 'Getting Started' are most likely new, so they don't
    // need to know about the new version. Also only show it once.
    const { pageIndex } = this.props
    const disableVersionNotice = localStorage.getItem('disableVersionNotice')
    localStorage.setItem('disableVersionNotice', 'true')

    this.setState({
      displayVersionNotice: pageIndex > 1 && disableVersionNotice === null,
    })
  }

  render() {
    const { isNavOpen, openNav } = this.props
    const { displayVersionNotice } = this.state
    return (
      <HeaderRoot>
        <Container>
          {displayVersionNotice && <VersionNotice />}
          <Logo src={TippyLogo} draggable="false" />
          <Title>Tippy.js</Title>
          <Flex justify="center">
            <ButtonLink href="https://popper.js.org">
              <CloudLightning style={cloudLightningStyles} />
              Powered by Popper.js
            </ButtonLink>
            <ButtonLink href="https://github.com/atomiks/tippyjs">
              <GitHub style={githubStyles} />
              View on GitHub
            </ButtonLink>
          </Flex>
          <MenuButton
            aria-label="Menu"
            aria-expanded={isNavOpen ? 'true' : 'false'}
            onClick={openNav}
          >
            <Menu style={menuStyles} />
          </MenuButton>
        </Container>
      </HeaderRoot>
    )
  }
}

export default Header
