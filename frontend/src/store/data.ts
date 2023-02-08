import { defineStore } from 'pinia'
import { accountStore } from '@/store'

import axios from 'axios'
const baseUrl = `${import.meta.env.VITE_API_URL}`
export const dataStore = defineStore('data', {
  
  state: () => ({
    totalSearchStart : '2022-12-20',
    totalSearchEnd : '2022-12-25',
    totalSearchType : 'avg',
    totalSearchData : <any>[],
    dailyTotalData : <any>[],
    dailyAppsIapRevenue : <any>{},
    dailyAppsDau : <any>{},
    dailyAppsNru : <any>{},
  }),

  getters: {
    getTotalSearchStart: (state) => state.totalSearchStart,
    getTotalSearchEnd: (state) => state.totalSearchEnd,
    getTotalSearchType: (state) => state.totalSearchType,
    getTotalSearchData: (state) => state.totalSearchData,
    getDailyTotalData: (state) => state.dailyTotalData,
    getDailyAppsIapRevenue: (state) => state.dailyAppsIapRevenue,
    getDailyAppsDau: (state) => state.dailyAppsDau,
    getDailyAppsNru: (state) => state.dailyAppsNru,
  },
  actions: {
    changeTotalSearchType(searchType: string): void {
      this.totalSearchType = searchType
    },

    changeTotalSearchDate(start: string, end: string ): void {
      this.totalSearchStart = start
      this.totalSearchEnd = end
    },

    setTotalApps(searchRes: any): void {
      this.totalSearchData = []
      this.dailyTotalData = []
      this.dailyAppsIapRevenue = {}
      this.dailyAppsDau = {}
      this.dailyAppsNru = {}

      if (searchRes.summaries) {
        this.totalSearchData = searchRes.summaries
        this.totalSearchData.sort((a: any, b: any) => {
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
        this.dailyTotalData = searchRes.dailyData
      }
      if (searchRes.dailyApps) {
        for (const row of searchRes.dailyApps) {
          if (!this.dailyAppsIapRevenue[row.app_name]) {
            this.dailyAppsIapRevenue[row.app_name] = []
          }
          this.dailyAppsIapRevenue[row.app_name].push({ date: row.log_date, value: row.iap_revenue })

          if (!this.dailyAppsDau[row.app_name]) {
            this.dailyAppsDau[row.app_name] = []
          }
          this.dailyAppsDau[row.app_name].push({ date: row.log_date, value: row.dau })

          if (!this.dailyAppsNru[row.app_name]) {
            this.dailyAppsNru[row.app_name] = []
          }
          this.dailyAppsNru[row.app_name].push({ date: row.log_date, value: row.nru })
        }
      }
    },
    async getTotalApps(): Promise<void> {
      return new Promise((resolve, reject) => {
        const account = accountStore()    
        axios.get(baseUrl+`/api/apps?type=${this.totalSearchType}&from=${this.totalSearchStart}&to=${this.totalSearchEnd}`,
        account.auth
        )
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          this.setTotalApps(data)
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },
  }
})


