import { component, hook } from 'hydroactive';

const timer = hook(($, selector: string) => {
  // Runs whenever you call `timer()` (usually on hydration).
  const [ count, setCount ] = $.live(selector, Number);

  // First value is returned by `$.use()`.
  return [ count, () => {
    // Runs on hydration and reconnect.
    const id = setInterval(() => { setCount(count() + 1); }, 1_000);

    return () => {
      // Runs on disconnect.
      clearInterval(id);
    };
  }];
});

const CustomHook = component(($) => {
  // TODO: Passes typecheck?
  // timer($, $.hydrate('span'));

  const count = $.use(timer($, 'span'));

  $.effect(() => {
    console.log(`The \`custom-hook\` count is: ${count()}.`);
  });
});

customElements.define('custom-hook', CustomHook);

declare global {
  interface HTMLElementTagNameMap {
    'custom-hook': InstanceType<typeof CustomHook>;
  }
}
