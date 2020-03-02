<template>
  <div class="container-box">
    <h4>Containers</h4>
    <b-form-group>
    <container con_id="1"></container>

    <container con_id="2"></container>
    </b-form-group>
  </div>

</template>

<script>
import Container from '@/components/Container.vue';

export default {
  name: 'Containers',
  components: { Container },
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
