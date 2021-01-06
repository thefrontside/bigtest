export function compile(pattern: unknown): (target: unknown) => boolean {
  return function matcher(target: unknown): boolean {
    if(pattern === undefined) {
      return true;
    } else if(Array.isArray(pattern)) {
      return Array.isArray(target) && pattern.every((value, index) => compile(value)(target[index]));
    } else if(typeof(pattern) === "object") {
      return typeof(target) === 'object' && pattern !== null && Object.entries(pattern).every(([key, value]) => compile(value)(target && (target as Record<string, unknown>)[key]));
    } else if(typeof(pattern) === "function") {
      return pattern(target);
    } else {
      return pattern === target;
    }
  };
}

export function any(type: unknown): (value: unknown) => boolean {
  if(type === "array") {
    return function anyMatcher(value: unknown) {
      return Array.isArray(value);
    };
  } else if(type) {
    return function anyMatcher(value: unknown) {
      return typeof(value) === type;
    };
  } else {
    return function anyMatcher() {
      return true;
    };
  }
}
