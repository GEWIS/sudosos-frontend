<template>
  <div id="app">
    <nav class="navbar navbar-expand-md">
      <div class="container">
        <a class="navbar-brand" href="#">
          <span>SudoSOS</span>
          <img src="./assets/img/gewis-branding.svg"  alt="GEWIS Logo"/>
        </a>
        <button
          class="navbar-toggler collapsed"
          type="button"
          data-toggle="collapse"
          data-target="mainNavBar"
          aria-controls="mainNavBar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="navbar-collapse collapse" id="mainNavBar" style>
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <router-link class="nav-link" to="/">Home</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/transactions">Transacties</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/point-of-sale">Point of sale</router-link>
            </li>
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="management-dropdown"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                Beheer
              </a>
              <div class="dropdown-menu" aria-labelledby="management-dropdown">
                <router-link class="dropdown-item" to="/messages-pos">Berichten POS</router-link>
                <router-link class="dropdown-item" to="/screens">Schermen</router-link>
                <router-link class="dropdown-item" to="/advertisements">Advertenties</router-link>
                <router-link class="dropdown-item" to="/points-of-sale">Points of Sale</router-link>
              </div>
            </li>
          </ul>
          <ul class="navbar-nav ml-auto user-information">
            <li class="nav-item dropdown">
              <a
                class="nav-link dropdown-toggle"
                href="#"
                id="user-dropdown"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false">
                {{ currentUser.firstName }}
              </a>
              <div class="dropdown-menu" aria-labelledby="user-dropdown">
                <router-link class="dropdown-item" to="/messages-pos">Berichten POS</router-link>
                <router-link class="dropdown-item" to="/screens">Schermen</router-link>
                <router-link class="dropdown-item" to="/advertisements">Advertenties</router-link>
                <router-link class="dropdown-item" to="/points-of-sale">Points of Sale</router-link>
              </div>
            </li>
            <li class="nav-item">
              <!-- TODO: Formatter voor currency gebruiken -->
              <a>€ {{ currentUser.balance }}</a>
              </li>
          </ul>
        </div>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
    <footer class="footer">
      <div class="container">
        <b>&copy; {{ new Date().getFullYear() }} GEWIS</b>
      </div>
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
