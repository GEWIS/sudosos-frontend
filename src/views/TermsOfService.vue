<template>
  <b-container fluid="lg" class="mt-lg-4 mt-2 mb-4">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('termsOfService.acceptFirst') }}</h1>
    <p>{{ $t('termsOfService.description') }}</p>
    <hr />
    <terms-of-service-text />
    <hr>
    <p>{{ $t('termsOfService.extensiveDataProcessing') }}</p>
    <div class="checkbox-data">
      <b-form-checkbox
        id="checkbox-data"
        v-model="extensiveDataProcessing"
        name="checkbox-data"
      >
        {{ $t('termsOfService.agreeData') }}
      </b-form-checkbox>
    </div>
    <div class="tos-button-box">
      <b-button variant="secondary" @click="signOut">{{ $t('app.Sign out') }}</b-button>
      <b-button variant="primary" @click="acceptTermsOfService">
        <b-spinner class="spinner" v-if="loading" small />
        {{ $t('termsOfService.agreeToS') }}
      </b-button>
    </div>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import TermsOfServiceText from '@/components/TermsOfServiceText.vue';
import Logout from '@/mixins/Logout';
import { acceptToS } from '@/api/users';
import APIHelper from '@/mixins/APIHelper';
import { LoginResponse } from '@/entities/APIResponses';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';

@Component({
  components: {
    TermsOfServiceText,
  },
})
export default class TermsOfService extends Vue {
  private userState = getModule(UserModule);

  private extensiveDataProcessing: boolean = false;

  private loading: boolean = false;

  beforeMount() {
    this.extensiveDataProcessing = this.userState.self.extensiveDataProcessing;
  }

  signOut() {
    Logout.logout(undefined, this.$router);
  }

  async acceptTermsOfService() {
    this.loading = true;
    await acceptToS({ extensiveDataProcessing: this.extensiveDataProcessing });
    const res: LoginResponse = await APIHelper.getResource('authentication/refreshToken');
    this.userState.extractResponse(res);
    APIHelper.setToken(res.token);
    this.$router.push({ name: 'home' });
  }
}
</script>

<style scoped lang="scss">
.checkbox-data {
  font-weight: 600;
}

.tos-button-box {
  display: flex;
  margin-top: 1rem;

  button {
    margin-right: 0.25rem;

    .spinner {
      margin-right: 4px;
    }
  }
}
</style>
