import React from 'react';
import styled from 'styled-components';

import Text from './Text';
import { H4 } from './Heading';
import Box from './Box';
import Section from './Section';

interface AnnouncementProps {
  location: Object;
}

const AnnouncementBox = styled(Box)`
  background: #ffe9bf;
  width: 60%;
  padding: ${({ theme }) => theme.space.medium} ${({ theme }) => theme.space.large};
  margin-bottom: ${({ theme }) => theme.space.medium};
  border-radius: 4px;
`;

const redirected = (props): boolean => {
  const params = new URLSearchParams(props.search);
  const fow = params.get('from-old-website');
  console.log(props);
  return fow == 'true' ? true : false;
};

const Announcement: React.FC<AnnouncementProps> = props => {
  if (redirected(props.location)) {
    return (
      <Section>
        <AnnouncementBox>
          <H4 color={'bodyCopy'}>Coming from the old BigTest Site?</H4>
          <Text>
            Welcome to the new BigTest! We have made major changes in the project to make BigTest the ultimate
            testing framework. Take a look around, and reach out to us if you have any questions{' '}
            <a href="mailto:bigtest@frontside.io">bigtest@frontside.io</a>.
          </Text>
        </AnnouncementBox>
      </Section>
    );
  } else {
    return <></>;
  }
};

export default Announcement;
