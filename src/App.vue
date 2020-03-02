<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="primary">
      <b-container fluid="md">
      <b-navbar-brand to="/">
        <span>SudoSOS</span>
        <img src="./assets/img/gewis-branding.svg"  alt="GEWIS Logo"/>
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item to="/transactions">Transactions</b-nav-item>
          <b-nav-item to="/saldo">Saldo</b-nav-item>
          <b-nav-item-dropdown text="Point of Sale">
            <b-dropdown-item to="/point-of-sale">Overview</b-dropdown-item>
            <b-dropdown-item to="/point-of-sale-request">Request</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown text="Admin">
            <b-dropdown-item to="/manage-pos">Overview</b-dropdown-item>
            <b-dropdown-item to="/screens">Screens</b-dropdown-item>
            <b-dropdown-item to="/advertisements">Advertisements</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown text="BAC">
            <b-dropdown-item to="/flagged-transactions">Flagged transactions</b-dropdown-item>
            <b-dropdown-item to="/manage-products">Manage products</b-dropdown-item>
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">

          <b-nav-item-dropdown right>
            <template v-slot:button-content>
              {{ currentUser.firstName }}
            </template>
            <b-dropdown-item href="/profile">Profile</b-dropdown-item>
            <b-dropdown-item to="/sign-out">Sign out</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item to="/saldo">€ {{ currentUser.balance }}</b-nav-item>
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
</style>
