import React from "react";
import { render } from "ink";
import App from "./index";

const { unmount } = render(<App />);

setTimeout(unmount, 30_000);
