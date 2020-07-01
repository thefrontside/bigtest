import { interaction, Interaction } from './interaction';
import { bigtestGlobals } from '@bigtest/globals';

async function visit(path: string) {
  let appUrl = bigtestGlobals.appUrl;
  if(!appUrl) {
    throw new Error('no app url defined');
  }
  let testFrame = bigtestGlobals.testFrame;
  if(!testFrame) {
    throw new Error('no test frame defined');
  }

  let url = new URL(appUrl);
  url.pathname = path;
  testFrame.src = url.toString();
}

export const App = {
  load(): Interaction<void> {
    return interaction('loading the app', () => visit('/'));
  },
  visit(path: string): Interaction<void> {
    return interaction(`visiting ${JSON.stringify(path)}`, () => visit(path));
  }
}
