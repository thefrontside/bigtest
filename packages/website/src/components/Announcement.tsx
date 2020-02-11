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
  const from_old_website: string = params.get('from-old-website')!;
  return from_old_website == 'true' ? true : false;
};

const from_where = (props) => {
  const params = new URLSearchParams(props.search);
  const from_which_page: string = params.get('archived-page')!;
  return (
    <Text>
      You can still find the page you were trying to visit in our archive: <a href={from_which_page}>{from_which_page}</a>
    </Text>
  )
}

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
          {from_where(props.location)}
        </AnnouncementBox>
      </Section>
    );
  } else {
    return <></>;
  }
};

export default Announcement;
