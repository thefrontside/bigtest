import React, { FC } from "react";
import {
MemoryRouter, Route,
  // @ts-ignore
  Routes
} from "react-router-dom";
import { ListDetail } from "./ListDetail";
import { FocusManager } from "./FocusManager";
import { Home } from "./Home";
import { RunTest } from './RunTest';

interface AppProps {
}

export const App: FC<AppProps> = ({}) => {
  return (
    <FocusManager>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/list-detail/*" element={<ListDetail />} />
          <Route path="/run-test" element={<RunTest />} />
        </Routes>
      </MemoryRouter>
    </FocusManager>
  );
};
