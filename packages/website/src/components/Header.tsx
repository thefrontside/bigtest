import { Link } from 'gatsby';
import React from 'react';
import styled from 'styled-components';

import Section from './Section';
import IconLink, { FauxImageLink } from './IconLink';

import { bigtest_logo_svg, discord_icon, github_icon } from '../images';

const HeadWrapper = styled(Section)`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: space-between;
  padding-top: ${({ theme }) => theme.space.xLarge};
  padding-bottom: ${({ theme }) => theme.space.xLarge};
`;

const LogoLink = styled(Link)`
  ${FauxImageLink}
  background-image: url(${bigtest_logo_svg});
  height: ${({ theme }) => theme.fontSizes.xxxLarge};
  width: 300px;
`;

const Nav = styled.nav`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

// const APILink = styled(Link)`
//   color: ${({ theme }) => theme.colors.primary};
//   font-weight: ${({ theme }) => theme.fontWeights.bold};
//   font-size: ${({ theme }) => theme.fontSizes.medium};
//   font-family: ${({ theme }) => theme.fonts.heading};
//   letter-spacing: 1px;
//   align-content: center;
//   margin: 0 ${({ theme }) => theme.space.medium};
// `;

const Header = () => (
  <HeadWrapper as="header">
    <LogoLink to="/">BigTest</LogoLink>
    <Nav>
      {/* <APILink to='' title='API Documentation'>API</APILink> */}
      <IconLink
        icon={github_icon}
        href="https://github.com/thefrontside/bigtest.git"
        title="Project Github"
        target="_blank"
      >
        Github
      </IconLink>
      <IconLink icon={discord_icon} href="https://discord.gg/W7r24Aa" title="Discord community" target="_blank">
        Discord
      </IconLink>
    </Nav>
  </HeadWrapper>
);

export default Header;
