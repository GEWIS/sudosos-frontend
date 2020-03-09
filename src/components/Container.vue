<template>
  <div class="container-block">
    <div class="container-head container d-inline-flex">
      <b-input-group>
        <b-form-checkbox inline id="cb_container1" class="cb_space"></b-form-checkbox>
        <div v-b-toggle>
          <div class="d-inline">
            <span>{{ containerId }}</span>
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
    <b-collapse :id="containerId" class="mt-1">
      <p>Some content</p>
    </b-collapse>
  </div>
</template>

<script>
export default {
  data() {
    return {
      containerId: this.value,
    };
  },
  mounted() {
    console.log(this.value);
  },
  props: ['value'],
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
