import React from "react";
import App from "./index";
import { main } from "@bigtest/effection";
import { Operation } from "effection";
import { render } from "./render";

export function* UI(stdin: NodeJS.ReadStream): Operation {
  yield render(<App />, { stdin, exitOnCtrlC: false });
}

main(UI(process.stdin));


