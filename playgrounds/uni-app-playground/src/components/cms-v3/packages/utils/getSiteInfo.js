import { defer } from '@/utils/defer';

/**
 * 获取站点数据
 * @author  韦胜健
 * @date    2022/9/20 9:34
 */
export const getSiteInfo = async (context) => {
  const dfd = defer();
  const siteInfo = context.$store.state.siteInfo;
  if (siteInfo) {
    dfd.resolve(siteInfo);
  } else {
    context.$EventBus.$on('siteInfo', async (siteInfo) => {
      dfd.resolve(siteInfo);
    });
  }
  return dfd.promise;
};
