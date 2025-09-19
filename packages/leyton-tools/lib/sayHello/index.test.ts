import { describe, it, expect, vi } from 'vitest';
import { sayHello } from './index';

describe('sayHello', () => {
  it('should log Hello', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    sayHello();
    expect(spy).toHaveBeenCalledWith('Hello');
    spy.mockRestore();
  });
});


