import Vue from 'vue';
import Vuex from 'vuex';
import VueResource from 'vue-resource';
import App from './App.vue';
import { createStore } from './store.js'

Vue.config.productionTip = false
Vue.use(Vuex);
Vue.use(VueResource);
const store = createStore();

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
