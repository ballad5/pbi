<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawerStore" app>
      <v-list-item to="/">
        <v-list>
          <v-list-item-title class="title">
            Team
          </v-list-item-title>
          <v-list-item-subtitle>
            Team BI
          </v-list-item-subtitle>
        </v-list>
      </v-list-item>
      <v-divider></v-divider>

      <v-list dense>
        <v-list-subheader>Team</v-list-subheader>
          <v-list-group value="dashboards">
            <template v-slot:activator="{ props }">
              <v-list-item
                v-bind="props"
                prepend-icon="mdi-view-dashboard"
                title="dashboards"
              ></v-list-item>
            </template>
              <v-list-item
                v-for="item in dashboards"
                :key="item.path"
                :value="item.path"
                :title="item.text"
                :prepend-icon="item.icon"
                @click="onClickMenu(item)"
                dense
              ></v-list-item>
          </v-list-group>
        </v-list>
      <v-list dense>
        <v-list-group 
          v-for="item in menuGroups"
          :key="item.text"
          :title="item.text">
          <template v-slot:activator="{ props }">
            <v-list-item
              v-bind="props"
              :key="item.text"
              :prepend-icon="item.icon"
              :value="item.menuList.findIndex((row) => row.path === route.path) >= 0"
              no-action
            ></v-list-item>
            </template>
              <v-list-item
              v-for="menu in item.menuList"
                :key="menu.path"
                :value="menu.path"
                :title="menu.text"
                :prepend-icon="menu.icon"
                @click="onClickMenu(menu)"
                dense
                >
              </v-list-item>          
        </v-list-group>
      </v-list>
    </v-navigation-drawer>

    <v-toolbar @click.stop="commonStore.toggleDrawer()" color="deep-purple accent-4">
      <v-toolbar-title>Menu</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator>
          <v-btn tile large icon @click="signOut" >
            <v-icon>mdi-exit-to-app</v-icon>
          </v-btn>
        </template>
        <span>Sign Out</span>
      </v-tooltip>
    </v-toolbar>


    <v-content>
      <v-container fluid fill-height>
        <v-layout align-start justify-center>
          <router-view></router-view>
        </v-layout>
      </v-container>
    </v-content>

    <v-footer app>
      <v-spacer></v-spacer>
      <div class="grey--text darken-1">&copy; 2023 LS.</div>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-facing-decorator'
import { accountStore, commonStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'
import { AuthPrivilege } from '@/util/enum'

@Component({})
export default class CommonLayout extends Vue {

  public dashboards = [
    { text: 'Game Report', icon: 'mdi-table-large', path: '/' }
  ]
  public menuGroups = [
    {
      text: 'GAME A', icon: 'mdi-gamepad-variant-outline',
      menuList: [
        { text: '게임 지표 현황', icon: 'mdi-chart-line', path: '/app-stat/10' },
        { text: 'Retention', icon: 'mdi-align-horizontal-left', path: '/app-retention/10' },
      ]
    },
    {
      text: 'GAME B', icon: 'mdi-gamepad-variant-outline',
      menuList: [
        { text: '게임 지표 현황', icon: 'mdi-chart-line', path: '/app-stat/14' },
        { text: 'Retention', icon: 'mdi-align-horizontal-left', path: '/app-retention/14' }
      ]
    }
  ]
  public selectedMenu = ''

  private accountStore = accountStore()
  public commonStore = commonStore()
  public route = useRoute()
  public router = useRouter()

  public get drawerStore() {
    return this.commonStore.drawer
  }
  public set drawerStore(val: boolean) {
    this.commonStore.toggleDrawer()
  }

  // public get PrivilegeDef() {
  //   return AuthPrivilege
  // }
  // public get accountPrivilege(): number {
  //   return this.$store.getters.myAccount.priv
  // }


  public signOut(): void {    
    this.router.push('signin')
    this.accountStore.signOut()
  }

  public onClickMenu(menu: any): void {
    if (menu.path) {
      if (this.route.path !== menu.path) {
        this.router.push(menu.path)
      }
    } else {
      alert('!!!')
    }
  }
}
</script>