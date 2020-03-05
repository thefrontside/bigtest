import React, { ReactNode } from "react";
import { render as inkRender } from "ink";
import App from "./index";
import { main } from "@bigtest/effection";
import { Operation, Controls, timeout } from "effection";
import { EffectionContext } from "./components/EffectionContext";
import { KeyEventLoop, KeyEvent } from './key-events';

export function* UI(stdin: NodeJS.ReadStream): Operation {

  /* yield render(<App />);*/

  yield function*() {
    let events: KeyEventLoop = yield KeyEventLoop.create(stdin);

    while (true) {
      let { key, input }: KeyEvent = yield events.next();
      if (key.ctrl && input === 'c') {
        //TODO: Why is this necessary?!?
        process.exit(0);
        return;
      }
      if (input === "\t") {
        console.log("TAB");
      }
      console.log('input', `'${input}'`);
      console.log('key', key);
    }
  };
}

main(UI(process.stdin));

function render(Component: ReactNode): Operation {
  return (controls: Controls) => {
    let effectionContext = controls.context.parent;
    let inkApp = inkRender(
      <EffectionContext.Provider value={effectionContext}>
        {Component}
      </EffectionContext.Provider>
    , { exitOnCtrlC: false });

    // @ts-ignore
    effectionContext.ensure(inkApp.unmount);
    controls.resume(inkApp);
  };
}
