import type { ReactElement } from 'react';
import { render as renderToDOM, unmountComponentAtNode } from 'react-dom';

function getCleanTestingRoot(): Element {
  let $root = document.getElementById('root');

  // if a root exists, unmount anything inside and remove it
  if ($root) {
    unmountComponentAtNode($root);
    $root.parentNode?.removeChild($root);
  }

  // create a brand new root element
  $root = document.createElement('div');
  $root.id = 'root';

  document.body.appendChild($root);

  return $root;
}

export function render(element: ReactElement): Promise<void> {
  return new Promise(resolve => {
    renderToDOM(element, getCleanTestingRoot(), resolve);
  });
}
