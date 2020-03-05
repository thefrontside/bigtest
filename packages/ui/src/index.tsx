import React, { FC, useState, useContext, useEffect } from "react";
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
import { FocusParent } from "./components/FocusParent";

const Focusable = () => {
  let { children, setChildren } = useState([]);
  let parent = useContext(FocusParent);
  useEffect(() => {
    parent.addChild();
    return () => {
      parent.removeChild();
    };
  }, []);

  return (
    <FocusParent.Provider
      value={{
        addChild(node) {
          setChildren([...children, node]);
        },
        removeChild(node) {
          setChildren(children.filter(child => child != node));
        }
      }}
    ></FocusParent.Provider>
  );
};

const List: FC<{ width: number }> = ({ width }) => {
  const padding = 5;

  return (
    <Box flexDirection="column" padding={padding} width="50%">
      <Divider title={"Tests"} width={width - padding * 2} />
      {fixture.map(test => (
        <Text key={test.id}>{test.test}</Text>
      ))}
    </Box>
  );
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
    <MemoryRouter>
      <Routes>
        <Route path="/*" element={<Index />} />
      </Routes>
    </MemoryRouter>
  );
};

export default App;
