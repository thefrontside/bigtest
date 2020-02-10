import styled, { css } from 'styled-components';

interface IconLinkProps {
  icon: string;
}

export const FauxImageLink = css`
  display: block;
  text-indent: -1000px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-size: contain;
  cursor: pointer;
`;

export const IconLink = styled.a<IconLinkProps>`
  ${FauxImageLink}
  background-image: url(${({ icon }) => icon});
  width: ${({ theme }) => theme.fontSizes.large};
  height: ${({ theme }) => theme.fontSizes.large};
  margin: 0 ${({ theme }) => theme.space.medium};
`;

export const LinkWithIcon = styled.a<IconLinkProps>`
  display: block;
  &:before {
    content: '';
    ${FauxImageLink}
    float: left;
    background-image: url(${({ icon }) => icon});
    height: ${({ theme }) => theme.fontSizes.medium};
    width: ${({ theme }) => theme.space.medium};
    font-size: ${({ theme }) => theme.fontSizes.medium};
    margin-right: ${({ theme }) => theme.space.small};
    margin-top: 6px;
  }
  
`;

export default IconLink;
