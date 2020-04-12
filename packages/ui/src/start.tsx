import React from "react";
import { App } from "./app";
import { main, Operation } from "effection";
import { render } from "./render";
import { KeyEventLoop, KeyEvents, CtrlC, KeyEvent } from './key-events';
import { Instance } from "ink";

main(function* start() {
  let stdin = process.stdin;

  let events = yield KeyEventLoop.create(stdin);

  yield KeyEvents.set(events);

  let app: Instance = yield render(<App />, { stdin });

  yield events.on(CtrlC);

}).catch(e => console.error(e));
