const raf = requestAnimationFrame;
globalThis.requestAnimationFrame = function (...args: Parameters<typeof requestAnimationFrame>):
    ReturnType<typeof requestAnimationFrame> {
  const [ callback, ...rest ] = args;
  const handle = raf((...args) => {
    console.log(`callback - ${handle} @ ${new Date().getTime()}`);
    return callback(...args);
  }, ...rest);

  console.log(`requestAnimationFrame - ${handle} @ ${new Date().getTime()}`);
  return handle;
}

const caf = cancelAnimationFrame;
globalThis.cancelAnimationFrame = function (...args: Parameters<typeof cancelAnimationFrame>): ReturnType<typeof cancelAnimationFrame> {
  const [ handle ] = args;
  console.log(`cancelAnimationFrame - ${handle} @ ${new Date().getTime()}`);
  return caf(...args);
}
