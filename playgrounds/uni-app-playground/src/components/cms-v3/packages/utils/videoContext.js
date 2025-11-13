// 当前播放的视频上下文
// TODO 看看是否要处理页面切换
let curPlayContext = null;

/**
 * 设置当前播放的视频上下文,并暂停上一个视频
 */
export function setCurPlayContext(context) {
  if (curPlayContext) {
    curPlayContext.pause();
  }
  curPlayContext = context;
}

export function clearCurPlayContext(context) {
  if (context !== undefined) {
    if (context === curPlayContext) {
      curPlayContext = null;
    }
  } else {
    curPlayContext = null;
  }
}
