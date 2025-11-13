/**
 * 由于组件无法传递函数以及深层次的组件信息，这里通过事件广播机制实现监听子组件高度初始化事件
 * @author  韦胜健
 * @date    2022.9.18 20:55
 */
export const createAutoGetRect = (() => {
  let count = 0;
  const nextId = () => `get_rect_id_${count++}`;

  const listenMap = {};

  const create = (handler = () => {}) => {
    const id = nextId();
    listenMap[id] = handler;
    return {
      id,
      clear: () => delete listenMap[id],
    };
  };

  const rect = (id, rectInfo) => {
    if (listenMap[id]) {
      listenMap[id](rectInfo);
    }
  };

  return { create, rect };
})();
