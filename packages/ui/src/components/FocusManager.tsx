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
import { useOperation } from "./EffectionContext";
import { KeyEventLoop, KeyEvent } from "../key-events";
import { useStdin } from "ink";

function* traverse(node: FocusNode) {
  yield node;

  for (let index in node.children) {
    let child = node.children[index];

    yield child;
  }
}

export const FocusManager = ({ children }) => {
  let [root] = useState<FocusNode>(() => new FocusNode([]));
  let { stdin } = useStdin();

  let [currentFocus, setCurrentFocus] = useState<FocusNode>(root);

  useOperation(function*() {
    let events: KeyEventLoop = yield KeyEventLoop.create(stdin);
    let traversal = traverse(root);

    while (true) {
      let { key, input }: KeyEvent = yield events.next();

      if (key.ctrl && input === "c") {
        //TODO: Why is this necessary?!?
        process.exit(0);
        return;
      }

      if (input === "i" && key.ctrl) {
        let { value: node, done } = traversal.next();

        if (done) {
          traversal = traverse(root);
          node = traversal.next().value;
        }
        console.log("tabbed to", node && node.path);
      }
    }
  });

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
    };
  }
};
