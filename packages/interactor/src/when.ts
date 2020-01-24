interface IOptions {
  timeout?: number;
  message?: string;
}
interface When {
  <Value>(effect: () => Promise<Value> | Value, options?: IOptions): Promise<Value>;
  timeout: number;
}

function elapsedSince(start: number) {
  return Date.now() - start;
}

export const when: When = async function when<Value>(
  proc: () => Promise<Value> | Value,
  { timeout = when.timeout }: IOptions = { timeout: when.timeout }
): Promise<Value> {
  let start = Date.now();
  let success = false;
  let result: Value;
  let error: Error;

  async function attempt() {
    if (elapsedSince(start) >= timeout) {
      return;
    }

    try {
      result = await proc();
      success = true;
    } catch (e) {
      error = e;
      await new Promise(resolve => {
        setTimeout(async () => {
          await attempt();
          resolve();
        }, 10);
      });
    }
  }

  await attempt();

  if (success) {
    return result!;
  }

  throw error!;
};

when.timeout = 1000;
