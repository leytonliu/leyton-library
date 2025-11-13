/**
 * 节流
 * @author  韦胜健
 * @date    2019/11/16 18:49
 * @param   func                //核心函数
 * @param   wait                //节流时长（该时间段内只执行一次func）
 * @param   options             //额外参数
 * @param   options.trailing    //最后一次应该被触发，默认为true
 * @param   options.leading     //第一次是否立即执行
 */
export const throttle = (func, wait, options = {}) => {
  let args,
    context,
    previous = 0,
    timeout;
  let later = () => {
    previous = options.leading === false ? 0 : Date.now();
    func.apply(context, args);
    args = context = timeout = null;
  };
  return function () {
    args = arguments;
    // @ts-ignore
    context = this;
    let now = Date.now();
    if (!previous && options.leading === false) {
      previous = now;
    }
    let remaining = wait - (now - previous);
    if (remaining <= 0) {
      /*第一次*/
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      func.apply(context, args);
      previous = now;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
  };
};
