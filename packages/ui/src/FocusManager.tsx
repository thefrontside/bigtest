import React, { useState, useMemo } from "react";

import { fork } from "effection";
import { Traversal, Forward } from "./FocusTraversal";
import { FocusParentContext, FocusNode } from "./FocusParentContext";
import { useOperation } from "./EffectionContext";
import { KeyEventLoop, KeyEvents, TAB, ShiftTAB } from "./key-events";

export const FocusManager = ({ children }) => {
  let [node] = useState<FocusNode>(() => new FocusNode([]));
  let [isFocused, setIsFocused] = useState(false);

  useOperation(function*() {
    let events: KeyEventLoop = yield KeyEvents.get();

    let traversal: Traversal = Forward.create(node);

    yield fork(function* advance() {
      while (true) {
        yield events.on(TAB);

        // clear current
        if (traversal.node.ref) {
          // console.log(`clear focus on ${traversal.node.path}`);
          traversal.node.ref.setIsFocused(false);
        }
        traversal = traversal.next();
        if (traversal.node.ref) {
          traversal.node.ref.setIsFocused(true);
          // console.log(`activate focus on ${traversal.node.path}`);
        }

        // console.log("tabbed to ", traversal.node && traversal.node.path)
      }
    });

    yield fork(function* retreat() {
      while (true) {
        yield events.on(ShiftTAB);

        // clear current
        if (traversal.node.ref) {
          traversal.node.ref.setIsFocused(false);
        }
        traversal = traversal.previous();
        if (traversal.node.ref) {
          traversal.node.ref.setIsFocused(true);
        }

        // console.log('reverse tabbed to ', traversal.node && traversal.node.path);
      }
    });
  });

  const value = useMemo(() => ({ isFocused, setIsFocused, node }), [
    isFocused,
    setIsFocused,
    node
  ]);

  return (
    <FocusParentContext.Provider value={value}>
      {children}
    </FocusParentContext.Provider>
  );
};
