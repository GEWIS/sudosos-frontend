<template>
  <b-container fluid="lg">
    <h1 class="mb-2 mb-sm-3 mb-lg-4">
      Schandpaal
    </h1>
  </b-container>
</template>

<script>
import { getAllBalances } from '@/api/balance';
import getSchandpaal from '@/api/schandpaal';

export default {
  name: 'Schandpaal',
  async beforeMount() {
    const schandpaal = await getSchandpaal();
    console.log(schandpaal);
  },
};
</script>

<style scoped>

</style>
