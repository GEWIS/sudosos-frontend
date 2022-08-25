<template>
<div id="app">
  <transition
    name="fade"
    mode="out-in"
  >
    <router-view/>
  </transition>
</div>
</template>

<script lang="ts">
import { Component } from 'vue-property-decorator';
import eventBus from '@/eventbus';
import { ApiError } from '@/entities/ApiError';
import Formatters from '@/mixins/Formatters';

import './styles/Navbar.scss';
import './styles/Footer.scss';

@Component
export default class App extends Formatters {
  beforeMount() {
    if (this.$route.name === undefined) {
      this.$router.push({ name: 'home' });
    }

    eventBus.$on('apiError', (error: ApiError) => {
      // Create the body for the toast error message, first make a div
      // then create three paragraph elements with the error messages
      const toastBody = this.$createElement('div',
        { class: [''] },
        [
          this.$createElement('p',
            { class: ['mb-2'] },
            `${String(this.$t(error.message))}`),
        ]);

      // Show the toast for 5 seconds
      this.$bvToast.toast(toastBody, {
        title: `Error ${error.status}`,
        autoHideDelay: 5000,
        variant: 'danger',
        appendToast: true,
      });
    });

    eventBus.$on('success', (data: {message: string, title: string}) => {
      const toastBody = this.$createElement('div',
        { class: [''] },
        [
          this.$createElement('p',
            { class: ['mb-2'] },
            `${data.message}`),
        ]);

      // Show the toast for 5 seconds
      this.$bvToast.toast(toastBody, {
        title: data.title,
        autoHideDelay: 5000,
        variant: 'success',
        appendToast: true,
      });
    });
  }
}
</script>

<style lang="scss">
.router-link-active {
  opacity: 0.5;
}

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.125s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
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
