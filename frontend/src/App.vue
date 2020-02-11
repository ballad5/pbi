<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import CommonLayout from './layouts/CommonLayout.vue'

export default Vue.extend({
  name: 'App',
  data: () => ({
    //
  }),
})
</script>
