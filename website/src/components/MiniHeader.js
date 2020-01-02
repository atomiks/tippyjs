import React, {Component} from 'react';
import styled from '@emotion/styled';
import TippyLogo from '../images/logo.svg';
import {Container, Flex, Link} from './Framework';
import Menu from 'react-feather/dist/icons/menu';
import theme from '../css/theme';
import {MenuButton} from './Header';

const HeaderRoot = styled.header`
  position: relative;
  background-repeat: no-repeat;
  background-size: cover;
  text-align: center;
  margin-left: -250px;
  padding-left: 250px;
  padding-top: 12px;
  padding-bottom: 12px;
  margin-bottom: 32px;
  border-bottom: 1px solid ${theme.border};
`;

const Logo = styled.img`
  display: block;
  height: 60px;
`;

const MenuButtonDark = styled(MenuButton)`
  color: #7761d1;
  margin-top: 18px;
`;

const menuStyles = {
  width: 40,
  height: 40,
};

class MiniHeader extends Component {
  render() {
    const {isNavOpen, openNav} = this.props;
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
    );
  }
}

export default MiniHeader;
