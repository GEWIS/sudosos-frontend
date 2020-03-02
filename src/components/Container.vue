<template>
  <div class="container-block">
    <div class="container-head container d-inline-flex">
      <b-input-group>
        <b-form-checkbox inline id="cb_container1" class="cb_space"></b-form-checkbox>
        <div v-b-toggle.container1>
          <div class="d-inline">
            <span>{{ this.name }}</span>
          </div>
          <div class="d-inline text-right">
            <font-awesome-icon
              pull="right"
              icon="caret-down">
            </font-awesome-icon>
          </div>
        </div>
      </b-input-group>
    </div>
    <b-collapse id="container1" class="mt-1">
      <p>Some content</p>
    </b-collapse>
  </div>
</template>

<script>
export default {
  name: 'Container',
  data() {
    return {
      name: 'TestContainer',
    };
  },
};
</script>

<style scoped>
  .container-head {
    margin-bottom: 10px;
    background-color: silver;
  }
  .cb_space {
    margin-right: 0.1rem;
  }
</style>
