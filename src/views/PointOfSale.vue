<template>
    <div class="pointOfSale">
      <h1>Point of sale page</h1>
      <Containers></Containers>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Containers from '@/components/Containers.vue';

@Component({
  components: {
    Containers,
  },
})

export default class PointOfSale extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
