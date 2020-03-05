import React from "react";
import { render } from "ink";
import App from "./index";
import { main } from "@bigtest/effection";

main(function*() {
  let { unmount } = render(<App />);
  try {
    yield;
  } finally {
    unmount();
  }
});
