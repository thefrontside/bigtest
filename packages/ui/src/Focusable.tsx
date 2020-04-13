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

interface FocusableProps {
  children: ReactNode
  onEnter?: () => void
}

export const Focusable: FC<FocusableProps> = ({ children, onEnter }) => {
  let parent = useContext(FocusParentContext);

  let [isFocused, setIsFocused] = useState(false);

  let ref = useRef<FocusNodeRef>({ isFocused, setIsFocused, node: null });

  ref.current.isFocused = isFocused;
  ref.current.onEnter = onEnter;

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
  onEnter?: () => void;
}
