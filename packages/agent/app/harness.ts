console.log("[harness] hello from harness");

window.parent.postMessage("message from harness", "*");
window.addEventListener("message", (message) => {
  console.log('[harness] received message:', message.data);
});
