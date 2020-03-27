<template>
  <div class="container-block">
    <div class="container-head container d-inline-flex">
      <!-- Checkbox -->
      <b-input-group style="width: 5%" class="cb_space">
        <!-- TODO: Implement selecting -->
        <b-form-checkbox :id="'cb_' + containerId"></b-form-checkbox>
      </b-input-group>
        <!-- The clickable area -->
        <div v-b-toggle="containerId"
             v-on:click="isOpen = !isOpen"
             class="d-inline container-title">
          <div class="d-inline">
            <span>{{ containerId }}</span>
          </div>
          <font-awesome-icon pull="right" icon="angle-down"
              v-show="!isOpen" class="icon-space"></font-awesome-icon>
          <font-awesome-icon pull="right" icon="angle-up"
              v-show="isOpen" class="icon-space"></font-awesome-icon>
        </div>
    </div>

    <!-- The container itself -->
    <b-collapse :id="containerId" class="mt-1">
      <b-container fluid="md">
        <!-- TODO: fix images -->
        <b-row>
          <b-col v-for="item in items" :key="item.id" class="product">
            <b-col>
              <b-row class="product-image">
                  <img v-bind:src="item.img" />
              </b-row>
              <b-row class="product-name">
                {{ item.name }}
              </b-row>
            </b-col>

          </b-col>
          <!--<b-col> (this is to test the compiling)
            <img src="../assets/img/beugel.png" height="15%"/>
          </b-col>-->
        </b-row>
      </b-container>
    </b-collapse>
  </div>
</template>

<script>
export default {
  data() {
    return {
      containerId: this.value,
      isOpen: false,
      items: [
        { id: 1, name: 'beugel', img: '../assets/img/beugel.png' },
        { id: 2, name: 'radler (laf!)', img: '../assets/img/beugel.png' },
        { id: 3, name: 'cola', img: '../assets/img/beugel.png' },
        { id: 4, name: 'ijsthee', img: '../assets/img/beugel.png' },
        { id: 5, name: 'beugel', img: '../assets/img/beugel.png' },
        { id: 6, name: 'radler (laf!)', img: '../assets/img/beugel.png' },
        { id: 7, name: 'cola', img: '../assets/img/beugel.png' },
        { id: 8, name: 'ijsthee', img: '../assets/img/beugel.png' },
      ],
    };
  },
  props: ['value'],
};
</script>

<style scoped lang="scss">
  @import "./src/styles/Containers.scss";
</style>
