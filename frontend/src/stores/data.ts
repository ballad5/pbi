import Vue from 'vue'
import Vuex, { Module, GetterTree, ActionTree, MutationTree, ActionContext } from 'vuex'
import axios from 'axios'
import State from './def/state'

Vue.use(Vuex)

export default class CommonStore implements Module<State, State> {
  public state: State = new State()

  public getters: GetterTree<State, State> = {
    totalSearchStart: () => this.state.totalSearchStart,
    totalSearchEnd: () => this.state.totalSearchEnd,
    totalSearchType: () => this.state.totalSearchType,
    totalSearchData: () => this.state.totalSearchData,
    dailyTotalData: () => this.state.dailyTotalData,
    dailyAppsIapRevenue: () => this.state.dailyAppsIapRevenue,
    dailyAppsDau: () => this.state.dailyAppsDau,
    dailyAppsNru: () => this.state.dailyAppsNru
  }

  public mutations: MutationTree<State> = {
    CHANGE_TOTAL_SEARCH_TYPE(state: State, searchType: string): void {
      state.totalSearchType = searchType
    },

    CHANGE_TOTAL_SEARCH_DATE(state: State, { start, end }): void {
      state.totalSearchStart = start
      state.totalSearchEnd = end
    },

    GET_TOTAL_APPS(state: State, searchRes: any): void {
      state.totalSearchData = []
      state.dailyTotalData = []
      state.dailyAppsIapRevenue = {}
      state.dailyAppsDau = {}
      state.dailyAppsNru = {}

      if (searchRes.summaries) {
        state.totalSearchData = searchRes.summaries
        state.totalSearchData.sort((a, b) => {
          if (a.list_order < b.list_order) {
            return -1
          }
          if (a.list_order > b.list_order) {
            return 1
          }
          return 0
        })
      }
      if (searchRes.dailyData) {
        state.dailyTotalData = searchRes.dailyData
      }
      if (searchRes.dailyApps) {
        for (const row of searchRes.dailyApps) {
          if (!state.dailyAppsIapRevenue[row.app_name]) {
            state.dailyAppsIapRevenue[row.app_name] = []
          }
          state.dailyAppsIapRevenue[row.app_name].push({ date: row.log_date, value: row.iap_revenue })

          if (!state.dailyAppsDau[row.app_name]) {
            state.dailyAppsDau[row.app_name] = []
          }
          state.dailyAppsDau[row.app_name].push({ date: row.log_date, value: row.dau })

          if (!state.dailyAppsNru[row.app_name]) {
            state.dailyAppsNru[row.app_name] = []
          }
          state.dailyAppsNru[row.app_name].push({ date: row.log_date, value: row.nru })
        }
      }
    }
  }

  public actions: ActionTree<State, State> = {
    GET_TOTAL_APPS(context: ActionContext<State, State>): Promise<void> {
      return new Promise((resolve, reject) => {
        // tslint:disable-next-line: max-line-length
        axios.get(`/api/apps?type=${this.getters.totalSearchType}&from=${this.getters.totalSearchStart}&to=${this.getters.totalSearchEnd}`,
          context.getters.axiosConfig
        )
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          context.commit('GET_TOTAL_APPS', data)
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    }
  }
}
