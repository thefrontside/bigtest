import { useCallback, useRef } from "react";
import { end, refresh, start } from "../actions";

interface ActionButton {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  action: (...args: any[]) => Promise<any>;
}

export function ActionComponent({ name, action }: ActionButton): JSX.Element {
  let refs = Array.from({ length: action.length }).map(() => useRef<HTMLInputElement>(null));
  let handleAction = useCallback(async () => {
    start();
    try {
      await action(...refs.map((ref) => ref.current?.value));
    } catch (error) {
      throw error;
    } finally {
      refs
        .map((ref) => ref.current)
        .filter(Boolean)
        .forEach((el) => el && (el.value = ""));
      refresh()
      end();
    }
  }, [action]);

  return (
    <>
      <button
        className="rounded border-gray-500 border shadow outline-none focus:outline-none mr-2"
        onClick={handleAction}
      >
        <span className="m-1">{name}</span>
      </button>
      {refs.map((ref, index) => (
        <input className="mr-2" key={index} ref={ref} />
      ))}
    </>
  );
}
