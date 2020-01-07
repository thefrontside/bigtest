type WhenFunc = <Value>(
  effect: () => Promise<Value | undefined | null> | Value | undefined | null,
  timeout?: number
) => Promise<Value>;
type When = WhenFunc & { timeout: number };

export const when: When = async function when<Value>(
  effect: () => Promise<Value | undefined | null> | Value | undefined | null,
  timeout?: number
): Promise<Value> {
  let result: Value | undefined | null;
  let error: Error;

  return new Promise((resolve, reject) => {
    const intervalHandle = setInterval(async () => {
      try {
        result = await effect();

        if (result == null) {
          error = new Error('Result of convergence was nullish at timeout');
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
    }, timeout || when['timeout']);
  });
};

when.timeout = 1000;
