// Utilities
import { defineStore } from 'pinia'
import { accountStore } from '@/store'
import axios from 'axios'

const baseUrl = `${import.meta.env.VITE_API_URL}`

export const appStore = defineStore('app', {

  state: () => ({    
    appName: '',
    appBasicData: <any>[],
    appDailyData: <any>[],
    appRetentionStart: '',
    appRetentionEnd: '',
    appRetentionList: <any>{},
    appInAppList: <any>[]
  }),

  getters: {
    getAppName: (state) => state.appName,
    getAppBasicData: (state) => state.appBasicData,
    getAppDailyData: (state) => state.appDailyData,
    getAppRetentionList: (state) => state.appRetentionList,
  },
  actions: {
    setAppBasicData(searchRes: any): void {
      this.appName = searchRes.appName
      this.appBasicData = searchRes.data
    },

    setAppRetentionSegments(searchRes: any): void {
      this.appName = searchRes.app_name
    },

    setAppRetentionData(searchRes: any): void {
      this.appRetentionStart = searchRes.start || ''
      this.appRetentionEnd = searchRes.end || ''
      this.appRetentionList = searchRes.retention_list || {}
    },

    setAppInapp(searchRes: any): void {
      this.appName = searchRes.appName
      this.appInAppList = searchRes.list || []
    },

    actionAppBasicData( appId: number, platform: string, country: string, from: string, to: string ): Promise<void> {
      return new Promise((resolve, reject) => {
        const account = accountStore()
        axios.get(baseUrl+`/api/apps/basic/${appId}?platform=${platform}&country=${country}&from=${from}&to=${to}`,
        account.auth
        )
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          this.setAppBasicData(data)
          resolve(data)
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },

    actionAppRetentionSegments(appId: number): Promise<object> {
      return new Promise((resolve, reject) => {
        const account = accountStore()
        axios.get(baseUrl+`/api/apps/retention/${appId}`, account.auth)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          this.setAppRetentionSegments(data)
          const countries: string[] = data.country ? Object.keys(data.country) : []
          resolve({ countries })
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },

    actionAppRetentionData(appId: Number, alias: string, country: string, from: string, to: string ): Promise<void> {
      return new Promise((resolve, reject) => {
        const account = accountStore()
        axios.get(baseUrl+`/api/apps/retention/${appId}?from=${from}&to=${to}&country=${country}`, account.auth)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          this.setAppRetentionData(data)
          
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    },

    actionAppInapp( appId: number, from: string, to: string ): Promise<void> {
      return new Promise((resolve, reject) => {
        const account = accountStore()
        axios.get(baseUrl+`/api/apps/in-app/${appId}?from=${from}&to=${to}`, account.auth)
        .then(({ data }) => {
          if (!data) {
            reject()
            return
          }
          this.setAppInapp(data)
          resolve()
        })
        .catch((err) => {
          reject(err ? err.response : {})
        })
      })
    }
  }
})
