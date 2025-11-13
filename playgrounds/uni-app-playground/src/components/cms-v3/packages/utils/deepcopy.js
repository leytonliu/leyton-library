/**
 * 深度复制数据
 * @author  韦胜健
 * @date    2019/11/5 20:23
 */
import { typeOf } from './typeOf';

export const deepcopy = (data) => {
  let val = data;
  switch (typeOf(val)) {
    case 'array':
      return val.map((item) => deepcopy(item));
    case 'object':
      return Object.keys(val).reduce((ret, key) => {
        ret[key] = deepcopy(val[key]);
        return ret;
      }, {});
    case 'date': {
      const newDate = new Date();
      newDate.setTime(val.getTime());
      return newDate;
    }
    case 'regexp': {
      let pattern = val.valueOf();
      let flags = '';
      flags += pattern.global ? 'g' : '';
      flags += pattern.ignoreCase ? 'i' : '';
      flags += pattern.multiline ? 'm' : '';
      return new RegExp(pattern.source, flags);
    }
    default:
      return val;
  }
};
