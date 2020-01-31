import styled from 'styled-components';
import {
  compose,
  space,
  layout,
  flexbox,
} from 'styled-system';

const Box = styled.div`
  box-sizing: border-box;
  ${compose(
    space,
    layout,
    flexbox,
  )}
`;

export default Box;
