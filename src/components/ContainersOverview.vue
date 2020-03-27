<template>
  <b-col class="container-box">
    <h5 class="ml-lg-3 em-title">Containers</h5>
    <b-form-group>
      <div v-for="container in containers" :key="container.con_id">
        <container :value="container.con_id"></container>
      </div>
    </b-form-group>
  </b-col>

</template>

<script>
import Container from '@/components/Container.vue';

export default {
  name: 'Containers',
  // eslint-disable-next-line vue/no-unused-components
  components: { Container },
  data() {
    return {
      containers: [
        { con_id: 'a1' },
        { con_id: 'b2' },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
@import "./src/styles/Containers.scss";
</style>
