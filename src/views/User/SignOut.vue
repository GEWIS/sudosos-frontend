<template>
  <b-container fluid="lg">
    <h1 class="text-center">{{ $t('signOut.message') }}</h1>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

  @Component
export default class SignOut extends Vue {
  beforeMount() {
    // TODO: Add signing out here

    this.$router.push({ name: 'home' });
  }
}
</script>

<style lang="scss" scoped>

</style>
