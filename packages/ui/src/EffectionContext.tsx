import { createContext, useContext, useEffect } from "react";
import { Context, Operation, fork } from "effection";

export const EffectionContext = createContext<Context>(null);

export const useOperation = (operation: Operation) => {
  let effectionContext = useContext(EffectionContext);

  useEffect(() => {
    // @ts-ignore
    let childContext = effectionContext.spawn(fork(operation));

    return childContext.halt;
  }, []);
};
