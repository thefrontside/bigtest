import { createContext } from "react";
import { FocusNodeRef } from "./Focusable";

export class FocusNode {
  ref?: FocusNodeRef;
  children: FocusNode[] = [];

  constructor(ref?: FocusNodeRef) {
    this.ref = ref;
  }

  addChild(ref: FocusNodeRef) {
    let node = new FocusNode(ref);
    this.children.push(node);
    return node;
  }

  removeChild(ref: FocusNodeRef) {
    this.children = this.children.filter(n => n.ref === ref);
  }
}

export const FocusParentContext = createContext<FocusNodeRef>(null);
