import type { ResolvedInteractor } from "./getInteractors";
import { HighlightElement } from "./HighlightElement";
import { Interactor } from "./Interactor";

interface InspectorView {
  interactors: [string, ResolvedInteractor][];
}

export function InspectorView({ interactors }: InspectorView) {
  return (
    <>
      <HighlightElement />
      {interactors
        .filter(([, { elements }]) => elements.length)
        .map(([name, { elements }]) => (
          <Interactor key={name} name={name} elements={elements} />
        ))}
    </>
  );
}
