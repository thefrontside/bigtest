const {
  assign,
  getOwnPropertyDescriptor,
  getOwnPropertyDescriptors,
  getPrototypeOf
} = Object;

/**
 * Checks for a descriptor on the provided object and it's prototype
 *
 * @private
 * @param {Object} obj - Object to lookup the descriptor
 * @param {String} prop - Property descriptor name
 * @returns {Boolean} true when the descriptor is found
 */
export function hasDescriptor(obj, prop) {
  let result = !!getOwnPropertyDescriptor(obj, prop);

  if (!result) {
    result = !!getOwnPropertyDescriptor(getPrototypeOf(obj), prop);
  }

  return result;
}

/**
 * Collects property descriptors from an instance and it's inherited
 * prototypes (not including the Object prototype)
 *
 * @private
 * @param {Object} obj - Object to collect property descriptors for
 * @returns {Object} own and inherited property descriptors
 */
export function getDescriptors(obj) {
  let proto = obj;
  let descr = {};

  while (proto && proto !== Object.prototype) {
    descr = assign({}, getOwnPropertyDescriptors(proto), descr);
    proto = getPrototypeOf(proto);
  }

  delete descr.constructor;
  return descr;
}
