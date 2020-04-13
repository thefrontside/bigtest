import React, {
  FC,
  useState,
  useContext,
  useRef,
  ReactNode,
  useEffect,
  useMemo
} from "react";
import { FocusParentContext, FocusNode } from "./FocusParentContext";

export const Focusable: FC<{ children: ReactNode }> = ({ children }) => {
  let parent = useContext(FocusParentContext);

  let [isFocused, setIsFocused] = useState(false);

  let ref = useRef<FocusNodeRef>({ isFocused, setIsFocused, node: null });

  ref.current.isFocused = isFocused;

  useEffect(() => {
    if (parent) {
      ref.current.node = parent.node.addChild(ref.current);
      // trigger a re-render
      // setIsFocused(isFocused);
    } else {
      throw new Error(
        "Parent is not available in Focusable component. You need a FocusManager to provide the parent."
      );
    }
    return () => {
      if (parent) {
        parent.node.removeChild(ref.current);
      }
    };
  }, []);

  const value = useMemo(() => ({ ...ref.current }), [
    ref.current.isFocused,
    ref.current.setIsFocused,
    ref.current.node
  ]);

  // console.log('value', value);

  return (
    <FocusParentContext.Provider value={value}>
      {children}
    </FocusParentContext.Provider>
  );
};

export const useFocus = () => {
  let node = useContext(FocusParentContext);
  console.log("called useFocus", node);
  if (node) {
    return node;
  } else {
    return {
      isFocused: false
    };
  }
};

export interface FocusNodeRef {
  node: FocusNode;
  isFocused: boolean;
  setIsFocused: (value: boolean) => void;
}
