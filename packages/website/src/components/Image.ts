import styled from 'styled-components';
import StyledSystem, { compose, space, layout } from 'styled-system';

export interface PictureProps
  extends StyledSystem.SpaceProps,
  StyledSystem.LayoutProps {
  as?: React.ElementType;
}

const Picture = styled.img<PictureProps>`
  display: block;
  width: 100%;
  ${compose(space, layout)}
`;

export default Picture;
