import { typeOf } from './typeOf';

/**
 * 深拷贝函数
 * 使用泛型 <T> 确保返回类型与输入类型一致
 */
export const deepcopy = <T>(data: T): T => {
  const type = typeOf(data);

  switch (type) {
    case 'array': {
      // 断言为数组进行处理
      const arr = data as unknown as any[];
      return arr.map((item) => deepcopy(item)) as unknown as T;
    }

    case 'object': {
      // 断言为对象进行处理
      const obj = data as unknown as Record<string, any>;
      return Object.keys(obj).reduce((ret, key) => {
        ret[key] = deepcopy(obj[key]);
        return ret;
      }, {} as Record<string, any>) as unknown as T;
    }

    case 'date': {
      const date = data as unknown as Date;
      const newDate = new Date();
      newDate.setTime(date.getTime());
      return newDate as unknown as T;
    }

    case 'regExp': {
      // 注意：typeOf 返回的是 'regExp'，这里修正了原代码的大小写匹配问题
      const reg = data as unknown as RegExp;
      let flags = '';
      flags += reg.global ? 'g' : '';
      flags += reg.ignoreCase ? 'i' : '';
      flags += reg.multiline ? 'm' : '';
      // 现代浏览器也可以直接使用 reg.flags，但在需兼容旧环境时保留手动拼接
      return new RegExp(reg.source, flags) as unknown as T;
    }

    default:
      return data;
  }
};
