# Leyton Library Monorepo

## 项目结构

这个项目已经转换为monorepo结构，包含以下包：

```
leyton-library/
├── packages/                          # 子包目录
│   ├── leyton-cli/                     # CLI工具和MCP服务器
│   │   ├── lib/
│   │   │   ├── mcp-base64/             # MCP Base64 编码服务器
│   │   │   └── index.ts
│   │   ├── scripts/                    # CLI脚本
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── leyton-tools/                   # 核心工具函数
│   │   ├── lib/
│   │   │   ├── array/                  # 数组操作
│   │   │   ├── crypto/                 # 加密工具
│   │   │   ├── main/                   # DOM操作
│   │   │   ├── promise-queue/          # Promise队列
│   │   │   ├── sayHello/               # 基础工具
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   ├── leyton-const/                   # 常量和配置
│   │   ├── lib/
│   │   │   ├── version.ts              # 版本信息
│   │   │   ├── config.ts               # 配置常量
│   │   │   └── index.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vite.config.ts
│   └── leyton-miniprogram/             # 小程序工具
│       ├── lib/
│       │   ├── utils/                  # 小程序工具函数
│       │   ├── storage/                # 存储工具
│       │   ├── network/                # 网络请求
│       │   └── index.ts
│       ├── package.json
│       ├── tsconfig.json
│       └── vite.config.ts
├── scripts/                            # 通用脚本
├── package.json                        # 根包配置
├── pnpm-workspace.yaml                 # pnpm工作区配置
├── index.ts                            # 根入口文件（向后兼容）
└── README.md
```

## 包说明

### @leyton-library/tools
核心工具函数包，包含：
- **array**: 数组操作工具 (union, intersection)
- **crypto**: 端到端加密工具 (E2EEncryption, RSA-OAEP + AES-GCM)
- **main**: DOM操作工具 (setupCounter)
- **promise-queue**: Promise队列管理 (PromiseQueue)
- **sayHello**: 基础示例函数

### @leyton-library/cli
命令行工具和MCP服务器，包含：
- **mcp-base64**: MCP Base64编码服务器
- CLI脚本和工具

### @leyton-library/const
常量和配置包，包含：
- **version**: 版本信息常量
- **config**: 配置常量 (Registry, MCP, Crypto, Queue等)

### @leyton-library/miniprogram
小程序开发工具包，包含：
- **utils**: 小程序基础工具 (getSystemInfo, showToast, showModal等)
- **storage**: 本地存储工具 (setStorage, getStorage, removeStorage等)
- **network**: 网络请求工具 (request, get, post, uploadFile等)

## 开发命令

### 安装依赖
```bash
# 使用pnpm (推荐)
pnpm install

# 或使用npm
npm install
```

### 构建
```bash
# 构建所有包
pnpm run build

# 构建根包 (向后兼容)
pnpm run build:root

# 构建单个包
cd packages/leyton-tools
pnpm run build
```

### 测试
```bash
# 运行所有测试
pnpm run test

# 监听模式测试
pnpm run test:watch

# 测试单个包
cd packages/leyton-tools
pnpm run test
```

### 清理
```bash
pnpm run clean
```

## 使用方式

### 1. 使用根包 (向后兼容)
```typescript
// 保持原有用法
import { sayHello, PromiseQueue, E2EEncryption } from 'leyton-library';
```

### 2. 使用独立包 (推荐)
```typescript
// 使用特定功能包
import { PromiseQueue } from '@leyton-library/tools';
import { VERSION } from '@leyton-library/const';
import { showToast } from '@leyton-library/miniprogram';
import { encodeBase64 } from '@leyton-library/cli';
```

## 发布

### 发布所有包
```bash
pnpm run publish:all
```

### 发布单个包
```bash
cd packages/leyton-tools
npm publish
```

## Workspace依赖

- 包间依赖使用 `workspace:*` 协议
- 开发时自动链接到本地包
- 发布时会替换为实际版本号

## 工具链

- **包管理器**: pnpm (推荐) 或 npm
- **构建工具**: Vite + TypeScript
- **测试框架**: Vitest
- **工作区**: pnpm workspaces

## 迁移说明

从单体项目转换为monorepo，主要变更：
1. 代码按功能划分到不同包中
2. 根包保持向后兼容性
3. 新增小程序专用工具包
4. 改进了构建和测试流程
5. 支持独立发布各个功能包

## MCP服务器

MCP服务器功能保持不变：
```bash
# 启动MCP服务器
pnpm run mcp-server

# 或使用npx
npx leyton-library@latest mcp-server
```