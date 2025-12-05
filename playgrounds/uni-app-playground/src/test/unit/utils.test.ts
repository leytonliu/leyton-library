import { describe, it, expect } from 'vitest';
import { 
  kebabCase, 
  convertStyleToString, 
  getFirstDefinedValue 
} from '../../components/cms/packages/utils/utils';

describe('CMS Utils', () => {
  
  describe('kebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(kebabCase('backgroundColor')).toBe('background-color');
      expect(kebabCase('fontSize')).toBe('font-size');
    });

    it('should handle PascalCase', () => {
      expect(kebabCase('WebkitTransform')).toBe('-webkit-transform');
    });

    it('should not change existing kebab-case', () => {
      expect(kebabCase('text-align')).toBe('text-align');
    });
  });

  describe('convertStyleToString', () => {
    it('should convert style object to string', () => {
      const style = {
        color: 'red',
        fontSize: '14px',
        marginTop: '10px'
      };
      const result = convertStyleToString(style);
      // 顺序可能不固定，但内容必须包含
      expect(result).toContain('color:red');
      expect(result).toContain('font-size:14px');
      expect(result).toContain('margin-top:10px');
    });

    it('should ignore null or undefined values', () => {
      const style = {
        color: 'red',
        height: undefined,
        width: null
      } as any;
      expect(convertStyleToString(style)).toBe('color:red');
    });

    it('should handle numeric values', () => {
      // 注意：虽然 CSS 通常需要单位，但某些库可能允许数字
      // 根据 utils.ts 的逻辑，它会直接转为 string
      const style = {
        opacity: 0.5,
        zIndex: 100
      };
      expect(convertStyleToString(style)).toContain('opacity:0.5');
      expect(convertStyleToString(style)).toContain('z-index:100');
    });
    
    it('should return string as is if input is string', () => {
        expect(convertStyleToString('color:red')).toBe('color:red');
    });
  });

  describe('getFirstDefinedValue', () => {
    it('should return the first non-null non-undefined value', () => {
      expect(getFirstDefinedValue(undefined, null, 'hello', 'world')).toBe('hello');
      expect(getFirstDefinedValue(null, 0, 1)).toBe(0);
      expect(getFirstDefinedValue(false, true)).toBe(false);
    });

    it('should return undefined if all are null/undefined', () => {
      expect(getFirstDefinedValue(undefined, null)).toBeUndefined();
    });
  });
});
