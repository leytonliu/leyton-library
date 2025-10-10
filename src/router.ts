import { createRouter, createWebHistory } from 'vue-router';
import Home from './views/Home.vue';
import ButtonExample from './views/ButtonExample.vue';
import DialogExample from './views/DialogExample.vue';
import LayoutExample from './views/LayoutExample.vue';
import BlankPage from './views/BlankPage.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/button', component: ButtonExample },
  { path: '/dialog', component: DialogExample },
  { path: '/layout', component: LayoutExample },
  { path: '/blank', component: BlankPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
