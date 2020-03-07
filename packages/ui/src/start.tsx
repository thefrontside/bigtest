import React from "react";
import App from "./index";
import { main, Operation } from "effection";
import { render } from "./render";
import { KeyEventLoop, KeyEvents, CtrlC, KeyEvent } from './key-events';

main(function* start() {
  let stdin = process.stdin;

  let events = yield KeyEventLoop.create(stdin);

  yield KeyEvents.set(events);

  yield render(<App />, { stdin });

  yield events.on(CtrlC);

}).catch(e => console.error(e));
