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
export declare function generateRSAKeyPair(): Promise<KeyPair>;
/**
 * 导出 RSA 密钥对为 PEM 格式
 */
export declare function exportKeyPair(keyPair: KeyPair): Promise<ExportedKeyPair>;
/**
 * 从 PEM 格式导入 RSA 公钥
 */
export declare function importPublicKey(publicKeyPEM: string): Promise<CryptoKey>;
/**
 * 从 PEM 格式导入 RSA 私钥
 */
export declare function importPrivateKey(privateKeyPEM: string): Promise<CryptoKey>;
/**
 * 使用 RSA 公钥加密数据（端到端加密）
 * @param data 要加密的数据
 * @param publicKeyPEM 接收方的 RSA 公钥（PEM格式）
 */
export declare function encryptData(data: string, publicKeyPEM: string): Promise<SerializedEncryptedData>;
/**
 * 使用 RSA 私钥解密数据（端到端解密）
 * @param encryptedData 加密后的数据
 * @param privateKeyPEM 接收方的 RSA 私钥（PEM格式）
 */
export declare function decryptData(encryptedData: SerializedEncryptedData, privateKeyPEM: string): Promise<string>;
/**
 * 端到端加密类，提供更高级的封装
 */
export declare class E2EEncryption {
    private keyPair;
    private exportedKeyPair;
    /**
     * 生成密钥对
     */
    generateKeys(): Promise<ExportedKeyPair>;
    /**
     * 获取公钥
     */
    getPublicKey(): string;
    /**
     * 获取私钥
     */
    getPrivateKey(): string;
    /**
     * 加密消息（发送给其他人）
     * @param message 要加密的消息
     * @param recipientPublicKey 接收方的公钥
     */
    encrypt(message: string, recipientPublicKey: string): Promise<SerializedEncryptedData>;
    /**
     * 解密消息（接收来自其他人的消息）
     * @param encryptedData 加密的数据
     */
    decrypt(encryptedData: SerializedEncryptedData): Promise<string>;
    /**
     * 从密钥字符串创建实例
     */
    static fromKeys(publicKey: string, privateKey: string): E2EEncryption;
}
declare const _default: {
    generateRSAKeyPair: typeof generateRSAKeyPair;
    exportKeyPair: typeof exportKeyPair;
    importPublicKey: typeof importPublicKey;
    importPrivateKey: typeof importPrivateKey;
    encryptData: typeof encryptData;
    decryptData: typeof decryptData;
    E2EEncryption: typeof E2EEncryption;
};
export default _default;
