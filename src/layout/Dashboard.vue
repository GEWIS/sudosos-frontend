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
                {{ userState.user.firstname }}
              </template>
              <b-dropdown-item :to="{ name: 'profile'}">{{ $t('app.Profile') }}</b-dropdown-item>
              <b-dropdown-item @click="logout">{{ $t('app.Sign out') }}</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item
              v-if="userState.user.saldo"
              class="d-none d-md-inline"
              :to="{ name: 'saldo'}">
              {{ userState.user.saldo.toFormat() }}
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
    <footer class="footer">
      <b-container fluid="md">
        <b>&copy; {{ new Date().getFullYear() }} GEWIS</b>
      </b-container>
    </footer>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import eventBus from '@/eventbus';
import { getModule } from 'vuex-module-decorators';
import UserModule from '@/store/modules/user';
import { User } from '@/entities/User';
import APIHelper from '@/mixins/APIHelper';

@Component
export default class Dashboard extends Vue {
  userState = getModule(UserModule);

  /**
   * If the locale is changed make sure this is emitted via the eventBus, this ensures everything
   * that has a fixed locale will also correctly update
   */
  localeChange(value: string): void {
    this.$root.$i18n.locale = value;

    eventBus.$emit('localeUpdated');
  }

  /**
   * Clears the JWT token and forwards the user to the login page
   */
  logout() {
    APIHelper.clearToken();
    this.$router.push({ name: 'login' });
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

@media print {
  nav, footer {
    display: none !important;
  }

  main {
    margin: 0 !important;
  }
}
</style>
