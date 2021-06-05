<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="primary">
      <b-container fluid="md">
        <b-navbar-brand :to="{ name: 'home'}" active-class="" exact-active-class="">
          <span>SudoSOS</span>
          <img src="./assets/img/gewis-branding.svg"  alt="GEWIS Logo"/>
        </b-navbar-brand>

        <b-navbar-toggle target="nav-collapse" />

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item :to="{ name: 'transactions'}">{{ $t('app.Transactions') }}</b-nav-item>
            <b-nav-item :to="{ name: 'saldo'}">{{ $t('app.Saldo') }}</b-nav-item>
            <b-nav-item-dropdown :text="$t('app.Points of Sale')">
              <b-dropdown-item :to="{ name: 'pointOfSale'}">
                {{ $t('app.Overview') }}
              </b-dropdown-item>
              <b-dropdown-item :to="{ name: 'pointOfSaleRequest'}">
                {{ $t('app.Request') }}
              </b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item-dropdown :text="$t('app.Admin')">
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
            <b-nav-item-dropdown :text="$t('app.BAC')">
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
              <template v-slot:button-content>
                {{ currentUser.firstname }}
              </template>
              <b-dropdown-item :to="{ name: 'profile'}">{{ $t('app.Profile') }}</b-dropdown-item>
              <b-dropdown-item :to="{ name: 'signOut'}">{{ $t('app.Sign out') }}</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item
              v-if="currentUser.saldo"
              class="d-none d-md-inline"
              :to="{ name: 'saldo'}">
              {{ currentUser.saldo.toFormat() }}
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
      <router-view />
    </main>
    <footer class="footer">
      <b-container fluid="md">
        <b>&copy; {{ new Date().getFullYear() }} GEWIS</b>
      </b-container>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import eventBus from '@/eventbus';
import { User } from '@/entities/User';
import { ApiError } from '@/entities/ApiError';
import Formatters from '@/mixins/Formatters';
import UserModule from '@/store/modules/user';

import './styles/Navbar.scss';
import './styles/Footer.scss';

@Component
export default class App extends Formatters {
  private userState = getModule(UserModule);

  currentUser: User = {} as User;

  beforeMount() {
    this.userState.fetchUser();
    this.currentUser = this.userState.user;

    eventBus.$on('apiError', (error: ApiError) => {
      // Create the body for the toast error message, first make a div
      // then create three paragraph elements with the error messages
      const toastBody = this.$createElement('div',
        { class: [''] },
        [
          this.$createElement('p',
            { class: ['mb-2'] },
            `${String(this.$t(error.message))}`),
          this.$createElement('p',
            { class: ['mb-0'] },
            `${String(this.$t('apiError.message'))}:`),
          this.$createElement('p',
            { class: ['mb-0', 'small'] },
            `${error.error}`),
        ]);

      // Show the toast for 5 seconds
      this.$bvToast.toast(toastBody, {
        title: `Error ${error.status}`,
        autoHideDelay: 5000,
        variant: 'danger',
        appendToast: true,
      });
    });
  }

  localeChange(value: string): void {
    this.$root.$i18n.locale = value;

    eventBus.$emit('localeUpdated');
  }
}
</script>

<style lang="scss">
.router-link-active {
  opacity: 0.5;
}

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
  background-image: url('./assets/img/nl.svg');
}

#english {
  background-image: url('./assets/img/en.svg');
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
