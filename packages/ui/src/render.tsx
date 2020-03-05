import React, { ReactNode } from "react";
import { render as inkRender, RenderOptions } from "ink";
import { Operation, Controls } from "effection";
import { EffectionContext } from "./components/EffectionContext";

export function render(
  Component: ReactNode,
  options: RenderOptions
): Operation {
  return (controls: Controls) => {
    let effectionContext = controls.context.parent;
    let inkApp = inkRender(
      <EffectionContext.Provider value={effectionContext}>
        {Component}
      </EffectionContext.Provider>,
      options
    );
    // @ts-ignore
    effectionContext.ensure(inkApp.unmount);
    controls.resume(inkApp);
  };
}
