import React, { FC } from "react";
import {
MemoryRouter, Route,
  // @ts-ignore
  Routes
} from "react-router-dom";
import { ListDetail } from "./ListDetail";
import { FocusManager } from "./FocusManager";
import { Home } from "./Home";

interface AppProps {
}

export const App: FC<AppProps> = ({}) => {
  return (
    <FocusManager>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/detail-list/*" element={<ListDetail />} />
        </Routes>
      </MemoryRouter>
    </FocusManager>
  );
};
