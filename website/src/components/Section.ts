import styled from 'styled-components';

const Section = styled.section`
  padding: ${({ theme }) => theme.space.large} ${({ theme }) => theme.space.medium};
  max-width: ${({ theme }) => theme.breakpoints.large};
  margin: 0 auto;
`;

export default Section;
