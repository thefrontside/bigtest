import { EmptyObject, InteractorBuilder, InteractorSpecification, InteractorConstructor, Filters, Actions } from './specification';
import { createConstructor } from './constructor';

/**
 * Create a custom interactor. Due to TypeScript inference issues, this creates an
 * {@link InteractorBuilder}, which you will need to create the actual
 * interactor. See {@link InteractorSpecification} for detailed breakdown of
 * available options for the builder.
 *
 * ### Creating a simple interactor
 *
 * ``` typescript
 * let Paragraph = createInteractor('paragraph')({ selector: 'p' });
 * ```
 *
 * Note the double function call!
 *
 * @param interactorName The human readable name of the interactor, used mainly for debugging purposes and error messages
 * @typeParam E The type of DOM Element that this interactor operates on. By specifying the element type, actions and filters defined for the interactor can be type checked against the actual element type.
 * @returns You will need to call the returned builder to create an interactor.
 */
export function createInteractor<E extends Element>(name: string): InteractorBuilder<E> {
  return function<F extends Filters<E> = EmptyObject, A extends Actions<E> = EmptyObject>(specification: InteractorSpecification<E, F, A>): InteractorConstructor<E, F, A> {
    return createConstructor(name, specification);
  }
}
