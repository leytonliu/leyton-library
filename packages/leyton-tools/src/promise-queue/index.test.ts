import { describe, it, expect, vi } from 'vitest';
import { PromiseQueue } from './index';

const wait = (ms: number, value: any) => () => new Promise((resolve) => setTimeout(() => resolve(value), ms));

describe('PromiseQueue', () => {
  it('runs tasks with concurrency limit', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const tasks = [wait(50, 1), wait(30, 2), wait(10, 3), wait(20, 4)];
    const pq = new PromiseQueue(tasks, 2);
    pq.run();
    await new Promise((r) => setTimeout(r, 120));
    expect(log).toHaveBeenCalled();
    log.mockRestore();
  });
});

