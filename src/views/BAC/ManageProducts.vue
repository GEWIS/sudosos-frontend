<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('manageProducts.Manage products') }}</h1>
  </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component({
  components: {},
})

export default class ManageProducts extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
