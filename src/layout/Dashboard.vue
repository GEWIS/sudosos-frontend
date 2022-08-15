<template>
  <div>
    <b-navbar toggleable="md" type="dark" variant="primary">
      <b-container fluid="md">
        <b-navbar-brand :to="{ name: 'home'}" active-class="" exact-active-class="">
          <span>SudoSOS</span>
          <img src="./../assets/img/gewis-branding.svg"  alt="GEWIS Logo"/>
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse" />

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item :to="{ name: 'transactions'}">{{ $t('app.Transactions') }}</b-nav-item>
            <b-nav-item :to="{ name: 'saldo'}">{{ $t('app.Saldo') }}</b-nav-item>
            <b-nav-item-dropdown :text="$t('app.Points of Sale')"
                                 v-if="sellerRole">
              <b-dropdown-item :to="{ name: 'pointOfSale'}">
                {{ $t('app.Overview') }}
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'pointOfSaleRequest'}">
                {{ $t('app.Create') }}
              </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown :text="$t('app.Admin')" v-if="adminRole">
              <b-dropdown-item :to="{ name: 'managePointOfSale'}">
                {{ $t('app.Manage POS') }}
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'screens'}">
                {{ $t('app.Screens') }}
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'banners'}">
                {{ $t('app.Banners') }}
              </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown :text="$t('app.BAC')" v-if="BACRole">
              <b-dropdown-item :to="{ name: 'managePointOfSale'}">
                {{ $t('app.Manage POS') }}
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'userOverview'}">
                {{ $t('app.User overview') }}
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'flaggedTransactions'}">
                {{ $t('app.Flagged transactions') }}
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'manageProducts'}">
                {{ $t('app.Manage products') }}
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'borrelkaartOverview'}">
                {{ $t('app.Social drink cards') }}
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>

          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">

            <b-nav-item-dropdown right>
              <template v-slot:button-content >
                <!-- TODO: Make sure only SUDOSOS workgroup members have this -->
                <img id="beerIcon" src="../assets/img/bier.png" alt="beer"
                     :key="userState.self.firstname">

                {{ userState.self.firstname }}
              </template>
              <b-dropdown-item :to="{ name: 'profile'}">{{ $t('app.Profile') }}</b-dropdown-item>
              <b-dropdown-item @click="logout">{{ $t('app.Sign out') }}</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item
              v-if="userState.self.saldo"
              class="d-none d-md-inline"
              :to="{ name: 'saldo'}">
              {{ userState.self.saldo.toFormat() }}
            </b-nav-item>
            <b-nav-item-dropdown right>
              <template v-slot:button-content>
                <font-awesome-icon icon="globe-europe" />
              </template>
              <b-dropdown-item
                :class="{'router-link-active' : $i18n.locale === 'nl'}"
                :disabled="$i18n.locale === 'nl'"
                @click="localeChange('nl')">
                <span class="flag-icon" id="dutch"></span>{{ $t('app.Netherlands') }}
              </b-dropdown-item>
              <b-dropdown-item
                :class="{'router-link-active' : $i18n.locale === 'en'}"
                :disabled="$i18n.locale === 'en'"
                @click="localeChange('en')">
                <span class="flag-icon" id="english"></span>{{ $t('app.English') }}
              </b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-container>
    </b-navbar>
    <main>
      <transition
        name="fade"
        mode="out-in"
      >
        <router-view/>
      </transition>
    </main>
    <page-footer />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import eventBus from '@/eventbus';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import Logout from '@/mixins/Logout';
import APIHelper from '@/mixins/APIHelper';
import { LoginResponse } from '@/entities/APIResponses';
import UserTransformer from '@/transformers/UserTransformer';
import { User } from '@/entities/User';
import jwtDecode, { JwtPayload } from 'jwt-decode';
import PageFooter from '@/components/PageFooter.vue';

@Component({
  components: { PageFooter },
})
export default class Dashboard extends Vue {
  userState = getModule(UserModule);

  get sellerRole() {
    return this.userState.userRoles.indexOf(this.userState.types.SELLER) !== -1;
  }

  get adminRole() {
    return this.userState.userRoles.indexOf(this.userState.types.BOARD) !== -1;
  }

  get BACRole() {
    return this.userState.userRoles.indexOf(this.userState.types.BAC) !== -1;
  }

  async beforeMount() {
    APIHelper.getToken();
    if (Object.keys(this.userState.self).length <= 0) {
      await this.userState.fetchSelf(true);
    }
  }

  /**
   * If the locale is changed make sure this is emitted via the eventBus, this ensures everything
   * that has a fixed locale will also correctly update
   */
  localeChange(value: string): void {
    this.$root.$i18n.locale = value;

    eventBus.$emit('localeUpdated');
  }

  logout() {
    Logout.logout(undefined, this.$router);
  }
}

</script>

<style lang="scss">
.flag-icon {
  background-size: contain;
  background-position: 50%;
  background-repeat: no-repeat;
  position: relative;
  display: inline-block;
  width: 1.33333333em;
  line-height: 1em;
  margin-right: 1em;
}

.flag-icon::before {
  content: '\00a0';
}

#dutch {
  background-image: url('./../assets/img/nl.svg');
}

#english {
  background-image: url('./../assets/img/en.svg');
}

#beerIcon {
  height: 12px;
}

@media print {
  nav, footer {
    display: none !important;
  }

  main {
    margin: 0 !important;
  }
}
</style>
