import React from 'react';
import { Link } from 'gatsby';
import styled from 'styled-components';

import Flex from './Flex';
import Image from './Image';

import { bigtest_logo_svg, discord_icon, github_icon } from '../images';

const NavbarContainer = styled(Flex)`
  justify-content: space-between;
  align-items: center;
`;

const NavbarLogoLink = styled(Link)`
  height: ${({ theme }) => theme.space.large};
`;

const NavbarMenu = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const NavbarItem = styled.li`
  margin-left: ${({ theme }) => theme.space.large};
`;

const NavbarA = styled.a`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`;

const NavbarLink = styled(Link)`
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-family: ${({ theme }) => theme.fonts.heading};
`;

const NavbarIcon = styled(Image)`
  height: ${({ theme }) => theme.fontSizes.large};
`;

const Navbar = () => (
  <NavbarContainer paddingX={['medium', 'medium', 'xxLarge']} paddingY={['medium', 'medium', 'large']}>
    <NavbarLogoLink to="/">
      <Image src={bigtest_logo_svg} alt="BigTestJS" height="100%" />
    </NavbarLogoLink>
    <NavbarMenu>
      <NavbarItem>
        <NavbarLink to="">API</NavbarLink>
      </NavbarItem>
      <NavbarItem>
        <NavbarA href="https://github.com">
          <NavbarIcon src={github_icon} alt="Github" />
        </NavbarA>
      </NavbarItem>
      <NavbarItem>
        <NavbarA href="https://discord.com">
          <NavbarIcon src={discord_icon} alt="Discord" />
        </NavbarA>
      </NavbarItem>
    </NavbarMenu>
  </NavbarContainer>
);

export default Navbar;
