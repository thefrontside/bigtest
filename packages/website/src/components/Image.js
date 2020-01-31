import styled from 'styled-components';
import {
  compose,
  space,
  layout
} from 'styled-system';

const Picture = styled.img`
  display: block;
  width: 100%;
  ${compose(
    space,
    layout
  )}
`;

export default Picture;
