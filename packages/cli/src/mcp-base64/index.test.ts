import { describe, it, expect } from 'vitest';
import { encodeBase64, createMcpBase64Server } from './index';

describe('mcp-base64', () => {
  it('encodeBase64 works', () => {
    expect(encodeBase64('hello')).toBe('aGVsbG8=');
  });

  it('createMcpBase64Server creates server with base64_encode tool', async () => {
    const server = await createMcpBase64Server();
    expect(server).toBeDefined();
  });
});

