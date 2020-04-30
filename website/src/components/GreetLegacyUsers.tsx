import React, { useEffect, useState } from 'react';

import Text from './Text';
import Section from './Section';
import { H4 } from './Heading';
import WarningBox, { WarningBoxLink } from './WarningBox';

interface GreetLegacyProps {
  location: { search: string };
}

const GreetLegacyUsers: React.FC<GreetLegacyProps> = () => {
  let [legacy, setLegacy] = useState(false);

  useEffect(() => {
    if (typeof window !== `undefined`) {
      let fromLegacy = new URLSearchParams(window.location.search).get('archived-page');
      fromLegacy ? setLegacy(true) : setLegacy(false);
    }
  });

  if (legacy) {
    return (
      <Section>
        <WarningBox width={[1, 1, 2 / 3]}>
          <H4 color="bodyCopy">Coming from the old BigTest Site?</H4>
          <Text>
            Welcome to the new BigTest! We are making major changes to the project to make BigTest the ultimate
            testing framework. Take a look around, and reach out to us if you have any questions{' '}
            <WarningBoxLink href="mailto:bigtest@frontside.com">bigtest@frontside.com</WarningBoxLink>.
          </Text>
          <Text>
            You can still access the old website here:{' '}
            <WarningBoxLink href="https://v1.bigtestjs.io">https://v1.bigtestjs.io</WarningBoxLink>
          </Text>
        </WarningBox>
      </Section>
    );
  } else {
    return <></>;
  }
};

export default GreetLegacyUsers;
