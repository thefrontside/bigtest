import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

const bigtest_logo = require('../images/frontside/bigtest-logo.svg');
const discord_icon = require('../images/icons/discord.svg');
const github_icon = require('../images/icons/github.svg');

const logo_height = "calc(var(--size-base)*2)";

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-half-vw) var(--space-single-vw);
`;

const NavbarLogoLink = styled(Link)`
  height: ${logo_height};
`;

const NavbarLogo = styled.img`
  height: 100%;
`;

const NavbarMenu = styled.ul`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const NavbarItem = styled.li`
  margin-left: calc(var(--space-half-vw)/2);
  height: 100%;
`;

const NavbarA = styled.a`
  color: var(--color-dark-blue);
  font-weight: 600;
  font-size: var(--size-med-sm);
`;

// const NavbarLink = styled(Link)`
//   color: var(--color-dark-blue);
//   font-weight: 600;
//   font-size: var(--size-med-sm);
// `;

const NavbarIcon = styled.img`
  height: calc(${logo_height}/1.75);
`;

const Navbar = () => (
  <NavbarContainer>
    <NavbarLogoLink to="/">
      <NavbarLogo src={bigtest_logo} alt="BigTestJS" />
    </NavbarLogoLink>
    <NavbarMenu>
      {/* <NavbarItem>
        <NavbarLink to="">
          API
        </NavbarLink>
      </NavbarItem> */}
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
