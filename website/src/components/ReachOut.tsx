import React from 'react';
import styled from 'styled-components';

import { H4 } from '../components/Heading';
import { LinkWithIcon } from './IconLink';

import { discordIconSVG, twitterIconSVG, emailIconSVG } from '../images';

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
        icon={twitterIconSVG}
        href="https://twitter.com/thefrontside"
        title="Follow Twitter"
        target="_blank"
      >
        @thefrontside #bigTest
      </ReachLink>
      <ReachLink icon={emailIconSVG} href="mailto:bigtest@frontside.com" title="Email Us" target="_blank">
        bigtest@frontside.com
      </ReachLink>
      <ReachLink icon={discordIconSVG} href="https://discord.gg/r6AvtnU" title="Discord community" target="_blank">
        Join our Discord!
      </ReachLink>
    </>
  );
};

export default ReachOut;
