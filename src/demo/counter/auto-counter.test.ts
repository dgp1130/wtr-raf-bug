import { parseHtml } from 'hydroactive/testing.js';
import { AutoCounter } from './auto-counter.js';

describe('auto-counter', () => {
  beforeEach(() => { jasmine.clock().install(); });
  afterEach(() => { jasmine.clock().uninstall(); });

  afterEach(() => {
    console.log(`Cleaning up nodes - ${new Date().getTime()}`);
    for (const node of document.body.childNodes) node.remove();
  });

  function render({ count }: { count: number }) {
    return parseHtml(AutoCounter, `
      <auto-counter>
        <div>The current count is: <span>${count}</span>.</div>
      </auto-counter>
    `);
  }

  describe('AutoCounter', () => {
    it('does not re-render on hydration', async () => {
      console.log('start - does not re-render on hydration'); // DEBUG

      const el = render({ count: 5 });
      document.body.appendChild(el);

      console.log(`await el.stable(); - ${new Date().getTime()}`); // DEBUG
      await el.stable();

      expect(el.querySelector('span')!.textContent).toBe('5');
      console.log('end - does not re-render on hydration'); // DEBUG
    });

    xit('updates the count every second', async () => {
      const el = render({ count: 5 });
      document.body.appendChild(el);

      jasmine.clock().tick(1_000);
      await el.stable();

      expect(el.querySelector('span')!.textContent).toBe('6');
    });

    it('pauses the count while disconnected', async () => {
      console.log('start - pauses the count while disconnected'); // DEBUG

      const el = render({ count: 5 });

      document.body.appendChild(el);
      el.remove(); // Should pause timer.

      jasmine.clock().tick(1_000);
      await el.stable();

      // Should not have incremented.
      expect(el.querySelector('span')!.textContent).toBe('5');
      console.log('end - pauses the count while disconnected'); // DEBUG
    });

    xit('resumes the count when reconnected', async () => {
      const el = render({ count: 5 });

      document.body.appendChild(el);
      el.remove(); // Should pause timer.

      jasmine.clock().tick(3_000);

      document.body.appendChild(el); // Should resume timer.

      jasmine.clock().tick(1_000);
      await el.stable();

      // Should have incremented only once.
      expect(el.querySelector('span')!.textContent).toBe('6');
    });
  });
});
