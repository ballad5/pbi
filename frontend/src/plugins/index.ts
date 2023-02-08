/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import router from '../router'
import 'vuetify/styles'
import type { App } from 'vue'
import { pinia } from '../store'
import { accountStore, commonStore } from '@/store'

export function registerPlugins (app: App) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .mount('#app')
}

router.afterEach(async (to, from) => {
  const account = accountStore()
  const common = commonStore()
  if (account.loginToken === 'Bearer ' && common.lastUri !== '/signin') {
    router.push('/signin')
    common.routing(to.path)
    return
  }
  if (to.path !== '/signin') {
    common.routing(to.path)
  }
  if (typeof account.accounts.email !== 'undefined' && account.accounts.email !== null) {
    try {
      await account.getUserAccount()
    } catch (err) {
      
      router.push('/signin')
      return
    }
  }
})