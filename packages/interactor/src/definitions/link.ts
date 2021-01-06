import { createInteractor, perform, focused, focus, blur } from '../index';
import { isVisible } from 'element-is-visible';

const LinkInteractor = createInteractor<HTMLLinkElement>('link')({
  selector: 'a[href]',
  filters: {
    title: (element) => element.title,
    href: (element) => element.href,
    id: (element) => element.id,
    visible: { apply: isVisible, default: true },
    focused
  },
  actions: {
    click: perform((element) => { element.click() }),
    focus,
    blur
  },
});

/**
 * Call this {@link InteractorConstructor} to initialize a link {@link Interactor}.
 * The link interactor can be used to interact with links on the page and
 * to assert on their state.
 *
 * The link is located by its text.
 *
 * ### Example
 *
 * ``` typescript
 * await Link('Home').click();
 * await Link('Home').has({ href: '/' });
 * await Link({ id: 'home-link', href: '/' }).exists();
 * ```
 *
 * ### Filters
 *
 * - `title`: *string* – Filter by title
 * - `id`: *string* – Filter by id
 * - `href`: *string* – The value of the href attribute that the link points to
 * - `visible`: *boolean* – Filter by visibility. Defaults to `true`. See {@link isVisible}.
 * - `focused`: *boolean* – Filter by whether the link is focused. See {@link focused}.
 *
 * ### Actions
 *
 * - `click()`: *{@link Interaction}* – Click on the link
 * - `focus()`: *{@link Interaction}* – Focus the link
 * - `blur()`: *{@link Interaction}* – Blur the link
 *
 * @category Interactor
 */
export const Link = LinkInteractor;
