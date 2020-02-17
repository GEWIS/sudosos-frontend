<template>
  <div class="container-box">
    <h4>Containers</h4>
      <div class="container-head" v-b-toggle.container-1>Container 1</div>
        <b-collapse id="container-1" class="mt-1">
          <p>Some content</p>
        </b-collapse>
    <div div class="container-head" v-b-toggle.container-2>Container 2</div>
    <b-collapse id="container-2" class="mt-1">
      <p>Some other content</p>
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: 'Containers',
};
</script>

<style scoped>
  .container-box {
    border: 1px;
    border-style: solid;
    border-color: #DD2400;
    width: 350px;
  }
  .container-head {
    margin-bottom: 10px;
    background-color: silver;
  }
</style>
