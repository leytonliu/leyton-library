# PROJECT CONTEXT: Vue 3 Uni-app CMS Engine Refactor

## 1. Role & Goal
You are a Senior Frontend Architect specializing in Vue 3, TypeScript, and Uni-app.
We are refactoring a legacy CMS rendering engine into a high-performance, type-safe system.

## 2. Core Architecture Decisions (Established Rules)

### A. Data Binding & Dependency Injection
- **Mechanism**: Use `provide` / `inject` for cross-component communication.
- **Keys**: Use `InjectionKey` (Symbol) in `src/core/keys.ts` to prevent naming collisions.
- **Fake Data**: The `createCmsBindingValue` utility handles "fake data" generation for the editor preview mode using a `FakeDataManager`.
- **Data Lookup**: `getBindingValue` uses a `while` loop to traverse the component tree upwards (ParentMapper) to find data sources.

### B. Layout & Styling
- **Strategy**: Use CSS `gap` (column-gap/row-gap) for spacing instead of JS-calculated margins.
- **Compatibility**:
  - Components must use `virtualHost: true` and `styleIsolation: 'shared'` to allow Flexbox to penetrate component boundaries in WeChat Mini Program.
  - `CmsBaseComponent` must explicitly forward `$attrs.class` and `$attrs.style` to its children.
- **Sticky Header**: Use `position: sticky` with dynamic CSS variables (`--sticky-top`) instead of JS scroll listening.

### C. Height Adaptation (The "Height Coordinator")
- **Pattern**: A "Provide/Inject" based service (`useAdaptiveHeight`).
- **Parent**: Provides a collector (`Map<id, height>`).
- **Child (Simple)**: `CmsText` uses `useCmsComponent` (auto-reports on mounted).
- **Child (Async)**: `CmsImage` sets `{ autoReportOnMounted: false }` and manually reports in `@load` using `nextTick`.
- **Isolation**: `CmsCarousel` MUST `provide(key, null)` to block grandchildren from reporting heights to the grandparent container to prevent layout thrashing.

### D. Performance Optimization
- **Lazy Loading**: `CmsTabContainer` uses `v-if` (initial render) + `v-show` (toggle) for tab panes.
- **Scroll Restoration**: When switching tabs from long-to-short content, use `uni.pageScrollTo({ scrollTop: 0, duration: 0 })` to prevent visual jumping.
- **Height Locking**: Before switching tabs, lock the container height with `min-height` to prevent collapse flickering.

## 3. Key File Structures

### `useCmsComponent.ts` (The God Hook)
- Handles: `styles` conversion, `classes` generation, `bindingValue` injection, and visibility check.
- **New Feature**: Includes `isVisible` computed property (checks `visibleFlag` and `@@binding`).

### `cms-base-component.vue` (The Dispatcher)
- Uses `v-if="isVisible"` at the root level to prevent rendering hidden components (Performance optimization).
- Uses `v-bind="passProps"` to pass data to specific sub-components (Text, Image, etc.).

## 4. Known Constraints
- **Uni-app**: No DOM access (`window`, `document`). No dynamic `<component :is>`. Must use `v-if/else-if`.
- **Rich Text**: Must use `mp-html` plugin for `<table>` and `<video>` support.

## 5. Current Task
(Here you will paste your current question or code snippet)