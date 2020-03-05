import React from "react";
import { Text, Color, Box, useStdout } from "ink";
import { default as StyledBox } from "ink-box";

const App = ({ name }) => {
  const {
    stdout: { columns, rows }
  } = useStdout();

  return (
    <Box>
      <StyledBox>
        <Box height={rows} width={columns / 2}>
          <Text>
            Hello, <Color green>{name}</Color>
          </Text>
        </Box>
      </StyledBox>
      <StyledBox>
        <Box height={rows} width={columns / 2}>
          <Text>
            Hello, <Color green>{name}</Color>
          </Text>
        </Box>
      </StyledBox>
    </Box>
  );
};

export default App;
