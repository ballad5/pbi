import Vue from 'vue'
import Vuex, { Module, GetterTree, ActionTree, MutationTree, ActionContext } from 'vuex'
import axios from 'axios'
import State from './def/state'

Vue.use(Vuex)

export default class AppStore implements Module<State, State> {
  public state: State = new State()

  public getters: GetterTree<State, State> = {
    appName: () => this.state.appName,
    appBasicData: () => this.state.appBasicData,
    appDailyData: () => this.state.appDailyData,
    appRetentionList: () => this.state.appRetentionList,
  }

  public mutations: MutationTree<State> = {
    GET_APP_BASIC_DATA(state: State, searchRes: any): void {
      state.appName = searchRes.appName
      state.appBasicData = searchRes.data
    },

    GET_APP_RETENTION_SEGMENTS(state: State, searchRes: any): void {
      state.appName = searchRes.app_name
    },

    GET_APP_RETENTION_DATA(state: State, searchRes: any): void {
      state.appRetentionStart = searchRes.start || ''
      state.appRetentionEnd = searchRes.end || ''
      state.appRetentionList = searchRes.retention_list || {}
    },

    GET_APP_INAPP(state: State, searchRes: any): void {
      state.appName = searchRes.appName
      state.appInAppList = searchRes.list || []
    },
  }

  public actions: ActionTree<State, State> = {
    GET_APP_BASIC_DATA(context: ActionContext<State, State>, { appId, platform, country, from, to }): Promise<void> {
      return new Promise((resolve, reject) => {
        axios.get(`/api/apps/basic/${appId}?platform=${platform}&country=${country}&from=${from}&to=${to}`,
          context.getters.axiosConfig
        )
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          context.commit('GET_APP_BASIC_DATA', data)
          resolve(data)
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },

    GET_APP_RETENTION_SEGMENTS(context: ActionContext<State, State>, appId: number): Promise<object> {
      return new Promise((resolve, reject) => {
        axios.get(`/api/apps/retention/${appId}`, context.getters.axiosConfig)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          context.commit('GET_APP_RETENTION_SEGMENTS', data)
          const countries: string[] = data.country ? Object.keys(data.country) : []
          resolve({ countries })
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },

    GET_APP_RETENTION_DATA(context: ActionContext<State, State>, { appId, alias, country, from, to }): Promise<void> {
      return new Promise((resolve, reject) => {
        axios.get(`/api/apps/retention/${appId}`, context.getters.axiosConfig)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          context.commit('GET_APP_RETENTION_DATA', data)
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },

    GET_APP_INAPP(context: ActionContext<State, State>, { appId, from, to }): Promise<void> {
      return new Promise((resolve, reject) => {
        axios.get(`/api/apps/in-app/${appId}?from=${from}&to=${to}`, context.getters.axiosConfig)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          context.commit('GET_APP_INAPP', data)
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    }
  }
}
