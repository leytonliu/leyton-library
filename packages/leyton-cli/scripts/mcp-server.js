#!/usr/bin/env node

import { createMcpBase64Server } from '../dist/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

async function main() {
  try {
    const server = await createMcpBase64Server();
    const transport = new StdioServerTransport();
    
    await server.connect(transport);
    console.log('MCP Base64 服务器已启动 (stdio)');
  } catch (error) {
    console.error('MCP 服务器启动失败:', error);
    process.exit(1);
  }
}

main();
