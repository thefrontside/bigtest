import React, { FC } from "react";
import { Box, Text, useStdout } from "ink";
import Divider from "ink-divider";
import {
  MemoryRouter,
  Route,
  // @ts-ignore
  Routes,
  // @ts-ignore
  useNavigate,
  useParams
} from "react-router-dom";
import fixture from "./fixture";
import { FocusManager, Focusable, useFocus } from "./FocusManager";

const List: FC<{ width: number }> = ({ width }) => {
  const padding = 5;

  return (
    <Box flexDirection="column" padding={padding} width="50%">
      <Divider title={"Tests"} width={width - padding * 2} />
      {fixture.map(test => (
        <Focusable key={test.id}>
          <ListItem test={test} />
        </Focusable>
      ))}
    </Box>
  );
};

const ListItem = ({ test }) => {
  const { isFocused } = useFocus();

  return <Text key={test.id}>{test.test}</Text>;
};

const Detail: FC<{ width: number }> = ({ width }) => {
  let { test_id } = useParams();
  let test = fixture.find(({ id }) => id === test_id);

  const padding = 5;

  return (
    <Box padding={padding} width="50%" flexDirection="column">
      <Divider title={test.test} width={width - padding * 2} />

      <Text>Showing: {test_id}</Text>
    </Box>
  );
};

const Index = () => {
  const {
    stdout: { columns, rows }
  } = useStdout();

  return (
    <Box height={rows} width={columns}>
      <List width={columns / 2} />

      <Routes>
        <Route path=":test_id" element={<Detail width={columns / 2} />} />
      </Routes>
    </Box>
  );
};

const App = () => {
  return (
    <FocusManager>
      <MemoryRouter>
        <Routes>
          <Route path="/*" element={<Index />} />
        </Routes>
      </MemoryRouter>
    </FocusManager>
  );
};

export default App;
