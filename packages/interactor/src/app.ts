import { interaction, Interaction } from './interaction';
import { bigtestGlobals } from '@bigtest/globals';

export const App = {
  visit(path = '/'): Interaction<void> {
    return interaction(`visiting ${JSON.stringify(path)}`, async () => {
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
    });
  }
}
