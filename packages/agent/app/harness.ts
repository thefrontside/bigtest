console.log("[harness] hello from harness");

window.parent.postMessage("message from harness", "*");
window.addEventListener("message", (message) => {
  console.log('[harness] received message:', message.data);
});

// TODO: actually use this!
function* loadManifest(manifestUrl) {
  let scriptElement = document.createElement('script') as HTMLScriptElement;
  scriptElement.src = manifestUrl;
  scriptElement.addEventListener('load', () => {
    console.log('[agent] loaded test manifest', __bigtestManifest);
  });
  document.body.appendChild(scriptElement);
}
