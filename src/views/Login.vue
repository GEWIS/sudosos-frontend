<template>
  <b-container fluid="md">
    <b-row class="vh-100 text-center" align-v="center">
      <b-col>
        <img class="m-4" src="./../assets/img/bier.png" />
        <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('login.SudoSOS Login') }}</h1>
        <b-form class="login-form">
          <b-form-group
            id="username-group"
            :label="$t('login.Username')"
            label-for="username"
          >
            <b-form-input
              id="username"
              v-model="username"
              type="text"
              :placeholder="$t('login.Enter username')"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            id="password-group"
            :label="$t('login.Password')"
            label-for="password"
          >
            <b-form-input
              id="password"
              v-model="password"
              type="password"
              :placeholder="$t('login.Enter password')"
            ></b-form-input>
          </b-form-group>

          <b-button @click="login" variant="primary">{{ $t('login.Login') }}</b-button>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import APIHelper from '@/mixins/APIHelper';

@Component
export default class Login extends Vue {
  username: string = '';

  password: string = '';

  // eslint-disable-next-line class-methods-use-this
  login() {
    console.log('hi');
    const x = APIHelper.postResource('authentication/mock', {
      userId: 0,
      nonce: '',
    });
    console.log(x);
  }
}
</script>

<style scoped lang="scss">
img {
  max-height: 150px;
}

.login-form {
  > * {
    max-width: 350px;
    margin: 0 auto;
  }

  > button {
    margin: 1rem 0;
    width: 100%;
    float: initial;
  }
}
</style>
