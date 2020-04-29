import styled from 'styled-components';
import { compose, color, typography } from 'styled-system';

const Text = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  margin-bottom: ${({ theme }) => theme.space.medium};
  ${compose(color, typography)}
`;

export const Strong = styled.strong`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  ${compose(color, typography)}
`;

export const Emphasis = styled.em`
  font-style: italic;
  ${compose(color, typography)}
`;

export default Text;
