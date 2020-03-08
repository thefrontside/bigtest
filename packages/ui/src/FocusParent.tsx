import { createContext } from "react";
import { FocusNodeRef } from "./FocusManager";

export interface TreeNode {
  node: any;
  path: number[];
  children: {
    [key: number]: TreeNode;
  };
}

export class FocusNode {
  ref: FocusNodeRef;
  path: number[];
  currentIndex: number = 0;
  children: {
    [key: number]: FocusNode;
  } = {};

  constructor(path: number[], ref?: FocusNodeRef) {
    this.path = path;
    this.ref = ref;
  }

  addChild(ref: FocusNodeRef) {
    return (this.children[this.currentIndex] = new FocusNode(
      [...this.path, this.currentIndex++],
      ref
    ));
  }

  removeChild(ref: FocusNodeRef) {}
}

export const FocusParentContext = createContext<FocusNode>(null);
