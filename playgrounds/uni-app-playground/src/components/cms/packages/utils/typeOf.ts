// 定义可能的类型字符串，提供更好的代码提示
export type DataType =
  | 'boolean'
  | 'number'
  | 'string'
  | 'function'
  | 'array'
  | 'date'
  | 'regExp'
  | 'undefined'
  | 'null'
  | 'object'
  | 'promise';

export const typeOf = (obj: any): DataType | undefined => {
  const toString = Object.prototype.toString;
  const map: Record<string, DataType> = {
    '[object Boolean]': 'boolean',
    '[object Number]': 'number',
    '[object String]': 'string',
    '[object Function]': 'function',
    '[object Array]': 'array',
    '[object Date]': 'date',
    '[object RegExp]': 'regExp',
    '[object Undefined]': 'undefined',
    '[object Null]': 'null',
    '[object Object]': 'object',
    '[object Promise]': 'promise',
  };

  const desc = toString.call(obj);
  return map[desc];
};
