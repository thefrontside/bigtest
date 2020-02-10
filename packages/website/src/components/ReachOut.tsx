import React from 'react';
import styled from 'styled-components';

import { H4 } from '../components/Heading';
import { LinkWithIcon } from './IconLink';

import { discord_icon, twitter_icon, email_icon } from '../images';

const ReachTitle = styled(H4)`
  margin-bottom: ${({ theme }) => theme.space.large};
`;

const ReachLink = styled(LinkWithIcon)`
  margin-top: ${({ theme }) => theme.space.medium};
`;

const ReachOut: React.FC = () => {
  return (
    <>
      <ReachTitle>Reach out!</ReachTitle>
      <ReachLink
        icon={twitter_icon}
        href='https://twitter.com/thefrontside'
        title='Follow Twitter'
        target='_blank'
      >
          @thefrontside #bigTest
      </ReachLink>
      <ReachLink
        icon={email_icon}
        href='mailto:bigtest@frontside.io'
        title='Email Us'
        target='_blank'
      >
          bigtest@frontside.io
      </ReachLink>
      <ReachLink
        icon={discord_icon}
        href='https://discord.gg/W7r24Aa'
        title='Discord community'
        target='_blank'
      >
          Join our Discord!
      </ReachLink>
    </>
  );
};

export default ReachOut;
