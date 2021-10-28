import { bigtestGlobals } from '@bigtest/globals';
import { globals } from '@interactors/globals'

interface Interaction<T> extends Promise<T> {
  /**
   * Return a description of the interaction
   */
  description: string;
  /**
   * Perform the interaction
   */
  action: () => Promise<T>;
}

let visitCounter = 1;

/**
 * This function allows to go to different url of the app
 *
 * ```typescript
 * test('Test scenario')
 *   .step(visit('/'))
 *   .step(Button('Login').click())
 * ```
 */
export function visit(path = '/'): Interaction<void> {
  let promise: Promise<void>;
  let description = `visiting ${JSON.stringify(path)}`
  return {
      description,
      [Symbol.toStringTag]: `[interaction ${description}]`,
      action: globals.wrapAction(description, async () => {
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
      }, 'interaction'),
      then(onFulfill, onReject) {
        if(!promise) { promise = this.action(); }
        return promise.then(onFulfill, onReject);
      },
      catch(onReject) {
        if(!promise) { promise = this.action(); }
        return promise.catch(onReject);
      },
      finally(handler) {
        if(!promise) { promise = this.action(); }
        return promise.finally(handler);
      }
    };
}
