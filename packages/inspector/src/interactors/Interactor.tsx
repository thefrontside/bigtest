import { useStore } from "effector-react";
import { MouseEvent, useCallback, useState } from "react";
import { $selector } from "../actions";
import type { InteractableElement } from "./getInteractors";
import { ElementView } from "./ElementView";

interface InteractorProps {
  name: string;
  elements: InteractableElement[];
}

export function Interactor({ name, elements }: InteractorProps): JSX.Element {
  let selector = useStore($selector);

  let [isOpen, setOpen] = useState(true);

  let toggle = useCallback((event: MouseEvent<HTMLElement, globalThis.MouseEvent>) => {
    event.preventDefault();
    event.stopPropagation();
    setOpen((x) => !x);
  }, []);

  return (
    <details open={isOpen}>
      <summary className="outline-none cursor-pointer" onClick={toggle}>
        Interactor: {name} ({elements.length} elements)
      </summary>
      {elements.map((props) => (
        <ElementView key={props.selector} {...props} isHighlighted={props.selector == selector} />
      ))}
      <hr />
    </details>
  );
}
