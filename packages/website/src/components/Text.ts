import styled from 'styled-components';

const Text = styled.p`
  margin-bottom: ${({ theme }) => theme.space.medium};
`;

export const Strong = styled.strong`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ color, theme }) => (color ? theme.colors[color] : theme.colors.primary)};
`;

export default Text;
