/**
 * Run the given async callback and return a `Promise` which awaits the result
 * or throws an error if the callback takes longer than the provided timeout.
 */
export async function timeout<T>(ms: number, callback: () => Promise<T>):
    Promise<T> {
  return await Promise.race([
    (async () => {
      console.log(`start @ ${new Date().getTime()}`);

      await new Promise<void>((resolve) => {
        setTimeout(resolve, ms);
      });

      throw new Error(`FAILED: Timeout after ${ms} milliseconds @ ${
          new Date().getTime()}!`);
    })(),

    callback(),
  ]);
}
