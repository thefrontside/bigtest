import styled from 'styled-components';
import Box from './Box';

const WarningBox = styled(Box)`
  background: #ffe9bf;
  width: 60%;
  padding: ${({ theme }) => theme.space.large} ${({ theme }) => theme.space.large}
    ${({ theme }) => theme.space.xSmall} ${({ theme }) => theme.space.large};
  margin-bottom: ${({ theme }) => theme.space.medium};
  border-radius: 4px;
`;

export const WarningBoxLink = styled.a`
  border-bottom: 1px dotted ${({ theme }) => theme.colors.bodyCopy};
`;

export default WarningBox;
