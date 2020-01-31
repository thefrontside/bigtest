const { assign } = Object;

export default function defer() {
  let deferred = {};

  let promise = new Promise((resolve, reject) => {
    assign(deferred, { resolve, reject });
  });

  return assign(deferred, {
    then: promise.then.bind(promise)
  });
}
