import React from "react";
import { Box, useStdout } from "ink";
import Divider from "ink-divider";

const App = () => {
  const {
    stdout: { columns, rows }
  } = useStdout();

  return (
    <Box height={rows} width={columns}>
      <Box flexDirection="column" padding={5} width="50%">
        <Divider title={"Tests"} />
      </Box>

      <Box padding={5} width="50%"></Box>
    </Box>
  );
};

export default App;
