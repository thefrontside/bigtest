import { createInteractor, focused, focus, blur } from '../index';
import { isVisible } from 'element-is-visible';

const HTMLInteractor = createInteractor<HTMLElement>('element')
  .selector('*')
  .filters({
    text: (element) => element.textContent,
    title: (element) => element.title,
    id: (element) => element.id,
    visible: { apply: isVisible, default: true },
    className: (element) => element.className,
    classList: (element) => Array.from(element.classList),
    focused
  })
  .actions({
    click: ({ perform }) => perform((element) => { element.click(); }),
    focus,
    blur
  })

/**
 * Use this {@link InteractorConstructor} as a base for creating interactors which
 * work with HTML elements. This provides some basic functionality which is convenient
 * for most HTML elements.
 *
 * ### Example
 *
 * ``` typescript
 * const Link = HTML.extend<HTMLLinkElement>('link')
 *   .selector('a[href]')
 *   .filters({
 *     href: (element) => element.href
 *   })
 * ```
 *
 * ### Filters
 *
 * - `classList`: *string[]* — Filter by the list of classes found in element's `className`
 * - `className`: *string* — Filter by element's `className`
 * - `title`: *string* – Filter by title
 * - `id`: *string* – Filter by id
 * - `text`: *string* –  Filter by the text content of this element.
 * - `visible`: *boolean* – Filter by visibility. Defaults to `true`. See {@link isVisible}.
 * - `focused`: *boolean* – Filter by whether the element is focused. See {@link focused}.
 *
 * ### Actions
 *
 * - `click()`: *{@link Interaction}* – Click on the element
 * - `focus()`: *{@link Interaction}* – Move focus to the element
 * - `blur()`: *{@link Interaction}* – Move focus away from the element
 *
 * @category Interactor
 */
export const HTML = HTMLInteractor;
