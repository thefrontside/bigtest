import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { $selector, highlight, unhighlight } from "../actions";
import { ActionComponent } from "./ActionButton";
import type { InteractableElement } from "./getInteractors";

export interface ElementViewProps extends InteractableElement {
  isHighlighted: boolean;
}

export function ElementView({ element, selector, locator, actions, props, isHighlighted }: ElementViewProps) {
  const [isOpen, setOpen] = useState(false);

  const detailsRef = useRef<HTMLElement>(null);

  const toggle = useCallback((event: MouseEvent<HTMLElement, globalThis.MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen((x) => !x);
  }, []);

  const mouseEnterHandler = useCallback(() => highlight(element), [element]);
  const mouseLeaveHandler = useCallback(() => unhighlight(), []);

  const plainActions = Object.entries(actions).filter(([, action]) => action.length == 0);
  const complexActions = Object.entries(actions).filter(([, action]) => action.length != 0);

  useEffect(() => {
    if (isHighlighted) {
      detailsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isHighlighted]);

  return (
    <details
      ref={detailsRef}
      className="ml-2"
      open={isOpen || isHighlighted}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      <summary className="outline-none cursor-pointer" onClick={toggle}>
        Locator: {locator ? `"${locator}" (${selector})` : selector}
      </summary>
      {plainActions.length > 0 ? (
        <div className="flex m-2 ml-4">
          {plainActions.map(([actionName, action]) => (
            <ActionComponent key={actionName} name={actionName} action={action} />
          ))}
        </div>
      ) : null}
      {complexActions.length > 0 ? (
        <div className="flex m-2 ml-4 flex-col">
          {complexActions.map(([actionName, action]) => (
            <div key={actionName} className="mb-2 border border-t border-gray-500">
              <ActionComponent name={actionName} action={action} />
            </div>
          ))}
        </div>
      ) : null}
      <div className="bg-gray-300 m-2 ml-4 w-max">
        <code className="bigtest-code whitespace-pre overflow-x-auto p-2">{JSON.stringify(props, null, 2)}</code>
      </div>
    </details>
  );
}
