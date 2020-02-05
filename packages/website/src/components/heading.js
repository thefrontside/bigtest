import styled from 'styled-components';

const H1 = styled.h1`
  font-family: ${({ theme }) => theme.fonts.heading};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.light};
  font-size: ${({ theme }) => theme.fontSizes.xxxLarge};
  line-height: ${({ theme }) => theme.lineHeights.heading};
  margin-bottom: ${({ theme }) => theme.space.large};
`;

const H2 = styled.h2`
  color: ${({ color, theme }) => ((color) ? theme.colors[color] : theme.colors.primary)};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.body};
  font-size: ${({ theme }) => theme.fontSizes.xLarge};
  line-height: ${({ theme }) => theme.lineHeights.heading};
  margin-bottom: ${({ theme }) => theme.space.large};
`;

const H3 = styled.h3`
  color: ${({ color, theme }) => (color) ? theme.colors[color] : theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.medium};
  line-height: ${({ theme }) => theme.lineHeights.heading};
  margin-bottom: ${({ theme }) => theme.space.medium};
`;

const H4 = styled.h4`
  color: ${({ color, theme }) => (color) ? theme.colors[color] : theme.colors.primary};
  font-family: ${({ theme }) => theme.fonts.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.small};
  line-height: ${({ theme }) => theme.lineHeights.heading};
  margin-bottom: ${({ theme }) => theme.space.small};
  text-transform: uppercase;
  letter-spacing: 1px;
`;

export { H1, H2, H3, H4 };
