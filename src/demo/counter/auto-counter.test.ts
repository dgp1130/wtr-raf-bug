import './auto-counter.js';

function render({ count }: { count: number }) {
  const autoCounter = document.createElement('auto-counter');
  autoCounter.textContent = count.toString();
  return autoCounter;
}

describe('AutoCounter', () => {
  it('does not re-render on hydration', async () => {
    {
      console.log('First'); // DEBUG

      const el = render({ count: 5 });
      document.body.appendChild(el);
      await el.stable();
      el.remove();

      expect().nothing();
    }
  });

  it('updates the count every second', async () => {
    {
      console.log('Second'); // DEBUG

      const el = render({ count: 5 });
      document.body.appendChild(el);
      await el.stable();
      el.remove();

      expect().nothing();
    }
  });

  it('pauses the count while disconnected', async () => {
    {
      console.log('Third'); // DEBUG

      const el = render({ count: 5 });
      document.body.appendChild(el);
      el.remove(); // Load-bearing, must come before `el.stable()`.
      await el.stable();

      expect().nothing();
    }
  });

  it('resumes the count when reconnected', async () => {
    {
      console.log('Fourth'); // DEBUG

      const el = render({ count: 5 });
      document.body.appendChild(el);
      await el.stable();
      el.remove();

      expect().nothing();
    }
  });
});
