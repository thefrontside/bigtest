function parseQueryParams(params) {
  return params
    .replace(/^\?/, "")
    .split("&")
    .map((line) => line.split("=", 2).map(decodeURIComponent))
    .reduce((agg, [key, value]) => {
      agg[key] = value
      return agg
    }, {});
}

let testElement = document.getElementById('test-frame') as HTMLIFrameElement;

let { orchestrator } = parseQueryParams(location.search);

window.addEventListener("message", (message) => {
  console.log('[agent] received message:', message.data);
  testElement.contentWindow.postMessage('message from agent', '*');
});

if(orchestrator) {
  console.log('[agent] connecting to orchestrator at', orchestrator);
  let socket = new WebSocket(orchestrator);

  socket.addEventListener('open', () => {
    socket.send('websocket message from agent');
    console.log('[agent] socket connection established');
  });

  socket.addEventListener('message', function (event) {
    let message = JSON.parse(event.data)

    console.log('[agent] got message:', message);

    if(message.type === "open") {
      console.log('[agent] loading test app via', message.url);
      testElement.src = message.url;
      let scriptElement = document.createElement('script') as HTMLScriptElement;
      scriptElement.src = message.manifest;
      scriptElement.addEventListener('load', () => {
        console.log('[agent] loaded test manifest', __bigtestManifest);
      });
      document.body.appendChild(scriptElement);

    }
  });

  socket.addEventListener('close', () => {
    socket.send('websocket message from agent');
    console.log('[agent] socket connection closed');
  });
} else {
  throw new Error("no orchestrator URL given, please specify the URL of the orchestrator by setting the `orchestrator` query param");
}
