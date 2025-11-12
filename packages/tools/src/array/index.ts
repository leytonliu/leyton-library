// 求两个数组的并集和交集
export function union<T>(a: T[], b: T[]): T[] {
  const set = new Set([...a, ...b]);
  return Array.from(set);
}

export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

export default { union, intersection };

