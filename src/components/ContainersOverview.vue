<template>
  <div class="container-box">
    <h4>Containers</h4>
    <b-form-group>
      <div v-for="container in containers" :key="container.con_id">
        <container :value="container.con_id"></container>
      </div>
    </b-form-group>
  </div>

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

<style scoped>
  .container-box {
    border: 1px;
    border-style: solid;
    border-color: #D40000;
    width: 350px;
  }
  .container-head {
    margin-bottom: 10px;
    background-color: silver;
  }
  .cb_space {
    margin-right: 0.1rem;
  }
</style>
