<template>
  <b-container fluid="md">
      <h1>Point of sale page</h1>
      <Container></Container>
    </b-container>

</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Container from '@/components/Container.vue';

@Component({
  components: {
    Container,
  },
})

export default class PointOfSale extends Vue {
}
</script>

<style lang="scss" scoped>

</style>
