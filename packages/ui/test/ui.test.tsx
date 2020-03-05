import chalk from "chalk";
import expect from "expect";
import { render } from "ink-testing-library";
import { describe, it, beforeEach } from "mocha";
import React from "react";
import App from "../src";

describe("ui", () => {
  let lastFrame;
  beforeEach(() => {
    let output = render(<App name="Jane" />);
    lastFrame = output.lastFrame;
  });
  it("greet user with a name", () => {
    expect(lastFrame()).toBe(chalk`Hello, {green Jane}`);
  });
});
