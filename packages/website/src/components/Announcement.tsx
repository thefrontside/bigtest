import React from 'react';

interface AnnouncementProps {
  location: Object;
}

const redirected = (props): boolean => {
  const params = new URLSearchParams(props.search)
  const fow = params.get('from-old-website');
  console.log(props)
  return fow == 'true' ? true : false;
}

const Announcement: React.FC<AnnouncementProps> = (props) => {
  if (redirected(props.location)) {
    return (
      <> hello </>
    )
  } else {
    return (
      <></>
    )
  }
};

export default Announcement;
