import { Operation } from 'effection';
import { TestImplementation } from '@bigtest/suite';
import { bigtestGlobals } from '@bigtest/globals';
import { once } from '@effection/events';

export function* loadManifest(manifestUrl: string): Operation<TestImplementation> {
  let scriptElement = document.createElement('script') as HTMLScriptElement;
  scriptElement.src = manifestUrl;
  document.head.appendChild(scriptElement);

  yield once(scriptElement, 'load');

  return bigtestGlobals.manifest;
}
