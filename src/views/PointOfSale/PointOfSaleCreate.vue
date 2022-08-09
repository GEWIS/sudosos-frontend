<template>
  <POSCreate />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import POSCreate from '@/components/POSCreate.vue';

@Component({
  components: {
    POSCreate,
  },
})
export default class PointOfSaleRequest extends Vue {}
</script>
