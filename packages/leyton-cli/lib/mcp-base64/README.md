## mcp-base64

基于官方 `@modelcontextprotocol/sdk` 的 MCP 服务器，提供 base64 编码工具：
- `encodeBase64(text: string): string` - 纯函数工具
- `createMcpBase64Server()` - 创建 MCP 服务器实例
- `startMcpBase64Server()` - 启动 stdio 传输的 MCP 服务器

### 使用工具函数

```ts
import { encodeBase64 } from 'leyton-library';

const encoded = encodeBase64('hello'); // "aGVsbG8="
```

### 启动 MCP 服务器

```ts
import { startMcpBase64Server } from 'leyton-library';

(async () => {
  const { server, transport } = await startMcpBase64Server();
  // 服务器通过 stdio 运行，等待 MCP 客户端连接
})();
```

### MCP 工具

服务器提供 `base64_encode` 工具：

- **名称**: `base64_encode`
- **描述**: 将输入文本进行 Base64 编码
- **参数**: `{ text: string }`
- **返回**: 编码后的 base64 字符串

### 配置 MCP 客户端

在 MCP 客户端配置中添加：

```json
{
  "mcpServers": {
    "base64-server": {
      "command": "node",
      "args": ["path/to/your/server.js"]
    }
  }
}
```

