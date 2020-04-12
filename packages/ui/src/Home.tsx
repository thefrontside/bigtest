import { Box, Text, useStdout } from "ink";
import React from "react";
import { Focusable, useFocus } from "./FocusManager";

export const Home = () => {
  const {
    stdout: { columns, rows }
  } = useStdout();

  return (
    <Box height={rows} width={columns}>
      <Box flexDirection="column">
        <Text>Experiments</Text>
        <FocusText>ListDetail</FocusText>
        <FocusText>Running Test</FocusText>
      </Box>
    </Box>
  );
};

const FocusText = ({ children }) => {
  const { isFocused } = useFocus();

  return (
    <Focusable>
      <Text underline={isFocused}>{children}</Text>
    </Focusable>
  );
};
