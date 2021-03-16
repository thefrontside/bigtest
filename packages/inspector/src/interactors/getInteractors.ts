import {
  Button as BaseButton,
  CheckBox as BaseCheckBox,
  Heading as BaseHeading,
  InteractorConstructor,
  Link as BaseLink,
  MultiSelect as BaseMultiSelect,
  RadioButton as BaseRadioButton,
  Select as BaseSelect,
  TextField as BaseTextField,
} from "@bigtest/interactor";
import type { BaseInteractor } from "@bigtest/interactor/dist/specification";
import { finder } from "@medv/finder";
import { close, open } from "../actions";

export interface InteractableElement {
  element: Element;
  selector: string;
  locator?: string;
  actions: { [action: string]: (...args: any[]) => Promise<void> };
  props: { [prop: string]: any };
}

export interface ResolvedInteractor {
  constructor: InteractorConstructor<any, any, any>;
  elements: InteractableElement[];
}

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

let watchingElements = new Map<Element, { selector: string; openHandler: () => void; closeHandler: () => void }>();
const getExcludedContainers = () =>
  [document.getElementById("bigtest-inspector"), document.querySelector("body > .ace_editor")] as (Element | null)[];
let excludedContainers = getExcludedContainers();

const additionalFilters = {
  selector: (element: Element) =>
    watchingElements.get(element)?.selector ?? excludedContainers.every((container) => !container?.contains(element))
      ? finder(element)
      : undefined,
};

export const Button = BaseButton.extend("Button").filters(additionalFilters);
export const CheckBox = BaseCheckBox.extend("CheckBox").filters(additionalFilters);
export const Heading = BaseHeading.extend("Heading").filters(additionalFilters);
export const Link = BaseLink.extend("Link").filters(additionalFilters);
export const MultiSelect = BaseMultiSelect.extend("ButMultiSelectton").filters(additionalFilters);
export const RadioButton = BaseRadioButton.extend("RadioButton").filters(additionalFilters);
export const Select = BaseSelect.extend("Select").filters(additionalFilters);
export const TextField = BaseTextField.extend("TextField").filters(additionalFilters);

// TODO Mutation observer to call resolve Interactors
// TODO subscribe on active element or focus for each found element?

function wrapAction(action: (...args: any[]) => any, callback: (...args: any[]) => any) {
  switch (action.length) {
    case 1:
      return () => callback();
    case 2:
      return (arg1: any) => callback(arg1);
    case 3:
      return (arg1: any, arg2: any) => callback(arg1, arg2);
    case 4:
      return (arg1: any, arg2: any, arg3: any) => callback(arg1, arg2, arg3);
    case 5:
      return (arg1: any, arg2: any, arg3: any, arg4: any) => callback(arg1, arg2, arg3, arg4);
    default:
      return (...args: any[]) => callback(...args);
  }
}

async function resolveInteractor<T extends InteractorConstructor<any, any, any>>(
  constructor: T,
  resolveSelector: (element: Element) => string
): Promise<ResolvedInteractor> {
  const interactors = constructor.all() as BaseInteractor<Element, any>[];
  const entries = await Promise.all(
    interactors.map(async (interactor) => {
      let element = null;
      await interactor.perform((e) => (element = e));
      if (element == null) return null;
      return [interactor, element] as [BaseInteractor<Element, any>, Element];
    })
  );

  const elements = entries
    .filter(isDefined)
    .filter(([, element]) => excludedContainers.every((container) => !container?.contains(element)))
    .map(([interactor, element]) => {
      const { specification } = interactor.options;
      const { locator, filters, actions } = specification;
      return {
        element,
        selector: resolveSelector(element),
        locator: locator?.(element),
        actions: Object.fromEntries(
          Object.entries(actions).map(([name, action]) => [
            name,
            wrapAction(action as (...args: any[]) => any, (...args: any[]) =>
              new Promise((resolve) => setTimeout(resolve, 0)).then(() => (interactor as any)[name](...args))
            ),
          ])
        ),
        props: Object.fromEntries(
          Object.entries(filters).map(([filterKey, filter]) => [
            filterKey,
            typeof filter == "function" ? filter(element) : (filter as { apply(...args: any[]): any }).apply(element),
          ])
        ),
      };
    });

  return {
    constructor,
    elements,
  };
}

export async function getInteractors(): Promise<[string, ResolvedInteractor][]> {
  const newWatchingElements = new Map<
    Element,
    { selector: string; openHandler: () => void; closeHandler: () => void }
  >();

  const resolveSelector = (element: Element) => {
    const selector = finder(element);
    let { openHandler, closeHandler } = watchingElements.get(element) ?? {};

    if (openHandler) element.removeEventListener("mouseenter", openHandler);
    if (closeHandler) element.removeEventListener("mouseleave", closeHandler);

    element.addEventListener("mouseenter", (openHandler = () => open(selector)));
    element.addEventListener("mouseleave", (closeHandler = () => close()));

    newWatchingElements.set(element, { selector, openHandler, closeHandler });

    return selector;
  };
  excludedContainers = getExcludedContainers();

  const interactors = Object.entries({
    Button: await resolveInteractor(Button, resolveSelector),
    CheckBox: await resolveInteractor(CheckBox, resolveSelector),
    Heading: await resolveInteractor(Heading, resolveSelector),
    Link: await resolveInteractor(Link, resolveSelector),
    MultiSelect: await resolveInteractor(MultiSelect, resolveSelector),
    RadioButton: await resolveInteractor(RadioButton, resolveSelector),
    Select: await resolveInteractor(Select, resolveSelector),
    TextField: await resolveInteractor(TextField, resolveSelector),
  });

  watchingElements = newWatchingElements;

  return interactors;
}
