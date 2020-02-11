import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import vuetify from './plugins/vuetify'
// @ts-ignore
import AirbnbStyleDatepicker from 'vue-airbnb-style-datepicker'
import 'vue-airbnb-style-datepicker/dist/vue-airbnb-style-datepicker.min.css'

Vue.config.productionTip = false

const datepickerOptions = {
  dateLabelFormat: 'YYYY-MM-DD'
}
Vue.use(AirbnbStyleDatepicker, datepickerOptions)

const vue = new Vue({
  router,
  store,
  vuetify,
  render: (h) => h(App)
}).$mount('#app')

router.afterEach(async (to, from) => {
  if (vue.$store.getters.loginToken === 'Bearer ') {
    vue.$router.push('/signin')
    return
  }
  if (to.path !== '/signin') {
    vue.$store.commit('ROUTING', to.path)
  }
  if (!vue.$store.getters.myAccount.email) {
    try {
      await vue.$store.dispatch('GET_ACCOUNT')
    } catch (err) {
      vue.$router.push('/signin')
      return
    }
  }
})
