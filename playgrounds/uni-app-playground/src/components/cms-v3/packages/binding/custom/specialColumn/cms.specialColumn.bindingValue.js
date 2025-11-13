import { getOssImagePrefix } from '../../utils/util';

export function cmsSpecialColumnBindingValue(params) {
  const bindingValue = params.bindingValue;
  bindingValue.registry({
    code: "@@special-column-name",
    name: '绑定专栏名称',
    getter: (data) => {
      let _data$data;

      const specialColumn = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.specialColumn;
      return {
        done: !!specialColumn,
        val: specialColumn === null || specialColumn === void 0 ? void 0 : specialColumn.specialColumnName,
      };
    },
  });
  bindingValue.registry({
    code: "@@special-column-image",
    name: '绑定专栏主图',
    getter: (data) => {
      let _data$data4;

      const specialColumn = (_data$data4 = data.data) === null || _data$data4 === void 0 ? void 0 : _data$data4.specialColumn;
      const prefix = getOssImagePrefix();
      return {
        done: !!specialColumn,
        val: prefix + (specialColumn === null || specialColumn === void 0 ? void 0 : specialColumn.thumbnailImageUrl),
      };
    },
  });

  bindingValue.registry({
    code: '@@special-column-taxQuantity',
    name: '绑定专栏课程数量',
    getter: (data) => {
      let _data$data;

      const specialColumn = (_data$data = data.data) === null || _data$data === void 0 ? void 0 : _data$data.specialColumn;
      return {
        done: !!specialColumn,
        val: specialColumn === null || specialColumn === void 0 ? void 0 : `${specialColumn.courseTotalCount}个课程`,
      };
    },
  });
}
