<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">{{ $t('pointOfSaleOverview.Point of sale overview') }}</h1>
    <b-row>
      <b-col cols="12" md="6" class="mb-md-0 mb-3">
        <POSOverview />
      </b-col>
    </b-row>
    </b-container>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import POSOverview from '@/components/POSOverview.vue';

@Component({
  components: { POSOverview },
})

export default class PointOfSaleOverview extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
