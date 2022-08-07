<template>
  <POSCreate :posID="id" />
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import POSCreate from '@/components/POSCreate.vue';

@Component({
  components: {
    POSCreate,
  },
})
export default class PointOfSaleEdit extends Vue {
  @Prop() id!: number;
}
</script>
