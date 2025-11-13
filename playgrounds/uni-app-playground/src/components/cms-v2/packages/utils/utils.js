/*
 * @Description: 批量查询：根据商品编码查询商品明细
 * @Author: sunliu
 * @Date: 2022-10-11 11:16:44
 */
import Vue from 'vue';

export async function getProductList({ context, params }) {
  const url = context.$requestUrl.cms.getProductInfo;
  const { codes, labelTypeList } = params;
  const productParams = {
    blackFlag: 0,
    platformProductCodeList: codes,
    ...(labelTypeList && labelTypeList.length ? { labelTypeList } : {}),
  };
  const resp = await context.$http.post(url, productParams);
  return resp.data || [];
}

/*
 * @Description: 批量查询：根据类别编码查询课程/专栏商品
 * @Author: sunliu
 * @Date: 2024-01-09 16:52:51
 */
export async function getCourseListByCode({ context, params }) {
  const { page, size, categoryCode, filter = '' } = params;

  const url = context.$requestUrl.products.productList;
  let { data } = await context.$http.get(`${url}${encodeURI(filter)}`, {
    page,
    size,
    catalogVersionCode: Vue.prototype.$store.state.siteInfo.catalogVersionCode,
    categoryCode,
    kindTypeCodeList: ['VIRTUAL_COURSE', 'VIRTUAL_SPECIAL'],
  });

  return { productList: data.content, totalPages: data.totalPages, totalCnt: data.totalElements };
}

/**
 * CMS获取直播间列表接口
 */
export const getLiveRoomList = async ({ context, roomStatusCode, size }) => {
  const url = context.$requestUrl.live.liveRoomList;
  const { siteTypeCode } = context.$store.state.siteInfo;
  const params = {
    size: size || 3,
    page: 0,
    siteTypeCode,
    ...(roomStatusCode ? { roomStatusCode } : {}),
  };
  const res = await context.$http.get(url, params);
  return res.data.content;
};

export const getTabProducts = async ({ context, code, size, maxScore }) => {
  const url = context.$requestUrl.cms.getRecommend;
  const params = {
    recommendCode: code,
    size,
    maxScore,
  };
  const res = await context.$http.get(url, params);
  return res.data;
};

// 查询专栏列表
export const getSpecialColumnList = async ({ context, codes }) => {
  const url = context.$requestUrl.cms.getSpecialColumn;
  const res = await context.$http.get(url, { specialColumnCodeList: codes });
  return res.data;
};

// 查询积分商品列表
export const getPointProductList = async ({ context, params }) => {
  const url = context.$requestUrl.cms.getPointProductList;
  const res = await context.$http.get(url, params);
  return res.data;
};
