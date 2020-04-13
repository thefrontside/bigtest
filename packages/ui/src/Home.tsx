import { Box, useStdout } from "ink";
import React from "react";
import { Focusable } from "./Focusable";
import { Text } from './Text';

export const Home = () => {
  const {
    stdout: { columns, rows }
  } = useStdout();

  return (
    <Box height={rows} width={columns}>
      <Box flexDirection="column">
        <Text>Experiments</Text>
        <Focusable>
          <Text>ListDetail</Text>
        </Focusable>
        <Focusable>
          <Text>Running Test</Text>
        </Focusable>
      </Box>
    </Box>
  );
};
