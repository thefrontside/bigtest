import { bigtestGlobals } from '@bigtest/globals';
import { globals } from '@interactors/globals'
import { Step } from '@bigtest/suite';

let visitCounter = 1;

export function visit(path = '/'): Step {
  return globals.wrapInteraction(
    {
      description: `visiting ${JSON.stringify(path)}`,
      action: async () => {
        // eslint-disable-next-line prefer-let/prefer-let
        const { appUrl, testFrame } = bigtestGlobals;

        if(!appUrl) throw new Error('no app url defined');
        if(!testFrame) throw new Error('no test frame defined');

        let url = new URL(appUrl);
        let [pathname = '', hash = ''] = path.split('#');
        url.pathname = pathname;
        url.hash = hash;
        url.searchParams.set('bigtest-interactor-page-number', String(visitCounter));
        visitCounter += 1;
        testFrame.src = url.toString();
        await new Promise<void>((resolve, reject) => {
          let listener = () => {
            clearTimeout(timeout);
            testFrame.removeEventListener('load', listener);
            resolve();
          }
          testFrame.addEventListener('load', listener);
          let timeout = setTimeout(() => {
            clearTimeout(timeout);
            testFrame.removeEventListener('load', listener);
            reject(new Error('timed out trying to load application'));
          }, bigtestGlobals.defaultAppTimeout);
        });
      },
    }
  );
}
