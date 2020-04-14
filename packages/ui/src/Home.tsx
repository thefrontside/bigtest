import { Box, useStdout } from "ink";
import React from "react";
import { Focusable } from "./Focusable";
import { Text } from './Text';
import {
    // @ts-ignore
    useNavigate
  } from "react-router-dom";

export const Home = () => {
  const {
    stdout: { columns, rows }
  } = useStdout();
  const navigate = useNavigate();

  return (
    <Box height={rows} width={columns}>
      <Box flexDirection="column">
        <Text>Experiments</Text>
        <Focusable onEnter={() => navigate('/list-detail')}>
          <Text>ListDetail</Text>
        </Focusable>
        <Focusable onEnter={() => navigate('/run-test')}>
          <Text>Running Test</Text>
        </Focusable>
      </Box>
    </Box>
  );
};
