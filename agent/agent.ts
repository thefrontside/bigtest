console.log('[agent] hello from agent');

let testElement = document.getElementById('test-frame') as HTMLIFrameElement;

testElement.src = "http://localhost:4001";

window.addEventListener("message", (message) => {
  console.log('[agent] received message:', message.data);
  testElement.contentWindow.postMessage("message from agent", "*");
});
