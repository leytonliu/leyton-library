/**
 * 非空数据
 * @author  韦胜健
 * @date    2022/9/20 9:36
 */
export function notNullValue(...args) {
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg != null) {
      return arg;
    }
  }
  return undefined;
}
