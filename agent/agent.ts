console.log('[agent] hello from agent');

let testElement = document.getElementById('test-frame') as HTMLIFrameElement;

testElement.src = 'http://localhost:4001';

window.addEventListener("message", (message) => {
  console.log('[agent] received message:', message.data);
  testElement.contentWindow.postMessage('message from agent', '*');
});

let socket = new WebSocket('ws://localhost:5001');

socket.addEventListener('open', () => {
  socket.send('websocket message from agent');
  console.log('[agent] socket connection established');
});

socket.addEventListener('message', function (event) {
  console.log('[agent] got message:', event.data);
});

socket.addEventListener('close', () => {
  socket.send('websocket message from agent');
  console.log('[agent] socket connection closed');
});
