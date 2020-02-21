import styled from 'styled-components';

const Text = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.medium};
  margin-bottom: ${({ theme }) => theme.space.medium};
`;

export const Strong = styled.strong`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ color, theme }) => (color ? theme.colors[color] : theme.colors.primary)};
`;

export const Emphasis = styled.em`
  font-style: italic;
  color: ${({ color, theme }) => (color ? theme.colors[color] : theme.colors.primary)};
`;

export default Text;
