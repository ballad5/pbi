<template>
  <div class="py-4">
    <v-card
      class="mx-auto pa-12 pb-8"
      elevation="8"
      max-width="448"
      rounded="lg"
    >
      <div class="text-subtitle-1 text-medium-emphasis">Account</div>
      <v-text-field
        density="compact"
        placeholder="Email address"
        prepend-inner-icon="mdi-email-outline"
        variant="outlined"
        v-model="email"
        :rules="[rules.required, rules.email]"
      ></v-text-field>

      <div class="text-subtitle-1 text-medium-emphasis d-flex align-center justify-space-between">
        Password
      </div>

      <v-text-field
        :append-inner-icon="visible ? 'mdi-eye-off' : 'mdi-eye'"
        :type="visible ? 'text' : 'password'"
        density="compact"
        placeholder="Enter your password"
        prepend-inner-icon="mdi-lock-outline"
        variant="outlined"
        v-model="password"
        :rules="[rules.required]"
        @click:append-inner="visible = !visible"
      ></v-text-field>

      <v-btn
        block
        class="mb-8"
        color="blue"
        size="large"
        variant="tonal"
        :disabled="syncing"
        @click="signIn"
      >
        Log In
      </v-btn>
    </v-card>
  </div>
</template>


<script lang="ts">

import { Component, Vue } from 'vue-facing-decorator'
import { accountStore } from '@/store'
import { useRouter, useRoute } from 'vue-router'

@Component({})
export default class SignIn extends Vue {
  public visible = false
  public email: string = 'test@test.com'
  public password: string = '1234'
  public syncing: boolean = false
  public loginFail: boolean = false
  public rules = {
    required: (value: string) => !!value || 'Required.',
    email: (value: string) => {
      // tslint:disable-next-line:max-line-length
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(value) || 'Invalid e-mail.'
    }
  }

  public route = useRoute()
  private router = useRouter()

  private accountStore = accountStore()

  async signIn(): Promise<void> {
    this.syncing = true
    await this.accountStore.signIn({ email: this.email, password: this.password })
    .then(() => {
      this.router.push('/')
    })
    .catch(() => {
      this.loginFail = true
    })
    .finally(() => {
      this.syncing = false
    })
  
  }
}
</script>