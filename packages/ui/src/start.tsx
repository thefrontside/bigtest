import React from "react";
import { App } from "./app";
import { main } from "effection";
import { render } from "./render";
import { KeyEventLoop, KeyEvents, CtrlC } from './key-events';

main(function* start() {
  let stdin = process.stdin;

  let events = yield KeyEventLoop.create(stdin);

  yield KeyEvents.set(events);

  yield render(<App />, { stdin });

  yield events.on(CtrlC);

}).catch(e => console.error(e));
