import React, { ReactNode } from "react";
import { render as inkRender, RenderOptions } from "ink";
import { Operation, Controls } from "effection";
import { suspend, ensure } from '@bigtest/effection';
import { EffectionContext } from "./EffectionContext";

export function* render(Component: ReactNode, options: RenderOptions): Operation {
  let effectionContext = yield ({ resume, context }) => resume(context.parent);

  let inkApp = inkRender(
    <EffectionContext.Provider value={effectionContext}>
      {Component}
    </EffectionContext.Provider>,
    {...options, exitOnCtrlC: false }
  );

  // make sure ink app is unmounted when the operation that invoked render() exits
  yield suspend(ensure(() => {
    inkApp.unmount()
  }));
};
