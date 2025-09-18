import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
export declare function encodeBase64(input: string): string;
/**
 * 创建并启动一个 MCP 服务器，提供 base64 编码工具
 */
export declare function createMcpBase64Server(): Promise<Server<{
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
            progressToken?: string | number | undefined;
        } | undefined;
    } | undefined;
}, {
    method: string;
    params?: {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    } | undefined;
}, {
    [x: string]: unknown;
    _meta?: {
        [x: string]: unknown;
    } | undefined;
}>>;
/**
 * 启动 MCP 服务器（stdio 传输）
 */
export declare function startMcpBase64Server(): Promise<{
    server: Server<{
        method: string;
        params?: {
            [x: string]: unknown;
            _meta?: {
                [x: string]: unknown;
                progressToken?: string | number | undefined;
            } | undefined;
        } | undefined;
    }, {
        method: string;
        params?: {
            [x: string]: unknown;
            _meta?: {
                [x: string]: unknown;
            } | undefined;
        } | undefined;
    }, {
        [x: string]: unknown;
        _meta?: {
            [x: string]: unknown;
        } | undefined;
    }>;
    transport: StdioServerTransport;
}>;
declare const _default: {
    encodeBase64: typeof encodeBase64;
    createMcpBase64Server: typeof createMcpBase64Server;
    startMcpBase64Server: typeof startMcpBase64Server;
};
export default _default;
