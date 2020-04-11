<template>
  <div>
    <h5 class="em-title">{{ $t('containersOverview.Containers') }}</h5>
    <b-form-group>
      <div v-for="container in containers" :key="container.con_id">
        <container :container="container"></container>
      </div>
    </b-form-group>
  </div>
</template>

<script>
import Container from '@/components/Container.vue';

export default {
  name: 'Containers',
  components: { Container },
  data() {
    return {
      containers: [
        { con_id: 'a1', editable: false },
        { con_id: 'b2', editable: true },
      ],
    };
  },
};
</script>

<style scoped lang="scss">
@import "./src/styles/Containers.scss";
</style>
