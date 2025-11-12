import { isColor } from './index';

describe('isColor', () => {
  it('should return true for a valid color', () => {
    expect(isColor('#fff')).toBe(true);
    expect(isColor('#fffffg')).toBe(false);
    expect(isColor('white')).toBe(true);
    expect(isColor('rgba(0,0,0,0.5)')).toBe(true);
  });
});
