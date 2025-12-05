import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import CmsText from '../../../components/cms/packages/components/cms-text.vue';

// Mock useCmsComponent 钩子
// 我们需要模拟它返回的 { classes, styles, getBindingValue, handleTapBaseContainer }
vi.mock('../../../components/cms/packages/hooks/useCmsComponent', () => ({
  default: () => ({
    classes: { 'cms-text': true },
    styles: { color: 'red' }, // 模拟返回的样式
    getBindingValue: (val: any) => val, // 简单透传，或者根据 key 返回特定值
    handleTapBaseContainer: vi.fn(),
  }),
}));

describe('CmsText.vue', () => {
  // 基础数据 Mock
  const baseProps = {
    data: {
      componentId: 'text-001',
      componentCode: 'text',
      componentName: 'Text Component',
      data: {
        text: 'Hello World', // getBindingValue 会直接返回这个
        overflowMode: 'single'
      },
      style: {},
      childrenData: []
    },
    index: 0
  };

  it('should render text content', () => {
    const wrapper = mount(CmsText, {
      props: baseProps,
      global: {
        stubs: {
          // 将 uni-app 的 view 标签存根为 div
          view: { template: '<div class="uni-view"><slot /></div>' }
        }
      }
    });

    expect(wrapper.text()).toContain('Hello World');
    expect(wrapper.find('.uni-view').exists()).toBe(true);
  });

  it('should apply classes and styles from hook', () => {
    const wrapper = mount(CmsText, {
      props: baseProps,
      global: {
        stubs: { view: true }
      }
    });
    
    // 验证来自 mock hook 的样式是否应用到了根元素
    // 注意：因为我们 mock 了 view，可能需要检查透传情况
    // 或者在 stub 中绑定 attributes
  });

  it('should generate correct text styles for single line mode', () => {
    const wrapper = mount(CmsText, {
      props: {
        ...baseProps,
        data: {
          ...baseProps.data,
          data: { text: 'Text', overflowMode: 'single' }
        }
      },
      global: { stubs: { view: true } }
    });

    // textStyles 是应用在内部那个 view 上的
    // 我们查找包含 style 的元素
    const innerView = wrapper.findAll('view-stub')[1] || wrapper.findAll('view')[1]; 
    // 注意：由于 stubs 行为，我们需要看渲染结果。
    // 这里的 html() 应该包含 style="..."
    
    expect(wrapper.html()).toContain('-webkit-line-clamp:1');
  });

  it('should generate correct text styles for multiple line mode', () => {
    const wrapper = mount(CmsText, {
      props: {
        ...baseProps,
        data: {
          ...baseProps.data,
          data: { text: 'Text', overflowMode: 'multiple' }
        }
      },
      global: { stubs: { view: true } }
    });

    expect(wrapper.html()).toContain('-webkit-line-clamp:2');
  });
});
