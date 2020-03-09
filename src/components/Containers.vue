<template>
  <div class="container-box">
    <h4>Containers</h4>
    <b-form-group>
      <div v-for="containerObject in containers" :key="containerObject.con_id">
        <container :value="containerObject.con_id"></container>
        <b>{{containerObject.con_id}}</b>
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
</style>
