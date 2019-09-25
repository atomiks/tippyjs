import React, { Component } from 'react'
import styled from 'styled-components'
import TippyLogo from '../images/logo.svg'
import { MEDIA, Container, Flex, Link } from './Framework'
import Menu from 'react-feather/dist/icons/menu'
import theme from '../css/theme'
import { MenuButton } from './Header'

const HeaderRoot = styled.header`
  position: relative;
  background-repeat: no-repeat;
  background-size: cover;
  text-align: center;
  margin-left: -250px;
  padding-left: 250px;
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid ${theme.border};
`

const Logo = styled.img`
  display: block;
  height: 3.5rem;
`

const MenuButtonDark = styled(MenuButton)`
  color: #333;
  margin-top: 1.125rem;
`

const menuStyles = {
  width: 40,
  height: 40,
}

class MiniHeader extends Component {
  render() {
    const { isNavOpen, openNav } = this.props
    return (
      <HeaderRoot>
        <Container>
          <Flex justify="center">
            <Link to="/">
              <Logo src={TippyLogo} draggable="false" alt="Tippy Logo" />
            </Link>
            <MenuButtonDark
              aria-label="Menu"
              aria-expanded={isNavOpen ? 'true' : 'false'}
              onClick={openNav}
            >
              <Menu style={menuStyles} />
            </MenuButtonDark>
          </Flex>
        </Container>
      </HeaderRoot>
    )
  }
}

export default MiniHeader
