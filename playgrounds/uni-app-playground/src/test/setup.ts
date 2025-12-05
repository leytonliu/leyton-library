import { vi } from 'vitest';

// 模拟 uni 对象
const uniMock = {
  getSystemInfoSync: vi.fn(() => ({
    windowWidth: 375,
    windowHeight: 667,
    statusBarHeight: 20,
    platform: 'devtools'
  })),
  createSelectorQuery: vi.fn(() => ({
    in: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    selectAll: vi.fn().mockReturnThis(),
    boundingClientRect: vi.fn().mockReturnThis(),
    exec: vi.fn((cb) => cb && cb([{ width: 100, height: 100 }])),
  })),
  showToast: vi.fn(),
  hideToast: vi.fn(),
  navigateTo: vi.fn(),
  redirectTo: vi.fn(),
  switchTab: vi.fn(),
  navigateBack: vi.fn(),
  $on: vi.fn(),
  $emit: vi.fn(),
  $off: vi.fn(),
};

// 模拟 wx 对象 (微信小程序环境)
const wxMock = {
  ...uniMock,
  getSystemInfoSync: uniMock.getSystemInfoSync,
};

// 挂载到全局
(global as any).uni = uniMock;
(global as any).wx = wxMock;

// 模拟 getApp
(global as any).getApp = vi.fn(() => ({
  globalData: {}
}));

// 模拟 getCurrentPages
(global as any).getCurrentPages = vi.fn(() => []);
