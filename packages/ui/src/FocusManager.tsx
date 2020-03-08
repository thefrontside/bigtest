import React, {
  FC,
  useState,
  useContext,
  useMemo,
  useRef,
  ReactNode,
  useEffect
} from "react";

import { fork } from 'effection';
import { FocusParentContext, FocusNode } from "./FocusParent";
import { lensPath, view, set, over } from "ramda";
import { useOperation } from "./EffectionContext";
import { KeyEventLoop, KeyEvents, KeyEvent, TAB, ShiftTAB } from "./key-events";
import { useStdin } from "ink";

function* forward(node: FocusNode) {
  yield node;

  for (let index in node.children) {
    let child = node.children[index];

    yield* forward(child);
  }
}

function* reverse(node: FocusNode) {
  for (let index of Object.getOwnPropertyNames(node.children).reverse()) {
    let child = node.children[index];
    yield* reverse(child);
  }
  yield node;
}

class Forward implements Traversal {
  static create(root: FocusNode): Traversal {
    let iterator = forward(root);
    iterator.next();
    return new Forward(root, root, iterator);
  };

  constructor(
    private root: FocusNode,
    public node: FocusNode,
    private iterator: Iterator<FocusNode>
  ) {}

  next(): Traversal {
    let next = this.iterator.next();
    if (next.done) {
      return Forward.create(this.root);
    } else {
      return new Forward(this.root, next.value, this.iterator);
    }
  }

  previous(): Traversal {
    let iterator = reverse(this.root);
    for (let node of iterator) {
      if (node === this.node) {
        let current = iterator.next();
        return new Backward(this.root, current.value, iterator);
      }
    }
    throw new Error(`BUG: Could not find node for backwards focus traversal`);
  }
}

class Backward implements Traversal {
  constructor(
    private root: FocusNode,
    public node: FocusNode,
    private iterator: Iterator<FocusNode>
  ) {}

  next(): Traversal {
    let iterator = forward(this.root);
    for (let node of iterator) {
      if (node == this.node) {
        let current = iterator.next();
        return new Forward(this.root, current.value, iterator);
      }
    }
    throw new Error(`BUG: Could not find node for backwards focus traversal`);
  }

  previous(): Traversal {
    let next = this.iterator.next();
    if (next.done) {
      let iterator = reverse(this.root);
      let current = iterator.next();
      return new Backward(this.root, current.value, iterator);
    } else {
      return new Backward(this.root, next.value, this.iterator);
    }
  }
}

interface Traversal {
  node: FocusNode;
  next(): Traversal;
  previous(): Traversal;
}

export const FocusManager = ({ children }) => {
  let [root] = useState<FocusNode>(() => new FocusNode([]));
  let { stdin } = useStdin();

  let [currentFocus, setCurrentFocus] = useState<FocusNode>(root);

  useOperation(function*() {
    let events: KeyEventLoop = yield KeyEvents.get();

    let traversal: Traversal = Forward.create(root);

    yield fork(function* advance() {
      while (true) {
        yield events.on(TAB);

        traversal = traversal.next();

        console.log("tabbed to ", traversal.node && traversal.node.path)
      }
    });

    yield fork(function* retreat() {
      while (true) {
        yield events.on(ShiftTAB);

        traversal = traversal.previous();
        console.log('reverse tabbed to ', traversal.node && traversal.node.path);
      }
    });
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
