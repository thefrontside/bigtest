import React, { ReactNode } from "react";
import { render as inkRender, RenderOptions } from "ink";
import { Operation, fork } from "effection";
import { EffectionContext } from "./EffectionContext";

export function render(Component: ReactNode, options: RenderOptions): Operation {
  return fork(function* () {
    let effectionContext = yield ({ resume, context }) => resume(context.parent);

    let inkApp = inkRender(
      <EffectionContext.Provider value={effectionContext}>
        {Component}
      </EffectionContext.Provider>,
      {...options, exitOnCtrlC: false }
    );

    try {
      yield;
    } finally {
      inkApp.unmount();
    }
  })
};
