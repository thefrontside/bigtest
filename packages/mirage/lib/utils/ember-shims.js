
/**
  Returns true if the passed value is null or undefined. This avoids errors
  from JSLint complaining about use of ==, which can be technically
  confusing.
  ```javascript
  Ember.isNone();              // true
  Ember.isNone(null);          // true
  Ember.isNone(undefined);     // true
  Ember.isNone('');            // false
  Ember.isNone([]);            // false
  Ember.isNone(function() {}); // false
  ```
  @method isNone
  @for Ember
  @param {Object} obj Value to test
  @return {Boolean}
  @public
*/
export function isNone(obj) {
  return obj === null || obj === undefined;
}

/**
  Verifies that a value is `null` or an empty string, empty array,
  or empty function.
  Constrains the rules on `Ember.isNone` by returning true for empty
  string and empty arrays.
  ```javascript
  Ember.isEmpty();                // true
  Ember.isEmpty(null);            // true
  Ember.isEmpty(undefined);       // true
  Ember.isEmpty('');              // true
  Ember.isEmpty([]);              // true
  Ember.isEmpty({});              // false
  Ember.isEmpty('Adam Hawkins');  // false
  Ember.isEmpty([0,1,2]);         // false
  Ember.isEmpty('\n\t');          // false
  Ember.isEmpty('  ');            // false
  ```
  @method isEmpty
  @for Ember
  @param {Object} obj Value to test
  @return {Boolean}
  @public
*/
export function isEmpty(obj) {
  let none = isNone(obj);
  if (none) {
    return none;
  }

  if (typeof obj.size === 'number') {
    return !obj.size;
  }

  let objectType = typeof obj;

  if (typeof obj.length === 'number' && objectType !== 'function') {
    return !obj.length;
  }

  return false;
}

/**
  A value is blank if it is empty or a whitespace string.

  ```javascript
  Ember.isBlank();                // true
  Ember.isBlank(null);            // true
  Ember.isBlank(undefined);       // true
  Ember.isBlank('');              // true
  Ember.isBlank([]);              // true
  Ember.isBlank('\n\t');          // true
  Ember.isBlank('  ');            // true
  Ember.isBlank({});              // false
  Ember.isBlank('\n\t Hello');    // false
  Ember.isBlank('Hello world');   // false
  Ember.isBlank([1,2,3]);         // false
  ```

  @method isBlank
  @for Ember
  @param {Object} obj Value to test
  @return {Boolean}
  @since 1.5.0
  @public
*/
export function isBlank(obj) {
  return isEmpty(obj) || (typeof obj === 'string' && /\S/.test(obj) === false);
}

const TYPE_MAP = {
  '[object Boolean]': 'boolean',
  '[object Number]': 'number',
  '[object String]': 'string',
  '[object Function]': 'function',
  '[object Array]': 'array',
  '[object Date]': 'date',
  '[object RegExp]': 'regexp',
  '[object Object]': 'object',
  '[object FileList]': 'filelist'
};

const { toString } = Object.prototype;

/**
  Returns a consistent type for the passed object.
  Use this instead of the built-in `typeof` to get the type of an item.
  It will return the same result across all browsers and includes a bit
  more detail. Here is what will be returned:
      | Return Value  | Meaning                                              |
      |---------------|------------------------------------------------------|
      | 'string'      | String primitive or String object.                   |
      | 'number'      | Number primitive or Number object.                   |
      | 'boolean'     | Boolean primitive or Boolean object.                 |
      | 'null'        | Null value                                           |
      | 'undefined'   | Undefined value                                      |
      | 'function'    | A function                                           |
      | 'array'       | An instance of Array                                 |
      | 'regexp'      | An instance of RegExp                                |
      | 'date'        | An instance of Date                                  |
      | 'filelist'    | An instance of FileList                              |
      | 'class'       | An Ember class (created using Ember.Object.extend()) |
      | 'instance'    | An Ember object instance                             |
      | 'error'       | An instance of the Error object                      |
      | 'object'      | A JavaScript object not inheriting from Ember.Object |
  Examples:
  ```javascript
  Ember.typeOf();                       // 'undefined'
  Ember.typeOf(null);                   // 'null'
  Ember.typeOf(undefined);              // 'undefined'
  Ember.typeOf('michael');              // 'string'
  Ember.typeOf(new String('michael'));  // 'string'
  Ember.typeOf(101);                    // 'number'
  Ember.typeOf(new Number(101));        // 'number'
  Ember.typeOf(true);                   // 'boolean'
  Ember.typeOf(new Boolean(true));      // 'boolean'
  Ember.typeOf(Ember.A);                // 'function'
  Ember.typeOf([1, 2, 90]);             // 'array'
  Ember.typeOf(/abc/);                  // 'regexp'
  Ember.typeOf(new Date());             // 'date'
  Ember.typeOf(event.target.files);     // 'filelist'
  Ember.typeOf(Ember.Object.extend());  // 'class'
  Ember.typeOf(Ember.Object.create());  // 'instance'
  Ember.typeOf(new Error('teamocil'));  // 'error'
  // 'normal' JavaScript object
  Ember.typeOf({ a: 'b' });             // 'object'
  ```
  @method typeOf
  @for Ember
  @param {Object} item the item to check
  @return {String} the type
  @public
*/
export function typeOf(item) {
  if (item === null) { return 'null'; }
  if (item === undefined) { return 'undefined'; }
  let ret = TYPE_MAP[toString.call(item)] || 'object';

  if (ret === 'object') {
    if (item instanceof Error) {
      ret = 'error';
    } else if (item instanceof Date) {
      ret = 'date';
    }
  }

  return ret;
}
