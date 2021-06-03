import { once, Operation } from '../node_modules/effection';
import { TestImplementation } from '@bigtest/suite';
import { bigtestGlobals } from '@bigtest/globals';

export function* loadManifest(manifestUrl: string): Operation<TestImplementation> {
  let scriptElement = document.createElement('script') as HTMLScriptElement;
  scriptElement.src = manifestUrl;
  document.head.appendChild(scriptElement);

  yield once(scriptElement, 'load');

  return bigtestGlobals.manifest;
}
