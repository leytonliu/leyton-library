import { describe, it, expect } from 'vitest'
import { VERSION, PACKAGE_NAME, AUTHOR, LICENSE, NPM_REGISTRY, DEFAULT_PROMISE_QUEUE_CONCURRENCY } from './index'

describe('@leyton-library/const', () => {
  it('exports version constants correctly', () => {
    expect(VERSION).toBe('0.1.0')
    expect(PACKAGE_NAME).toBe('@leyton-library/const')
    expect(AUTHOR).toBe('leyton <895105616@qq.com>')
    expect(LICENSE).toBe('MIT')
  })

  it('exports configuration constants correctly', () => {
    expect(NPM_REGISTRY).toBe('https://registry.npmjs.org/')
    expect(DEFAULT_PROMISE_QUEUE_CONCURRENCY).toBe(2)
  })
})