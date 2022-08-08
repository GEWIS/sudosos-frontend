<template>
  <b-container fluid="md">
    <BeerMugs />
    <b-row class="vh-100 text-center" align-v="center">
      <b-col>
        <img id="login-image" class="m-4" src="~@/assets/img/bier.png" alt="Logo" />
        <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('login.SudoSOS Login') }}</h1>
        <b-form class="login-form">
          <b-button @click="loginViaGEWIS" variant="success">
            <img src="~@/assets/img/gewis-branding.svg" />
            {{ $t("login.Login via GEWIS") }}
          </b-button>

          <hr class="mt-5 mb-4">

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
            class="mt-2"
          >
            <b-form-input
              id="password"
              v-model="password"
              type="password"
              :placeholder="$t('login.Enter password')"
              v-on:keydown.enter="login"
            ></b-form-input>
          </b-form-group>

          <b-button @click="login" variant="primary">{{ $t('login.Login') }}</b-button>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import * as dotenv from 'dotenv';
import { Component, Vue } from 'vue-property-decorator';
import APIHelper from '@/mixins/APIHelper';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import { v4 as uuid } from 'uuid';
import { LoginResponse } from '@/entities/APIResponses';
import UserTransformer from '@/transformers/UserTransformer';
import { User } from '@/entities/User';
import BeerMugs from '@/components/BeerMugs.vue';

dotenv.config();

@Component({
  components: {
    BeerMugs,
  },
})
export default class Login extends Vue {
  private userState = getModule(UserModule);

  username: string = '';

  password: string = '';

  /**
   * If we are being redirected from the GEWIS webserver with a login token we need to use that
   * to directly login
   */
  beforeMount() {
    if (this.$route.query.token !== undefined) {
      const { token } = this.$route.query;
      APIHelper.postResource('authentication/gewisweb', {
        token,
        nonce: uuid(),
      })
        .then((res: LoginResponse) => {
          this.loginSuccesful(res);
        }).catch((e) => console.error(e));
    }
  }

  /**
   * If the user logs in via entering a username/password combo we need to send a
   * different request the API
   */
  login() {
    // If the username is an email, it is an external account
    // and we authenticate using the local account database
    if (this.username.includes('@')) {
      APIHelper.postResource('authentication/local', {
        accountMail: this.username,
        password: this.password,
      })
        .then((res: LoginResponse) => {
          this.loginSuccesful(res);
        });
    } else {
      APIHelper.postResource('authentication/GEWIS/LDAP', {
        accountName: this.username,
        password: this.password,
      })
        .then((res: LoginResponse) => {
          this.loginSuccesful(res);
        });
    }
  }

  /**
   * If the API has succesfully logged in the user we need to store the returned
   * user data and token at the right place. It's also nice to send them to the homepage
   */
  loginSuccesful(info: LoginResponse) {
    this.userState.extractResponse(info);
    APIHelper.setToken(info.token);
    this.$router.push({ name: 'home' });
  }

  /**
   * Redirects to the GEWIS app such that users can login with their GEWIS credentials for SudoSOS
   */
  // eslint-disable-next-line class-methods-use-this
  loginViaGEWIS() {
    window.location.href = `https://gewis.nl/token/${process.env.VUE_APP_GEWIS_TOKEN}`;
  }
}
</script>

<style scoped lang="scss">
#login-image {
  max-height: 150px;
}

.login-form {
  > * {
    max-width: 350px;
    margin: 0 auto;
  }

  > button {
    margin: 1rem auto;
    width: 100%;
    float: initial;
    max-height: 38px;
    display: block;

    > img {
      max-height: 24px;
      margin-top: -4px;
      margin-right: 1rem;
    }
  }

  > button:hover {
    > img {
      filter: invert(15%)
              sepia(16%)
              saturate(1327%)
              hue-rotate(42deg)
              brightness(86%)
              contrast(83%);
    }
  }
}
</style>
