const { assign, entries } = Object;

const hasOwnProperty = (obj, prop) => {
  return Object.prototype.hasOwnProperty.call(obj, prop);
};

const assignStrict = (obj, ...rest) => {
  let props = assign({}, ...rest);

  for (let key in obj) {
    if (props[key] != null) {
      obj[key] = props[key];
    }
  }

  return obj;
};

export default function create(Type, props = {}) {
  let State = class extends Type {
    set(props) {
      if (!entries(props).every(([key, val]) => this[key] === val)) {
        return assignStrict(new State(), this, props);
      } else {
        return this;
      }
    }
  };

  let instance = assignStrict(new State(), props);

  if (hasOwnProperty(Type.prototype, 'initialize')) {
    instance = instance.initialize(props) || instance;
  }

  return instance;
}

export function update(array, index, fn) {
  if (index === -1) index = array.length;

  let item = array[index];
  let updated = fn && fn(item);

  if (item && !updated) {
    return array.slice(0, index)
      .concat(array.slice(index + 1));
  } else if (updated !== item) {
    return array.slice(0, index)
      .concat(updated, array.slice(index + 1));
  } else {
    return array;
  }
}
