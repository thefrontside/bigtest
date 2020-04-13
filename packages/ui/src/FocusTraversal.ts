import { FocusNode } from './FocusParentContext';

export interface Traversal {
  node: FocusNode;
  next(): Traversal;
  previous(): Traversal;
}

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

export class Forward implements Traversal {
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

export class Backward implements Traversal {
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
