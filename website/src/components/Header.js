import React, { Component } from 'react'
import styled from 'styled-components'
import TippyLogo from '../images/logo.svg'
import { MEDIA, Container, Flex, ExternalLink } from './Framework'
import GitHub from 'react-feather/dist/icons/github'
import CloudLightning from 'react-feather/dist/icons/cloud-lightning'
import Menu from 'react-feather/dist/icons/menu'
import VersionNotice from './VersionNotice'
import TextGradient from './TextGradient'

const HeaderRoot = styled.header`
  position: relative;
  background: radial-gradient(circle at 0% 20%, #a09eff, #4884f0, #b3e0fa);
  padding: 25px 0;
  text-align: center;
  margin-bottom: 50px;
  color: white;
`

const Logo = styled.img`
  display: block;
  height: 70px;
  margin: 0 auto 10px;
`

const Title = styled.h1`
  display: inline-block;
  font-size: 48px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 25px;
  font-weight: 400;
`

const ButtonLink = styled(ExternalLink)`
  background: rgba(255, 255, 255, 0.15);
  padding: 12px 24px;
  border-radius: 4px;
  transition: all 0.25s;
  color: #ffffff;
  margin: 0 10px 10px;

  &:hover {
    background: white;
    border-bottom-color: white;
    box-shadow: 0 8px 16px -2px rgba(0, 32, 128, 0.25);
    text-decoration: none;
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
  color: '#ffe6b3',
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
          <Logo src={TippyLogo} draggable="false" alt="Tippy Logo" />
          <Title>
            <TextGradient>Tippy.js</TextGradient>
          </Title>
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
        <svg
          style={{ margin: '-6% 0 -30px' }}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1920 240"
          fill="white"
        >
          <g>
            <path d="M1920,144.5l0,95.5l-1920,0l0,-65.5c196,-36 452.146,-15.726 657.5,8.5c229.698,27.098 870,57 1262.5,-38.5Z" />
          </g>
        </svg>
      </HeaderRoot>
    )
  }
}

export default Header
