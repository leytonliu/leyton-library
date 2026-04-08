export type DataType = 'boolean' | 'number' | 'string' | 'function' | 'array' | 'date' | 'regExp' | 'undefined' | 'null' | 'object' | 'promise';
export declare const typeOf: (obj: any) => DataType | undefined;
