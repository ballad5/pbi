<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-list-item to="/">
        <v-list-item-content>
          <v-list-item-title class="title">
            Team
          </v-list-item-title>
          <v-list-item-subtitle>
            Team BI
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-subheader>Team</v-subheader>

        <v-list-item-group v-model="selectedMenu">
          <v-list-group
            prepend-icon="mdi-view-dashboard"
            :value="dashboards.findIndex((row) => row.path === $route.path) >= 0"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-title>Dashboard</v-list-item-title>
            </template>

            <v-list-item
              v-for="item in dashboards"
              :key="item.path"
              :value="item.path"
              @click="onClickMenu(item)"
              dense
            >
              <v-list-item-title v-text="item.text"></v-list-item-title>
              <v-list-item-icon>
                <v-icon v-text="item.icon"></v-icon>
              </v-list-item-icon>
            </v-list-item>
          </v-list-group>
        </v-list-item-group>
      </v-list>

      <v-list dense>
        <v-subheader>Projects</v-subheader>
        
        <v-list-item-group v-model="selectedMenu">
          <v-list-group
            v-for="item in menuGroups"
            :key="item.path"
            :prepend-icon="item.icon"
            :value="item.menuList.findIndex((row) => row.path === $route.path) >= 0"
            no-action
          >
            <template v-slot:activator>
              <v-list-item-content>
                <v-list-item-title v-text="item.text"></v-list-item-title>
              </v-list-item-content>
            </template>

            <v-list-item
              v-for="menu in item.menuList"
              :key="menu.path"
              :value="menu.path"
              @click="onClickMenu(menu)"
              dense
            >
              <v-list-item-title v-text="menu.text"></v-list-item-title>
              <v-list-item-icon>
                <v-icon v-text="menu.icon"></v-icon>
              </v-list-item-icon>
            </v-list-item>

          </v-list-group>
        </v-list-item-group>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app color="blue">
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
      <v-toolbar-title>Team</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-tooltip bottom>
        <template v-slot:activator="{ on }">
          <v-btn tile large icon @click="signOut" v-on="on">
            <v-icon>mdi-exit-to-app</v-icon>
          </v-btn>
        </template>
        <span>Sign Out</span>
      </v-tooltip>
    </v-app-bar>

    <v-content>
      <v-container fluid fill-height>
        <v-layout align-start justify-center>
          <router-view></router-view>
        </v-layout>
      </v-container>
    </v-content>

    <v-footer app>
      <v-spacer></v-spacer>
      <div class="grey--text darken-1">&copy; 2019 LS.</div>
    </v-footer>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { AuthPrivilege } from '../utils/enum-def'

@Component({})
export default class CommonLayout extends Vue {
  private drawer: boolean = true
  private dashboards = [
    { text: 'Game Report', icon: 'mdi-table-large', path: '/' }
  ]
  private menuGroups = [
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
  private selectedMenu = ''

  private get PrivilegeDef() {
    return AuthPrivilege
  }
  private get accountPrivilege(): number {
    return this.$store.getters.myAccount.priv
  }

  private signOut(): void {
    this.$store.commit('SIGNOUT')
    this.$router.push('/signin')
  }

  private mounted(): void {
    this.selectedMenu = this.$route.path
  }

  private onClickMenu(menu: any): void {
    if (menu.path) {
      if (this.$route.path !== menu.path) {
        this.$router.push(menu.path)
      }
    } else {
      alert('!!!')
    }
  }
}
</script>