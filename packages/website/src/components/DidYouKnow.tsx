import React from 'react';
import styled from 'styled-components';

import Text from './Text';
import { H3 } from './Heading';

const SideBox = styled.div`
  background-color: ${({ theme }) => theme.colors.didyouknow};
  padding: ${({ theme }) => theme.space.large};
`;

const DidYouKnow: React.FC = () => {
  return (
    <SideBox>
      <H3>Flexible &amp; framework agnostic</H3>
      <Text>
        BigTest is a toolkit of several packages that can be used separately or together. The result is open source
        software that's flexible to fit your application, regardless of framework (React, Vue, Ember, Angular,
        etc.), test framework (Mocha, Jasmine, etc.), browser, or device.
      </Text>
    </SideBox>
  );
};

export default DidYouKnow;
