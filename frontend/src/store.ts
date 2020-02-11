import Vue from 'vue'
import Vuex from 'vuex'
import CommonStore from './stores/common'
import ManageStore from './stores/manage'
import DataStore from './stores/data'
import AppStore from './stores/app'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    common: new CommonStore(),
    manage: new ManageStore(),
    data: new DataStore(),
    app: new AppStore()
  }
})
