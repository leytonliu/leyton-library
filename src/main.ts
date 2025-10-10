import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import './style.css';

import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import xml from 'highlight.js/lib/languages/xml';
import 'highlight.js/styles/github.css';
import hljsVuePlugin from "@highlightjs/vue-plugin";

hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('xml', xml);

const app = createApp(App);
app.use(router);
app.use(hljsVuePlugin);
app.mount('#app');