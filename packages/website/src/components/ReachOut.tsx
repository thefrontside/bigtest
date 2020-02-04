import React from 'react';
import styled from 'styled-components';

import { H4 } from '../components/Heading';

import { discord_icon, bigtest_icon_svg as placeholder } from '../images';

const ContactItem = styled.a`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.primary};
`;

const ContactIcon = styled.img`
  height: ${({ theme }) => theme.space.medium};
  padding-right: ${({ theme }) => theme.space.medium};
`;

const ReachOut: React.FC = () => {
  return (
    <>
      <H4>Reach out!</H4>
      <ul>
        <li>
          <ContactItem href="https://twitter.com/thefrontside">
            <ContactIcon src={placeholder} alt="placeholder" />
            @thefrontside #bigTest
          </ContactItem>
        </li>
        <li>
          <ContactItem href="mailto:bigtest@frontside.io">
            <ContactIcon src={placeholder} alt="placeholder" />
            bigtest@frontside.io
          </ContactItem>
        </li>
        <li>
          <ContactItem href="https://discord.com">
            <ContactIcon src={discord_icon} alt="discord" />
            Join our Discord!
          </ContactItem>
        </li>
      </ul>
    </>
  );
};

export default ReachOut;
