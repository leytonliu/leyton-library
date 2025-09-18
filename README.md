# leyton-library
[![npm version](https://img.shields.io/npm/v/leyton-library.svg)](https://www.npmjs.com/package/leyton-library)
[![npm downloads](https://img.shields.io/npm/dm/leyton-library.svg)](https://www.npmjs.com/package/leyton-library)


一个功能丰富的 TypeScript 工具库，提供多种实用工具和 MCP (Model Context Protocol) 服务器功能。

## 📦 安装

```bash
# 使用 npm
npm install leyton-library

# 使用 pnpm
pnpm add leyton-library

# 使用 yarn
yarn add leyton-library
```

## 🚀 快速开始

### 基础工具函数

```typescript
import { sayHello, setupCounter, PromiseQueue, union, intersection, encodeBase64, E2EEncryption } from 'leyton-library';

// 基础工具
sayHello(); // 输出: Hello

// DOM 操作
const button = document.querySelector('#counter') as HTMLButtonElement;
setupCounter(button);

// 数组操作
const arr1 = [1, 2, 3];
const arr2 = [2, 3, 4];
console.log(union(arr1, arr2)); // [1, 2, 3, 4]
console.log(intersection(arr1, arr2)); // [2, 3]

// Base64 编码
const encoded = encodeBase64('hello world'); // "aGVsbG8gd29ybGQ="

// Promise 队列
const queue = new PromiseQueue(2); // 最大并发数 2
queue.add(() => fetch('/api/data1'));
queue.add(() => fetch('/api/data2'));

// 端到端加密
const alice = new E2EEncryption();
const bob = new E2EEncryption();
await alice.generateKeys();
await bob.generateKeys();

const message = 'Hello, this is a secret message!';
const encrypted = await alice.encrypt(message, bob.getPublicKey());
const decrypted = await bob.decrypt(encrypted);
console.log(decrypted); // "Hello, this is a secret message!"
```

### MCP 服务器

启动 MCP Base64 编码服务器：

```bash
# 使用 npx（推荐）
npx leyton-library@latest mcp-server

# 或者使用特定版本
npx leyton-library@0.0.7 mcp-server
```

## 🛠️ 功能模块

### 1. sayHello
简单的问候函数，用于测试和演示。

```typescript
import { sayHello } from 'leyton-library';
sayHello(); // 输出: Hello
```

### 2. main (DOM 操作)
提供 DOM 元素操作功能，特别是计数器功能。

```typescript
import { setupCounter } from 'leyton-library';

const button = document.querySelector('#counter') as HTMLButtonElement;
setupCounter(button);
```

### 3. promise-queue
Promise 队列管理，支持并发控制。

```typescript
import { PromiseQueue } from 'leyton-library';

const queue = new PromiseQueue(2); // 最大并发数 2

// 添加任务
queue.add(async () => {
  const response = await fetch('/api/data');
  return response.json();
});

// 等待所有任务完成
const results = await queue.waitForAll();
```

### 4. array
数组操作工具函数。

```typescript
import { union, intersection } from 'leyton-library';

const arr1 = [1, 2, 3];
const arr2 = [2, 3, 4];

// 并集
const unionResult = union(arr1, arr2); // [1, 2, 3, 4]

// 交集
const intersectionResult = intersection(arr1, arr2); // [2, 3]
```

### 5. mcp-base64
MCP 服务器和 Base64 编码工具。

#### 工具函数
```typescript
import { encodeBase64 } from 'leyton-library';

const encoded = encodeBase64('hello world'); // "aGVsbG8gd29ybGQ="
```

#### MCP 服务器
```typescript
import { createMcpBase64Server, startMcpBase64Server } from 'leyton-library';

// 创建服务器
const server = await createMcpBase64Server();

// 启动服务器
const { server, transport } = await startMcpBase64Server();
```

### 6. crypto (端到端加密)
基于 Web Crypto API 实现的端到端加密模块，使用 RSA-OAEP + AES-GCM 混合加密。

#### 高级 API（推荐）
```typescript
import { E2EEncryption } from 'leyton-library';

// 创建两个用户
const alice = new E2EEncryption();
const bob = new E2EEncryption();

// 生成密钥对
await alice.generateKeys();
await bob.generateKeys();

// Alice 发送加密消息给 Bob
const message = 'Hello Bob, this is a secret message!';
const encrypted = await alice.encrypt(message, bob.getPublicKey());

// Bob 解密消息
const decrypted = await bob.decrypt(encrypted);
console.log(decrypted); // "Hello Bob, this is a secret message!"
```

#### 低级 API
```typescript
import { 
  generateRSAKeyPair, 
  exportKeyPair, 
  encryptData, 
  decryptData 
} from 'leyton-library';

// 生成密钥对
const keyPair = await generateRSAKeyPair();
const { publicKey, privateKey } = await exportKeyPair(keyPair);

// 加密数据
const message = 'Secret message';
const encrypted = await encryptData(message, publicKey);

// 解密数据
const decrypted = await decryptData(encrypted, privateKey);
```

#### 特性
- ✅ **混合加密**：RSA-OAEP-256 + AES-GCM-256
- ✅ **浏览器原生**：基于 Web Crypto API
- ✅ **认证加密**：AES-GCM 提供完整性验证
- ✅ **前向保密**：每次加密使用新的随机密钥
- ✅ **标准格式**：PEM 格式密钥导入导出

## 🔧 MCP 服务器配置

### Cursor 集成

在 Cursor 的 MCP 配置文件中添加：

```json
{
  "mcpServers": {
    "base64-server": {
      "command": "npx",
      "args": ["leyton-library@latest", "mcp-server"]
    }
  }
}
```

### 可用的 MCP 工具

- **base64_encode**: 将输入文本进行 Base64 编码
  - 参数: `{ text: string }`
  - 返回: 编码后的 base64 字符串

## 🧪 测试

```bash
# 运行测试
npm test

# 监听模式
npm run test:watch
```

## 📁 项目结构

```
leyton-library/
├── lib/                    # 源代码
│   ├── sayHello/          # 问候函数模块
│   ├── main/              # DOM 操作模块
│   ├── promise-queue/     # Promise 队列模块
│   ├── array/             # 数组工具模块
│   ├── mcp-base64/        # MCP Base64 模块
│   ├── crypto/            # 端到端加密模块
│   └── index.ts           # 主入口文件
├── scripts/               # 脚本文件
│   ├── mcp-server.js      # MCP 服务器启动脚本
│   ├── release.sh         # 发布脚本
│   └── check-node-version.js
├── dist/                  # 构建输出
├── types/                 # TypeScript 类型定义
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🚀 发布

使用内置的发布脚本：

```bash
npm run release
```

发布脚本会自动：
1. 更新版本号
2. 构建项目
3. 提交代码
4. 创建 Git 标签
5. 发布到 npm

## 📋 开发

```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 测试
npm test
```

## 🔗 相关链接

- [npm 包页面](https://www.npmjs.com/package/leyton-library)
- [GitHub 仓库](https://github.com/leytonliu/leyton-library)
- [MCP 协议文档](https://modelcontextprotocol.io/)

## 📄 许可证

MIT License

## 👨‍💻 作者

leyton <895105616@qq.com>
