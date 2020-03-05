import React, {
  FC,
  useState,
  useContext,
  useMemo,
  useRef,
  ReactNode,
  useEffect
} from "react";
import { FocusParentContext, FocusNode } from "./FocusParent";
import { lensPath, view, set, over } from "ramda";

export const FocusManager = ({ children }) => {
  let [root] = useState<FocusNode>(() => new FocusNode([]));

  return (
    <FocusParentContext.Provider value={root}>
      {children}
    </FocusParentContext.Provider>
  );
};

export interface FocusNodeRef {
  node: FocusNode;
  isFocused: boolean;
  setIsFocused: (value: boolean) => void;
}

export const Focusable: FC<{ children: ReactNode }> = ({ children }) => {
  let parent = useContext(FocusParentContext);

  let [isFocused, setIsFocused] = useState(false);

  let ref = useRef<FocusNodeRef>({ isFocused, setIsFocused, node: null });

  useEffect(() => {
    if (parent) {
      ref.current.node = parent.addChild(ref.current);
    } else {
      throw new Error(
        "Parent is not available in Focusable component. You need a FocusManager to provide the parent."
      );
    }
    return () => {
      if (parent) {
        parent.removeChild(ref.current);
      }
    };
  }, []);

  return (
    <FocusParentContext.Provider value={ref.current.node}>
      {children}
    </FocusParentContext.Provider>
  );
};

export const useFocus = () => {
  let node = useContext(FocusParentContext);
  if (node) {
    return node.ref;
  } else {
    return {
      isFocused: false
    }
  }
};
