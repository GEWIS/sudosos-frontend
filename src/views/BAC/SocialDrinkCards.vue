<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">
      {{ $t('socialDrinkCards.Social drink cards overview') }}
    </h1>

    <SocialDrinkCardTable></SocialDrinkCardTable>
  </b-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import SocialDrinkCardTable from '@/components/SocialDrinkCardTable.vue';

  @Component({
    components: { SocialDrinkCardTable },
  })
export default class SocialDrinkCards extends Vue {

}
</script>

<style scoped>

</style>
