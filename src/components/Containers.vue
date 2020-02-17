<template>
  <div class="container-box">
    <h4>Containers</h4>
    <b-form-group>
        <div class="container-head container d-inline-flex">
          <b-input-group>
            <b-form-checkbox inline id="cb_container_1"></b-form-checkbox>
            <div v-b-toggle.container-1>
              <div class="d-inline">
              <span>Container 1</span>
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
        <b-collapse id="container-1" class="mt-1">
          <p>Some content</p>
        </b-collapse>
        <div class="container-head" v-b-toggle.container-2>Container 2</div>
        <b-collapse id="container-2" class="mt-1">
          <p>Some other content</p>
        </b-collapse>
    </b-form-group>
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
    border-color: #D40000;
    width: 350px;
  }
  .container-head {
    margin-bottom: 10px;
    background-color: silver;
  }
</style>
