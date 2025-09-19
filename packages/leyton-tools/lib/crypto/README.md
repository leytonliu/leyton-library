# Crypto Module

端到端加密模块，基于 Web Crypto API 实现 RSA-OAEP + AES-GCM 混合加密。

## 特性

- ✅ **混合加密**：结合 RSA 和 AES 的优势，安全且高效
- ✅ **标准算法**：使用 RSA-OAEP-256 和 AES-GCM-256
- ✅ **浏览器原生**：基于 Web Crypto API，无需外部依赖
- ✅ **TypeScript 支持**：完整的类型定义
- ✅ **简单易用**：提供高级封装类和低级函数
- ✅ **PEM 格式**：标准的密钥导入导出格式

## 快速开始

### 基础用法

```typescript
import { E2EEncryption } from 'leyton-library';

// 创建两个用户实例
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

### 从现有密钥创建实例

```typescript
import { E2EEncryption } from 'leyton-library';

const publicKey = '-----BEGIN PUBLIC KEY-----\n...';
const privateKey = '-----BEGIN PRIVATE KEY-----\n...';

const user = E2EEncryption.fromKeys(publicKey, privateKey);
```

### 低级 API

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

## API 文档

### 类：E2EEncryption

端到端加密的高级封装类。

#### 方法

- **`generateKeys(): Promise<ExportedKeyPair>`**
  生成新的 RSA 密钥对

- **`getPublicKey(): string`**
  获取公钥（PEM 格式）

- **`getPrivateKey(): string`**
  获取私钥（PEM 格式）

- **`encrypt(message: string, recipientPublicKey: string): Promise<SerializedEncryptedData>`**
  加密消息，发送给指定公钥的接收者

- **`decrypt(encryptedData: SerializedEncryptedData): Promise<string>`**
  解密接收到的消息

#### 静态方法

- **`E2EEncryption.fromKeys(publicKey: string, privateKey: string): E2EEncryption`**
  从现有密钥创建实例

### 函数

#### 密钥管理

- **`generateRSAKeyPair(): Promise<KeyPair>`**
  生成 RSA-OAEP 密钥对

- **`exportKeyPair(keyPair: KeyPair): Promise<ExportedKeyPair>`**
  导出密钥对为 PEM 格式

- **`importPublicKey(publicKeyPEM: string): Promise<CryptoKey>`**
  从 PEM 格式导入公钥

- **`importPrivateKey(privateKeyPEM: string): Promise<CryptoKey>`**
  从 PEM 格式导入私钥

#### 加密解密

- **`encryptData(data: string, publicKeyPEM: string): Promise<SerializedEncryptedData>`**
  使用混合加密算法加密数据

- **`decryptData(encryptedData: SerializedEncryptedData, privateKeyPEM: string): Promise<string>`**
  使用混合加密算法解密数据

### 类型定义

```typescript
interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

interface ExportedKeyPair {
  publicKey: string;  // PEM 格式
  privateKey: string; // PEM 格式
}

interface EncryptedData {
  encryptedAESKey: ArrayBuffer;
  encryptedData: ArrayBuffer;
  iv: ArrayBuffer;
}

interface SerializedEncryptedData {
  encryptedAESKey: string; // Base64 编码
  encryptedData: string;   // Base64 编码
  iv: string;              // Base64 编码
}
```

## 算法说明

### RSA-OAEP-256
- **用途**：加密 AES 密钥
- **密钥长度**：2048 位
- **哈希算法**：SHA-256
- **填充**：OAEP

### AES-GCM-256
- **用途**：加密实际数据
- **密钥长度**：256 位
- **模式**：GCM（认证加密）
- **IV 长度**：12 字节（推荐值）

### 加密流程

1. 生成随机 AES-256 密钥
2. 使用 AES-GCM 加密数据
3. 使用 RSA-OAEP 加密 AES 密钥
4. 返回加密的 AES 密钥、加密的数据和 IV

### 解密流程

1. 使用 RSA-OAEP 解密 AES 密钥
2. 使用 AES-GCM 和解密的密钥解密数据
3. 返回原始数据

## 安全特性

- **前向保密**：每次加密使用新的随机 AES 密钥
- **认证加密**：AES-GCM 提供完整性验证
- **标准算法**：使用经过验证的加密算法
- **安全随机**：使用 `crypto.getRandomValues()` 生成安全随机数

## 浏览器兼容性

该模块依赖 Web Crypto API，支持：
- Chrome 37+
- Firefox 34+
- Safari 7+
- Edge 12+

## 注意事项

1. **密钥管理**：私钥必须安全存储，不要暴露给第三方
2. **网络传输**：建议在 HTTPS 环境下使用
3. **密钥长度**：RSA 2048位在当前是安全的，但建议定期评估
4. **性能考虑**：大数据加密时，RSA 只用于密钥交换，实际数据用 AES 加密

## 错误处理

所有异步函数都会在出错时抛出异常，建议使用 try-catch 包装：

```typescript
try {
  const encrypted = await e2e.encrypt(message, publicKey);
  // 处理成功结果
} catch (error) {
  console.error('加密失败:', error.message);
  // 处理错误
}
```

## 示例：聊天应用

```typescript
import { E2EEncryption } from 'leyton-library';

class SecureChat {
  private encryption: E2EEncryption;
  
  constructor() {
    this.encryption = new E2EEncryption();
  }
  
  async init() {
    await this.encryption.generateKeys();
    return this.encryption.getPublicKey();
  }
  
  async sendMessage(message: string, recipientPublicKey: string) {
    const encrypted = await this.encryption.encrypt(message, recipientPublicKey);
    // 通过网络发送 encrypted
    return encrypted;
  }
  
  async receiveMessage(encryptedData: any) {
    const decrypted = await this.encryption.decrypt(encryptedData);
    return decrypted;
  }
}
```