export function findIFrame(id: string): HTMLIFrameElement {
  let element = document.getElementById(id);
  if (!element) {
    throw new Error(`CRITICAL: unabled to find iframe with id '${id}'`);
  }
  if (!(element instanceof HTMLIFrameElement)) {
    throw new Error(`CRITICAL: expected ${element} to be an <iframe> element`);
  }
  return element;
}
