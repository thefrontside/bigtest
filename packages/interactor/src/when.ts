interface IOptions {
  timeout?: number;
  message?: string;
}
interface When {
  <Value>(
    effect: () => Promise<Value | undefined | null> | Value | undefined | null,
    options?: IOptions
  ): Promise<Value>;
  timeout: number;
}

export const when: When = async function when<Value>(
  effect: () => Promise<Value | undefined | null> | Value | undefined | null,
  options: IOptions = {}
): Promise<Value> {
  let result: Value | undefined | null;
  let error: Error;

  return new Promise((resolve, reject) => {
    const intervalHandle = setInterval(async () => {
      try {
        result = await effect();

        if (result == null) {
          error = new Error(options.message || 'Result of `when()` was nullish at timeout');
          return;
        }
      } catch (e) {
        error = e;
        return;
      }

      clearTimeout(timeoutHandle);
      clearInterval(intervalHandle);
      resolve(result);
    }, 10);

    const timeoutHandle = setTimeout(() => {
      clearInterval(intervalHandle);
      reject(error);
    }, options.timeout || when['timeout']);
  });
};

when.timeout = 1000;
