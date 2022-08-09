<template>
  <b-container fluid="md">
    <BeerMugs />
    <b-row class="vh-100 text-center" align-v="center">
      <b-col>
        <img id="login-image" class="m-4" src="~@/assets/img/bier.png" alt="Logo" />
        <h1 class="mb-1 mb-sm-2 mb-lg-3">{{ $t('login.SudoSOS Login') }}</h1>

        <b-form v-if="passwordResetMode === 0" class="login-form">
          <b-form-group
            id="email-group"
            :label="$t('login.Email')"
            label-for="email"
          >
            <b-form-input
              id="email"
              v-model="email"
              type="text"
              :placeholder="$t('login.Enter email')"
            ></b-form-input>
          </b-form-group>
          <b-button
            @click="resetPasswordRequest"
            variant="primary"
          >{{ $t('login.Reset') }}</b-button>
          <div
            class="password-reset-toggle"
            @click="hidePasswordReset"
          >{{ $t('login.Back to login') }}</div>
        </b-form>
        <div v-else-if="passwordResetMode === 1" class="login-form">
          <div>{{ $t('login.Email sent', { email: this.email}) }}</div>
          <div
            class="password-reset-toggle"
            @click="hidePasswordReset"
          >{{ $t('login.Back to login') }}</div>
        </div>
        <b-form v-else class="login-form">
          <h2 class="mb-2 mb-sm-3 mb-lg-4"><small>{{
              $t('login.Reset the password for', {email: this.email})
            }}</small></h2>
          <b-form-group
            id="password-group"
            :label="$t('login.New password')"
            label-for="password"
          >
            <b-form-input
              id="password"
              v-model="password"
              type="password"
              :placeholder="$t('login.Enter password')"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            id="password-2-group"
            :label="$t('login.Confirm password')"
            :state="nameState"
            :invalid-feedback="invalidName"
            label-for="password-2"
            class="mt-2"
          >
            <b-form-input
              id="password-2"
              v-model="password2"
              type="password"
              :placeholder="$t('login.Enter password again')"
            ></b-form-input>
          </b-form-group>
          <b-button
            @click="setNewPassword"
            variant="primary"
          >{{ $t('login.Set new password') }}</b-button>
          <div
            class="password-reset-toggle"
            @click="hidePasswordReset"
          >{{ $t('login.Back to login') }}</div>
        </b-form>
      </b-col>
    </b-row>
  </b-container>
</template>

<script lang="ts">
import * as dotenv from 'dotenv';
import { Component, Vue } from 'vue-property-decorator';
import APIHelper from '@/mixins/APIHelper';
import BeerMugs from '@/components/BeerMugs.vue';

dotenv.config();

@Component({
  components: {
    BeerMugs,
  },
})
export default class Login extends Vue {
  email: string = '';

  token: string = '';

  password: string = '';

  password2: string = '';

  /**
   * 0 -> Entering email
   * 1 -> Confirmation message
   * 2 -> providing new password
   */
  passwordResetMode: number = 0;

  /**
   * If a link is clicked in an email we need to use that
   * to set the new password later
   */
  beforeMount() {
    if (this.$route.query.token !== undefined && this.$route.query.email !== undefined) {
      this.passwordResetMode = 2;
      this.token = this.$route.query.token as string;
      this.email = this.$route.query.email as string;
    }
  }

  // Go back to the login page
  hidePasswordReset() {
    this.$router.push({ name: 'login' });
  }

  // Request password reset token, and email it to the email
  resetPasswordRequest() {
    APIHelper.postResource('authentication/local/reset', {
      accountMail: this.email,
    })
      .then(() => {
        this.passwordResetMode = 1;
      });
  }

  setNewPassword() {
    // Check if valid passwords were entered
    if (this.nameState) {
      APIHelper.putResource('authentication/local', {
        accountMail: this.email,
        token: this.token,
        password: this.password,
      })
        .then(() => {
          this.$router.push({ name: 'login' });
        });
    }
  }

  // Check if password are unequal
  get nameState() {
    return this.password2 === '' ? null : this.password === this.password2;
  }

  // Return appropriate validating message for name
  get invalidName() {
    if (!this.nameState && this.nameState !== null) {
      return this.$t('login.Passwords not equal').toString();
    }

    return '';
  }
}
</script>

<style scoped lang="scss">
#login-image {
  max-height: 150px;
}

.login-form {
  .password-reset-toggle {
    text-decoration: underline;
  }

  .password-reset-toggle:hover {
    cursor: pointer;
  }

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
