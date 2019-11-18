import Vue from 'vue'
import App from './App.vue'
import Components from './components'
Vue.config.productionTip = process.env.NODE_ENV === 'production'
Vue.use(Components)
if (!Vue.config.productionTip) {
  new Vue({
    render: h => h(App),
  }).$mount('#app') 
}
