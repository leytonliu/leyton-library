#!/usr/bin/env node

import { startMcpBase64Server } from '../dist/index.js';

async function main() {
  try {
    await startMcpBase64Server();
  } catch (error) {
    console.error('MCP 服务器启动失败:', error);
    process.exit(1);
  }
}

main();
