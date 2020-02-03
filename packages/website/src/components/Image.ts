import styled from 'styled-components';
import StyledSystem, { compose, space, layout } from 'styled-system';

export interface ImageProps
  extends StyledSystem.SpaceProps,
    StyledSystem.LayoutProps {}

const Image = styled.img<ImageProps>`
  display: block;
  width: 100%;
  ${compose(space, layout)}
`;

export default Image;
