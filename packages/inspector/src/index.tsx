import { StrictMode } from "react";
import { render } from "react-dom";
import { refresh } from "./actions";
import { App } from "./App";

import "./index.css";

declare global {
  interface Window {
    __BIGTEST_TOGGLE_INSPECTOR__: () => void;
  }
}

function addRoot() {
  let root = document.createElement("div");
  root.id = "bigtest-inspector";
  root.classList.add("bigtest-body", "fixed", "bottom-0", "left-0");
  root.style.zIndex = "10000";
  document.body.appendChild(root);
  return root;
}

let isOpen = false;
let interval: number | null = null;

window.__BIGTEST_TOGGLE_INSPECTOR__ = function renderBigTestInspector() {
  let root = document.getElementById("bigtest-inspector") ?? addRoot();

  if (isOpen) {
    if (interval) clearInterval(interval);
    isOpen = false;
    root.remove();
    return;
  }

  interval = setInterval(refresh, 500);
  isOpen = true;
  render(
    <StrictMode>
      <App />
    </StrictMode>,
    root
  );
};
