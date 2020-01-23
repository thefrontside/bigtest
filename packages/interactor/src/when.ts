interface IOptions {
  timeout?: number;
  message?: string;
}
interface When {
  <Value>(effect: () => Promise<Value> | Value, options?: IOptions): Promise<Value>;
  timeout: number;
}

export const when: When = async function when<Value>(
  proc: () => Promise<Value> | Value,
  options: IOptions = {}
): Promise<Value> {
  return new Promise((resolve, reject) => {
    let error: Error;
    const intervalHandle = setInterval(async () => {
      let result: Value;

      try {
        result = await proc();
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
