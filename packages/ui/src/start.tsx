import React, { ReactNode } from "react";
import { render as inkRender } from "ink";
import App from "./index";
import { main } from "@bigtest/effection";
import { Operation, Controls } from "effection";
import { EffectionContext } from "./components/EffectionContext";

main(function*() {
  yield render(<App />);
  yield;
});

function render(Component: ReactNode): Operation {
  return (controls: Controls) => {
    let effectionContext = controls.context.parent;
    let inkApp = inkRender(
      <EffectionContext.Provider value={effectionContext}>
        {Component}
      </EffectionContext.Provider>
    );

    // @ts-ignore
    effectionContext.ensure(inkApp.unmount);
    controls.resume(inkApp);
  };
}
