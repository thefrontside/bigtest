import { interaction, Interaction } from './interaction';
import { bigtestGlobals } from '@bigtest/globals';
import { createInteractor } from './create-interactor';

let visitCounter = 1;

const PageInteractor = createInteractor('page')({
  selector: ':root',
  filters: {
    title: (element) => element.ownerDocument.title,
    url: (element) => {
      let url = new URL(element.ownerDocument.location.href);
      let search = new URLSearchParams(element.ownerDocument.location.search);
      search.delete('bigtest-interactor-page-number');
      url.search = search.toString();
      return url.toString();
    },
  },
});

const PageInteractorInstance = Object.assign(PageInteractor(), {
  visit(path = '/'): Interaction<void> {
    return interaction(`visiting ${JSON.stringify(path)}`, async () => {
      let appUrl = bigtestGlobals.appUrl;
      if(!appUrl) {
        throw new Error('no app url defined');
      }
      // eslint-disable-next-line prefer-let/prefer-let
      const testFrame = bigtestGlobals.testFrame;
      if(!testFrame) {
        throw new Error('no test frame defined');
      } else {
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
      }
    });
  }
});

/**
 * This {@link Interactor} can be used to assert on global properties of the
 * page. When using the BigTest test runner, it can also be used for
 * interacting with the page itself, for example through nagivation.
 *
 * ### Example
 *
 * ``` typescript
 * await Page.has({ title: 'Welcome to my app!' });
 * ```
 *
 * Navigation, for BigTest test runner only:
 *
 * ``` typescript
 * await Page.visit('/archive');
 * ```
 *
 * ### Filters
 *
 * - `title`: *string* – the title of the document
 * - `url`: *string* – the URL of the document
 *
 * ### Actions
 *
 * - `visit(path: string)`: *{@link Interaction}* – visit the given path in the test frame, BigTest runner only.
 *
 * @category Interactor
 */
export const Page = PageInteractorInstance;
