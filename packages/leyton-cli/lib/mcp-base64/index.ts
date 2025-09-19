import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

export function encodeBase64(input: string): string {
  return Buffer.from(input, 'utf-8').toString('base64');
}

/**
 * 创建并启动一个 MCP 服务器，提供 base64 编码工具
 */
export async function createMcpBase64Server() {
  const server = new Server(
    {
      name: 'base64-server',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 添加 base64 编码工具
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: 'base64_encode',
          description: '将输入文本进行 Base64 编码',
          inputSchema: {
            type: 'object',
            properties: {
              text: {
                type: 'string',
                description: '要编码的文本',
              },
            },
            required: ['text'],
          },
        },
      ],
    };
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === 'base64_encode') {
      const text = request.params.arguments?.text as string;
      if (!text) {
        throw new Error('缺少必需参数: text');
      }
      
      const encoded = encodeBase64(text);
      return {
        content: [
          {
            type: 'text',
            text: encoded,
          },
        ],
      };
    }
    
    throw new Error(`未知工具: ${request.params.name}`);
  });

  return server;
}

/**
 * 启动 MCP 服务器（stdio 传输）
 */
export async function startMcpBase64Server() {
  const server = await createMcpBase64Server();
  const transport = new StdioServerTransport();
  
  await server.connect(transport);
  console.log('MCP Base64 服务器已启动 (stdio)');
  
  return { server, transport };
}

export default { encodeBase64, createMcpBase64Server, startMcpBase64Server };

