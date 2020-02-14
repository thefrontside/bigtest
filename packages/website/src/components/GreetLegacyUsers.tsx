import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

import Text from './Text';
import { H4 } from './Heading';
import Box from './Box';
import Section from './Section';

interface GreetLegacyProps {
  location: { search: string };
}

const GreetLegacyBox = styled(Box)`
  background: #ffe9bf;
  width: 60%;
  padding: ${({ theme }) => theme.space.large} ${({ theme }) => theme.space.large} ${({ theme }) => theme.space.xSmall} ${({ theme }) => theme.space.large};
  margin-bottom: ${({ theme }) => theme.space.medium};
  border-radius: 4px;
`;

const GreetLegacyLink = styled.a`
  border-bottom: 1px dotted ${({ theme }) => theme.colors.bodyCopy};
`;

const GreetLegacyUsers: React.FC<GreetLegacyProps> = () => {
  const [legacy, setLegacy] = useState(false);

  useEffect(() => {
    if (typeof window !== `undefined`) {
      const from_legacy = new URLSearchParams(window.location.search).get('archived-page');
      from_legacy ? setLegacy(true) : setLegacy(false);
    }
  })

  if (legacy) {
    return (
      <Section>
        <GreetLegacyBox>
          <H4 color={'bodyCopy'}>Coming from the old BigTest Site?</H4>
          <Text>
            Welcome to the new BigTest! We have made major changes in the project to make BigTest the ultimate
              testing framework. Take a look around, and reach out to us if you have any questions{' '}
            <GreetLegacyLink href="mailto:bigtest@frontside.io">bigtest@frontside.io</GreetLegacyLink>.
            </Text>
          <Text>
            You can still access the old website here: <GreetLegacyLink href="https://v1.bigtestjs.io">https://v1.bigtestjs.io</GreetLegacyLink>
          </Text>
        </GreetLegacyBox>
      </Section>
    );
  } else {
    return <></>;
  }
};

export default GreetLegacyUsers;
