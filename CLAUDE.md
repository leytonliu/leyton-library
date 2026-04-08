# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leyton Library is a TypeScript monorepo providing utility functions, UI components, and MCP (Model Context Protocol) server functionality. It targets both web and mini-program (WeChat, Alipay, etc.) environments through the uni-app framework.

## Architecture

### Monorepo Structure

```
packages/
├── tools/           # @leyton/tools - Core utility functions (array, crypto, promise-queue, DOM)
├── cli/             # @leyton/cli - MCP server and CLI tools
├── const/           # @leyton/const - Constants and configuration
├── miniprogram/     # @leyton/miniprogram - Mini-program utilities (storage, network, UI)
├── request/         # @leyton/request - Axios-based HTTP client with uni-app adapter
└── ui/              # @leyton/ui - Vue 3 UI components (Button, Dialog, Layout, Loading)

playgrounds/
└── uni-app-playground/  # Test environment for uni-app/multi-platform builds
```

### Package Interdependencies

- `@leyton/cli` depends on `@leyton/tools`
- `@leyton/miniprogram` depends on `@leyton/const` and `@leyton/tools`
- `@leyton/ui` depends on `@leyton/tools`
- Root package re-exports all packages for backward compatibility

### Build System

- **Package Manager**: pnpm with workspaces
- **Build Tool**: Vite + TypeScript
- **Test Framework**: Vitest
- **Module Format**: ESM with UMD fallback

Each package exports:
- `dist/index.js` - ESM build
- `dist/index.umd.cjs` - UMD build
- `types/index.d.ts` - TypeScript declarations

## Common Commands

### Development

```bash
# Install dependencies
pnpm install

# Start development server (root)
pnpm run dev

# Build all packages
pnpm run build

# Build root package only (backward compatibility)
pnpm run build:root
```

### Testing

```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Test a specific package
cd packages/tools && pnpm run test

# Run single test file
pnpm vitest run packages/tools/src/array/index.test.ts
```

### MCP Server

```bash
# Start MCP server locally
pnpm run mcp-server

# Via npx
npx leyton-library@latest mcp-server
```

### Publishing

```bash
# Version bump + build + publish all packages
pnpm run release:patch   # 7.0.x -> 7.0.x+1
pnpm run release:minor   # 7.0.x -> 7.1.0
pnpm run release:major   # 7.x.x -> 8.0.0

# Manual workflow (version-update.js updates all package.json files)
node scripts/version-update.js patch
```

### Cleaning

```bash
pnpm run clean  # Removes dist/, types/ across root and all packages
```

## Package-Specific Details

### @leyton/tools

Core utilities organized by function:
- `array/` - `union()`, `intersection()`
- `crypto/` - `E2EEncryption` class (RSA-OAEP + AES-GCM), low-level crypto functions
- `promise-queue/` - `PromiseQueue` class for concurrency control
- `main/` - `setupCounter()` DOM utility
- `sayHello/` - Simple greeting function
- `isColor/` - Color validation utilities

### @leyton/ui

Vue 3 components. Style imports are separate:
```typescript
import { Button, Dialog } from '@leyton/ui';
import '@leyton/ui/style';  // Required for styles
```

Note: `vue-tsc` is disabled in the build script due to issues; rely on IDE type checking.

### @leyton/request

HTTP client with dual environment support:
- Web: Standard axios
- Uni-app: Custom adapter using `uni.request`

Entry points auto-detect environment via `uni` global.

### @leyton/cli

MCP server providing `base64_encode` tool. Entry point at `scripts/mcp-server.js`.

## Testing Patterns

Tests are co-located with source files using `.test.ts` suffix:

```typescript
import { describe, it, expect } from 'vitest';
import { myFunction } from './index';

describe('feature', () => {
  it('should work', () => {
    expect(myFunction()).toBe(expected);
  });
});
```

Run single test: `pnpm vitest run packages/tools/src/array/index.test.ts`

## TypeScript Configuration

- Root `tsconfig.json`: Targets ES2022, DOM, DOM.Iterable
- Each package has its own `tsconfig.json` for declaration emit
- `skipLibCheck: true` for faster builds
- `isolatedModules: true` for Vite/esbuild compatibility

## Important Notes

- **Workspace Protocol**: Use `workspace:*` for inter-package dependencies; pnpm resolves these at publish time
- **Version Sync**: All packages share the same version number; `scripts/version-update.js` updates them together
- **Side Effects**: All packages set `sideEffects: false` for tree-shaking
- **Uni-app Playground**: Use for testing multi-platform builds (WeChat, Alipay, H5, etc.)
