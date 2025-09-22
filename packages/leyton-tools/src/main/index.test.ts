import { describe, it, expect } from 'vitest';
import { setupCounter } from './index';

describe('setupCounter', () => {
  it('should attach click handler and update text', () => {
    const btn = { innerHTML: '', addEventListener: (e: string, cb: any) => cb() } as any as HTMLButtonElement;
    setupCounter(btn);
    expect(btn.innerHTML).toContain('count is');
  });
});

