/*
 * @Description: 时间转特定格式字符串
 * @Author: sunliu
 * @Date: 2022-08-30 10:04:56
 */
export function formatTime(time) {
  // IOS不支持形如2018-03-29这样格式的时间
  const formatTime = time ? time.replace(/-/g, '/') : time;
  const getTime = (time) => {
    const _t = new Date(time);

    return {
      month: _t.getMonth() + 1,
      date: _t.getDate(),
      hour: _t.getHours(),
      minute: _t.getMinutes(),
    };
  };

  const start = getTime(formatTime);
  return `${start.month}月${start.date}日 ${start.hour}:${start.minute < 10 ? '0' : ''}${start.minute}`;
}
/** 商品列表卡片专用 */
export function formatCardDate(time) {
  const formatTime = time ? time.replace(/-/g, '/') : time;
  const getTime = (t) => {
    if (!t) return { isInvalid: true };
    const _t = new Date(t);
    return {
      isInvalid: isNaN(_t.valueOf()),
      year: `${_t.getFullYear() % 100}`.padStart(2, '0'),
      month: `${_t.getMonth() + 1}`.padStart(2, '0'),
      date: `${_t.getDate()}`.padStart(2, '0'),
    };
  };
  const d = getTime(formatTime);
  return d.isInvalid ? '' :`${d.year}-${d.month}-${d.date}`;
}

