<template>
  <div class="app-layout">
    <!-- 左侧菜单 -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <Logo />
        <h1>Leyton UI</h1>
      </div>
      <nav class="sidebar-nav">
        <ul>
          <li><router-link to="/"><i class="icon-home"></i>主页</router-link></li>
          <li><router-link to="/button"><i class="icon-button"></i>Button 按钮</router-link></li>
          <li><router-link to="/dialog"><i class="icon-dialog"></i>Dialog 弹窗</router-link></li>
          <li><router-link to="/layout"><i class="icon-layout"></i>Layout 布局</router-link></li>
          <li><router-link to="/blank"><i class="icon-blank"></i>Blank Page</router-link></li>
        </ul>
      </nav>
    </aside>

    <!-- 右侧主要内容区域 -->
    <div class="main-layout">
      <!-- 顶部导航栏 -->
      <header class="navbar">
        <div class="navbar-content">
          <div class="navbar-title">
            <h2>组件库文档</h2>
          </div>
          <div class="navbar-actions">
            <button class="theme-toggle" @click="toggleTheme">
              <i class="icon-theme"></i>
            </button>
            <a href="https://github.com" target="_blank" class="github-link">
              <i class="icon-github"></i>
            </a>
          </div>
        </div>
      </header>

      <!-- 主内容区域 -->
      <main class="content">
        <div class="content-wrapper">
          <router-view></router-view>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Logo from './components/icons/Logo.vue'

const isDark = ref(false)

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light')
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
}

onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    isDark.value = savedTheme === 'dark'
    document.documentElement.setAttribute('data-theme', savedTheme)
  } else {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light')
  }
})
</script>

<style>
/* CSS 变量定义 - 精致简洁设计 */
:root {
  /* 主色调 - 更现代的绿色系 */
  --primary-color: #00B76A;
  --primary-hover: #00A85D;
  --primary-light: #F0F9F4;
  --primary-bg: #E8F7ED;

  /* 背景色 */
  --bg-body: #FAFBFC;
  --bg-white: #FFFFFF;
  --bg-sidebar: #FFFFFF;
  --bg-header: #FFFFFF;
  --bg-hover: #F8FAFC;

  /* 文字颜色 */
  --text-primary: #1A202C;
  --text-secondary: #4A5568;
  --text-tertiary: #718096;
  --text-white: #FFFFFF;
  --text-muted: #A0AEC0;

  /* 边框颜色 */
  --border-color: #E2E8F0;
  --border-light: #EDF2F7;

  /* 阴影 - 更精致的阴影 */
  --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.06);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 8px 25px rgba(0, 0, 0, 0.12);

  /* 字体 */
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 18px;
  --font-size-2xl: 20px;
}

/* 全局重置 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  font-size: var(--font-size-base);
  line-height: 1.5;
  color: var(--text-primary);
  background: var(--bg-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* 应用布局 */
.app-layout {
  display: flex;
  min-height: 100vh;
  background: var(--bg-body);
}

/* 左侧边栏 */
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  background: var(--bg-sidebar);
  border-right: 1px solid var(--border-light);
  overflow-y: auto;
  z-index: 100;
  box-shadow: var(--shadow-lg);
}

.sidebar::-webkit-scrollbar {
  width: 4px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}

.sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 24px 20px 24px;
  background: linear-gradient(135deg, var(--primary-color) 0%, var(--primary-hover) 100%);
  color: var(--text-white);
  position: relative;
}

.sidebar-header::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
}

.sidebar-header h1 {
  margin: 0;
  font-size: var(--font-size-2xl);
  font-weight: 600;
  letter-spacing: -0.025em;
}

.sidebar-nav {
  padding: 20px 16px;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-nav li {
  margin-bottom: 2px;
}

.sidebar-nav a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  text-decoration: none;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.2s ease;
  position: relative;
}

.sidebar-nav a:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
  transform: translateX(2px);
}

.sidebar-nav a.router-link-active {
  background: var(--primary-bg);
  color: var(--primary-color);
  font-weight: 600;
  box-shadow: inset 3px 0 0 var(--primary-color);
}

.sidebar-nav a.router-link-active::before {
  content: '';
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 4px;
  background: var(--primary-color);
  border-radius: 50%;
}

/* 图标样式 */
.sidebar-nav i {
  width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  opacity: 0.8;
}

.sidebar-nav a.router-link-active i,
.sidebar-nav a:hover i {
  opacity: 1;
}

/* 主要内容区域 */
.main-layout {
  flex: 1;
  margin-left: 260px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 顶部导航栏 */
.navbar {
  background: var(--bg-header);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
  position: sticky;
  top: 0;
  z-index: 50;
  backdrop-filter: blur(10px);
}

.navbar-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 72px;
}

.navbar-title h2 {
  margin: 0;
  font-size: var(--font-size-xl);
  font-weight: 600;
  color: var(--text-primary);
  letter-spacing: -0.025em;
}

.navbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.theme-toggle,
.github-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--bg-white);
  color: var(--text-tertiary);
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 16px;
  position: relative;
}

.theme-toggle {
  border: 1px solid var(--border-color);
}

.theme-toggle:hover,
.github-link:hover {
  background: var(--primary-light);
  color: var(--primary-color);
  border-color: var(--primary-color);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

/* 主内容区域 */
.content {
  flex: 1;
  background: var(--bg-body);
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
}

.content-wrapper {
  width: 100%;
  height: 100%;
  background: var(--bg-white);
  position: relative;
  border-radius: 0;
}

/* 组件文档样式 */
.component-documentation {
  padding: 40px;
  background: var(--bg-white);
  min-height: calc(100vh - 72px);
}

/* 代码高亮调整 */
.hljs {
  border-radius: 8px;
  background: var(--bg-body) !important;
  border: 1px solid var(--border-color);
  font-size: var(--font-size-sm);
  padding: 20px !important;
}

/* 简单图标 */
.icon-home::before { content: '🏠'; }
.icon-button::before { content: '🔘'; }
.icon-dialog::before { content: '💬'; }
.icon-layout::before { content: '📐'; }
.icon-blank::before { content: '📄'; }
.icon-theme::before { content: '🌓'; }
.icon-github::before { content: '📱'; }

/* 响应式设计 */
@media (max-width: 1024px) {
  .sidebar {
    width: 200px;
  }

  .main-layout {
    margin-left: 200px;
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }

  .main-layout {
    margin-left: 0;
  }

  .navbar-content {
    padding: 0 16px;
  }

  .component-documentation {
    padding: 24px 16px;
  }
}

/* 滚动条样式优化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style>
