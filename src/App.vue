<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="primary">
      <b-container fluid="md">
      <b-navbar-brand to="/" active-class="" exact-active-class="">
        <span>SudoSOS</span>
        <img src="./assets/img/gewis-branding.svg"  alt="GEWIS Logo"/>
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/transactions">{{ $t('app.Transactions') }}</b-nav-item>
          <b-nav-item to="/saldo">{{ $t('app.Saldo') }}</b-nav-item>
          <b-nav-item-dropdown :text="$t('app.Points of Sale')">
            <b-dropdown-item to="/point-of-sale">{{ $t('app.Overview') }}</b-dropdown-item>
            <b-dropdown-item to="/point-of-sale-request">{{ $t('app.Request') }}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown :text="$t('app.Admin')">
            <b-dropdown-item to="/manage-pos">{{ $t('app.Overview') }}</b-dropdown-item>
            <b-dropdown-item to="/screens">{{ $t('app.Screens') }}</b-dropdown-item>
            <b-dropdown-item to="/advertisements">{{ $t('app.Advertisements') }}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown :text="$t('app.BAC')">
            <b-dropdown-item to="/flagged-transactions">
              {{ $t('app.Flagged transactions') }}
            </b-dropdown-item>
            <b-dropdown-item to="/manage-products">{{ $t('app.Manage products') }}</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">

          <b-nav-item-dropdown right>
            <template v-slot:button-content>
              {{ currentUser.firstName }}
            </template>
            <b-dropdown-item to="/profile">{{ $t('app.Profile') }}</b-dropdown-item>
            <b-dropdown-item to="/sign-out">{{ $t('app.Sign out') }}</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item to="/saldo" active-class="" exact-active-class="">
            € {{ currentUser.balance }}
          </b-nav-item>
          <b-nav-item-dropdown right>
            <template v-slot:button-content>
              <font-awesome-icon icon="globe-europe"></font-awesome-icon>
            </template>
            <b-dropdown-item
              :class="{'router-link-active' : $i18n.locale === 'nl'}"
              :disabled="$i18n.locale === 'nl'"
              @click="$i18n.locale = 'nl'">
              <span class="flag-icon" id="dutch"></span>{{ $t('app.Netherlands') }}
            </b-dropdown-item>
            <b-dropdown-item
              :class="{'router-link-active' : $i18n.locale === 'en'}"
              :disabled="$i18n.locale === 'en'"
              @click="$i18n.locale = 'en'">
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
import { Component, Vue } from 'vue-property-decorator';

import './styles/Navbar.scss';
import './styles/Footer.scss';

export default class App extends Vue {
  public currentUser: Object = {
    balance: 15.00,
    firstName: 'Rick',
  };
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
</style>
