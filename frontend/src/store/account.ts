import { defineStore } from 'pinia'
import { commonStore } from '@/store'
import axios from 'axios'

const baseUrl = `${import.meta.env.VITE_API_URL}`

export const accountStore = defineStore('account', {
  
  state: () => ({
    account : <any>{},
    token : localStorage.getItem('signed_token') || '',
  }),

  getters: {
    accounts: (state) => state.account,
    auth: (state) => ({ headers: { Authorization: 'Bearer ' + state.token } }),
    loginToken: (state) => 'Bearer ' + state.token,
  },
  actions: {
    async getAccount(): Promise<void> {
      return new Promise((resolve, reject) => {
        axios.get(baseUrl+'/api/settings/accounts', this.auth)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          this.account = data        
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },
    async signIn(signInReq: any): Promise<void> {
      return new Promise((resolve, reject) => {
        axios.post(baseUrl+'/api/account/signin', signInReq)
        .then(({ data }) => {          
          const { account, token } = data
          localStorage.setItem('signed_token', token)
          this.token = token
          this.account = account
          const common = commonStore()
          common.routing('/test')
          resolve()
        })
        .catch((err) => {
          console.log(err)
          reject()
        })
      })
    },
    async getUserAccount(): Promise<void> {
      return new Promise((resolve, reject) => {
        axios.get(baseUrl+'/api/account', this.auth)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          this.account = data
          localStorage.setItem('signed_token', data.token)
        })
        .catch(() => {
          reject()
        })
      })
    },
    async signOut() {
      localStorage.removeItem('signed_token')
      this.account = {}
      this.token = ''
    },
  }
})
