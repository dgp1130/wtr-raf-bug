import { component } from 'hydroactive';
import { unobserved } from 'hydroactive/signal.js';

const SafeCounter = component(($) => {
  const [ count, setCount ] = $.live('span', Number);

  // Same as before, but no memory leak!
  $.lifecycle(() => {
    // Run on hydration and reconnect.
    const id = setInterval(unobserved(() => {
      setCount(count() + 1);
    }), 1_000);

    // Run on disconnect.
    return () => { clearInterval(id); };
  });
});

customElements.define('safe-counter', SafeCounter);

declare global {
  interface HTMLElementTagNameMap {
    'safe-counter': InstanceType<typeof SafeCounter>;
  }
}