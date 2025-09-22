// 求两个数组的并集和交集
export function union(a, b) {
    const set = new Set([...a, ...b]);
    return Array.from(set);
}
export function intersection(a, b) {
    const setB = new Set(b);
    return a.filter((x) => setB.has(x));
}
export default { union, intersection };
