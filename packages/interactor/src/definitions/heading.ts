import { createInteractor } from '../create-interactor';
import { isVisible } from 'element-is-visible';

const HeadingInteractor = createInteractor<HTMLHeadingElement>('heading')({
  selector: 'h1,h2,h3,h4,h5,h6',
  filters: {
    level: (element) => parseInt(element.tagName[1]),
    visible: { apply: isVisible, default: true },
  }
});

/**
 * Call this {@link InteractorConstructor} to initialize a heading {@link Interactor}.
 * The heading interactor can be used to assert on the state of headings on the page,
 * represented by the `h1` through `h6` tags.
 *
 * ## Example
 *
 * ``` typescript
 * await Heading('Welcome!').exists();
 * ```
 *
 * ## Filters
 *
 * - `level`: *number* – The level of the heading, for example, the level of `h3` is `3`.
 * - `visible`: *boolean* – Filter by visibility. Defaults to `true`. See {@link isVisible}.
 *
 * @category Interactor
 */
export const Heading = HeadingInteractor;
