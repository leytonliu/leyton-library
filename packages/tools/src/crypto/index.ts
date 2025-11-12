/**
 * 端到端加密模块
 * 使用 Web Crypto API 实现 RSA-OAEP + AES-GCM 混合加密
 */

export interface KeyPair {
  publicKey: CryptoKey;
  privateKey: CryptoKey;
}

export interface ExportedKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface EncryptedData {
  encryptedAESKey: ArrayBuffer;
  encryptedData: ArrayBuffer;
  iv: ArrayBuffer;
}

export interface SerializedEncryptedData {
  encryptedAESKey: string;
  encryptedData: string;
  iv: string;
}

/**
 * 生成 RSA 密钥对 (RSA-OAEP-256, 2048位)
 */
export async function generateRSAKeyPair(): Promise<KeyPair> {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    true, // 可导出
    ['encrypt', 'decrypt']
  );

  return keyPair as KeyPair;
}

/**
 * 导出 RSA 密钥对为 PEM 格式
 */
export async function exportKeyPair(keyPair: KeyPair): Promise<ExportedKeyPair> {
  const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
  const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);

  const publicKeyBase64 = arrayBufferToBase64(publicKeyBuffer);
  const privateKeyBase64 = arrayBufferToBase64(privateKeyBuffer);

  return {
    publicKey: `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64}\n-----END PUBLIC KEY-----`,
    privateKey: `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----`,
  };
}

/**
 * 从 PEM 格式导入 RSA 公钥
 */
export async function importPublicKey(publicKeyPEM: string): Promise<CryptoKey> {
  const publicKeyBase64 = publicKeyPEM
    .replace('-----BEGIN PUBLIC KEY-----', '')
    .replace('-----END PUBLIC KEY-----', '')
    .replace(/\s/g, '');
  
  const publicKeyBuffer = base64ToArrayBuffer(publicKeyBase64);

  return await crypto.subtle.importKey(
    'spki',
    publicKeyBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false, // 不可导出
    ['encrypt']
  );
}

/**
 * 从 PEM 格式导入 RSA 私钥
 */
export async function importPrivateKey(privateKeyPEM: string): Promise<CryptoKey> {
  const privateKeyBase64 = privateKeyPEM
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const privateKeyBuffer = base64ToArrayBuffer(privateKeyBase64);

  return await crypto.subtle.importKey(
    'pkcs8',
    privateKeyBuffer,
    {
      name: 'RSA-OAEP',
      hash: 'SHA-256',
    },
    false, // 不可导出
    ['decrypt']
  );
}

/**
 * 生成 AES-GCM 密钥 (256位)
 */
async function generateAESKey(): Promise<CryptoKey> {
  return await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: 256,
    },
    true, // 可导出
    ['encrypt', 'decrypt']
  );
}

/**
 * 使用 RSA 公钥加密数据（端到端加密）
 * @param data 要加密的数据
 * @param publicKeyPEM 接收方的 RSA 公钥（PEM格式）
 */
export async function encryptData(data: string, publicKeyPEM: string): Promise<SerializedEncryptedData> {
  // 1. 生成随机 AES 密钥
  const aesKey = await generateAESKey();
  
  // 2. 生成随机 IV
  const iv = crypto.getRandomValues(new Uint8Array(12)); // GCM 推荐 12 字节
  
  // 3. 使用 AES-GCM 加密数据
  const encodedData = new TextEncoder().encode(data);
  const encryptedData = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv,
    },
    aesKey,
    encodedData
  );
  
  // 4. 导出 AES 密钥
  const aesKeyBuffer = await crypto.subtle.exportKey('raw', aesKey);
  
  // 5. 使用 RSA 公钥加密 AES 密钥
  const publicKey = await importPublicKey(publicKeyPEM);
  const encryptedAESKey = await crypto.subtle.encrypt(
    {
      name: 'RSA-OAEP',
    },
    publicKey,
    aesKeyBuffer
  );

  // 6. 序列化为 base64 字符串
  return {
    encryptedAESKey: arrayBufferToBase64(encryptedAESKey),
    encryptedData: arrayBufferToBase64(encryptedData),
    iv: arrayBufferToBase64(iv.buffer),
  };
}

/**
 * 使用 RSA 私钥解密数据（端到端解密）
 * @param encryptedData 加密后的数据
 * @param privateKeyPEM 接收方的 RSA 私钥（PEM格式）
 */
export async function decryptData(
  encryptedData: SerializedEncryptedData, 
  privateKeyPEM: string
): Promise<string> {
  // 1. 反序列化数据
  const encryptedAESKeyBuffer = base64ToArrayBuffer(encryptedData.encryptedAESKey);
  const encryptedDataBuffer = base64ToArrayBuffer(encryptedData.encryptedData);
  const ivBuffer = base64ToArrayBuffer(encryptedData.iv);
  
  // 2. 使用 RSA 私钥解密 AES 密钥
  const privateKey = await importPrivateKey(privateKeyPEM);
  const aesKeyBuffer = await crypto.subtle.decrypt(
    {
      name: 'RSA-OAEP',
    },
    privateKey,
    encryptedAESKeyBuffer
  );
  
  // 3. 导入 AES 密钥
  const aesKey = await crypto.subtle.importKey(
    'raw',
    aesKeyBuffer,
    {
      name: 'AES-GCM',
    },
    false,
    ['decrypt']
  );
  
  // 4. 使用 AES-GCM 解密数据
  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv: ivBuffer,
    },
    aesKey,
    encryptedDataBuffer
  );
  
  // 5. 转换为字符串
  return new TextDecoder().decode(decryptedBuffer);
}

/**
 * 端到端加密类，提供更高级的封装
 */
export class E2EEncryption {
  private keyPair: KeyPair | null = null;
  private exportedKeyPair: ExportedKeyPair | null = null;

  /**
   * 生成密钥对
   */
  async generateKeys(): Promise<ExportedKeyPair> {
    this.keyPair = await generateRSAKeyPair();
    this.exportedKeyPair = await exportKeyPair(this.keyPair);
    return this.exportedKeyPair;
  }

  /**
   * 获取公钥
   */
  getPublicKey(): string {
    if (!this.exportedKeyPair) {
      throw new Error('请先调用 generateKeys() 生成密钥对');
    }
    return this.exportedKeyPair.publicKey;
  }

  /**
   * 获取私钥
   */
  getPrivateKey(): string {
    if (!this.exportedKeyPair) {
      throw new Error('请先调用 generateKeys() 生成密钥对');
    }
    return this.exportedKeyPair.privateKey;
  }

  /**
   * 加密消息（发送给其他人）
   * @param message 要加密的消息
   * @param recipientPublicKey 接收方的公钥
   */
  async encrypt(message: string, recipientPublicKey: string): Promise<SerializedEncryptedData> {
    return await encryptData(message, recipientPublicKey);
  }

  /**
   * 解密消息（接收来自其他人的消息）
   * @param encryptedData 加密的数据
   */
  async decrypt(encryptedData: SerializedEncryptedData): Promise<string> {
    if (!this.exportedKeyPair) {
      throw new Error('请先调用 generateKeys() 生成密钥对');
    }
    return await decryptData(encryptedData, this.exportedKeyPair.privateKey);
  }

  /**
   * 从密钥字符串创建实例
   */
  static fromKeys(publicKey: string, privateKey: string): E2EEncryption {
    const instance = new E2EEncryption();
    instance.exportedKeyPair = { publicKey, privateKey };
    return instance;
  }
}

// 工具函数

/**
 * ArrayBuffer 转 Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Base64 转 ArrayBuffer
 */
function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// 导出所有函数和类
export default {
  generateRSAKeyPair,
  exportKeyPair,
  importPublicKey,
  importPrivateKey,
  encryptData,
  decryptData,
  E2EEncryption,
};