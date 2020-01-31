import { getDescriptors } from '../util/descriptors';

const {
  assign,
  defineProperties,
  entries,
  keys
} = Object;

export default function Store(state, middle) {
  let store = new (class Store {
    get state() { return state; }
  })();

  let wrap = fn => (...args) => {
    let next = (s, a) => fn.apply(s, a);

    if (middle) {
      state = middle(next, state, args);
    } else {
      state = next(state, args);
    }

    return store;
  };

  let descriptors = entries(getDescriptors(state))
    .reduce((descriptors, [key, prop]) => {
      // methods
      if (typeof prop.value === 'function' && key !== 'set') {
        return assign(descriptors, {
          [key]: { value: wrap(prop.value) }
        });
      // getters
      } else if (typeof prop.get === 'function' && key !== 'state') {
        return assign(descriptors, {
          [key]: { get: () => state[key] }
        });
      } else {
        return descriptors;
      }
    }, keys(state).reduce((descriptors, key) => {
      // enumerable properties
      if (key !== 'state') {
        return assign(descriptors, {
          [key]: { get: () => state[key] }
        });
      } else {
        return descriptors;
      }
    }, {}));

  return defineProperties(store, descriptors);
}
