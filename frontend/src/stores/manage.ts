import Vue from 'vue'
import Vuex, { Module, GetterTree, ActionTree, MutationTree, ActionContext } from 'vuex'
import axios from 'axios'
import State from './def/state'

Vue.use(Vuex)

export default class ManageStore implements Module<State, State> {
  public state: State = new State()

  public getters: GetterTree<State, State> = {
    apps: () => this.state.apps,
    accounts: () => this.state.accounts
  }

  public mutations: MutationTree<State> = {
    GET_SETTING_INFO(state: State, res: any): void {
      state.apps = res.apps
      state.adNetworks = res.adNetworks
    },
    UPDATE_APP_DB(state: State, res: any): void {
      if (res.app) {
        const appIndex = state.apps.findIndex((row) => row.id === res.app.id)
        if (appIndex >= 0) {
          state.apps[appIndex].host = res.app.host
        }
      }
    },
    GET_ACCOUNTS(state: State, res: any): void {
      if (res.accounts) {
        state.accounts = res.accounts
      }
    },
    SET_ACCOUNT_PRIV(state: State, account: any): void {
      if (account) {
        const accountIndex = state.accounts.findIndex(({ email }) => account.email === email)
        if (accountIndex >= 0) {
          state.accounts[accountIndex].priv = account.priv
        }
      }
    }
  }

  public actions: ActionTree<State, State> = {
    GET_SETTING_INFO(context: ActionContext<State, State>): Promise<void> {
      return new Promise((resolve, reject) => {
        if (context.getters.apps.length > 0) {
          resolve()
          return
        }

        axios.get('/api/settings', context.getters.axiosConfig)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          context.commit('GET_SETTING_INFO', data)
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },

    GET_ACCOUNTS(context: ActionContext<State, State>): Promise<void> {
      return new Promise((resolve, reject) => {
        axios.get('/api/settings/accounts', context.getters.axiosConfig)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          context.commit('GET_ACCOUNTS', data)
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    }
  }
}
