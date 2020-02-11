<template>
  <v-content>
    <v-container fluid fill-height>
      <v-layout align-center justify-center>
        <v-flex xs12 sm8 md4>
          <v-card class="elevation-11">
            <v-toolbar color="blue" dark>
              <v-toolbar-title>Your email.</v-toolbar-title>
            </v-toolbar>

            <v-card-text>
              <v-form>
                <v-text-field
                  prepend-icon="mdi-email"
                  name="email"
                  label="E-mail"
                  type="text"
                  v-model="email"
                  :rules="[rules.required, rules.email]"
                ></v-text-field>
                <v-text-field
                  prepend-icon="mdi-lock"
                  name="password"
                  label="Password"
                  type="password"
                  v-model="password"
                  :rules="[rules.required]"
                ></v-text-field>
              </v-form>
            </v-card-text>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="primary"
                :disabled="syncing"
                @click="doSignIn"
              >
                SIGN IN
              </v-btn>
            </v-card-actions>
          </v-card>

          <v-alert v-model="loginFail" type="error">
            Please check your email end/or password and try again.
          </v-alert>
        </v-flex>
      </v-layout>
    </v-container>
  </v-content>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'

@Component({})
export default class SignIn extends Vue {
  private email: string = 'test@test.com'
  private password: string = '1234'
  private syncing: boolean = false
  private loginFail: boolean = false
  private rules = {
    required: (value: string) => !!value || 'Required.',
    email: (value: string) => {
      // tslint:disable-next-line:max-line-length
      const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      return pattern.test(value) || 'Invalid e-mail.'
    }
  }

  private doSignIn(): void {
    this.syncing = true

    this.$store.dispatch('SIGNIN', { email: this.email, password: this.password })
    .then(() => {
      this.$router.push(this.$store.getters.lastUri)
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