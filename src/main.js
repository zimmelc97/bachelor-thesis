import Vue from 'vue';
import { BootstrapVue, IconsPlugin } from 'bootstrap-vue';
import App from './App.vue';
import store from './store/store';
import VueResizeText from 'vue-resize-text';

import "vue-slider-component/theme/default.css";

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import VTooltip from 'v-tooltip'

Vue.use(BootstrapVue);
Vue.use(IconsPlugin);
Vue.use(VueResizeText)

Vue.use(VTooltip)

Vue.config.productionTip = false;

new Vue({
    store,
    render: h => h(App),
}).$mount('#app');