<template>
  <b-container class="container-block">
    <div class="container-head container d-inline-flex">
      <!-- Checkbox -->
      <b-input-group style="width: 5%">
        <!-- TODO: Implement selecting -->
        <b-form-checkbox :id="'cb_' + container.con_id" class="cb"></b-form-checkbox>
      </b-input-group>
        <!-- The clickable area -->
        <div v-b-toggle="container.con_id"
             v-on:click="isOpen = !isOpen"
             class="d-inline container-title">
          <div class="d-inline">
            <span>{{ container.con_id }}
              <font-awesome-icon icon="pencil-alt" v-show="container.editable"
              class="edit-icon" size="sm">
              </font-awesome-icon>
            </span>
          </div>
          <font-awesome-icon pull="right" icon="angle-down"
              v-show="!isOpen" class="icon-space"></font-awesome-icon>
          <font-awesome-icon pull="right" icon="angle-up"
              v-show="isOpen" class="icon-space"></font-awesome-icon>
        </div>
    </div>

    <!-- The container itself -->
    <b-collapse :id="container.con_id" class="mt-1">
      <b-container>
        <!-- TODO: fix images -->
        <b-row style="width: 100%">
          <b-col v-for="item in items" :key="item.id" class="justify-content-center"
                 cols="12" sm="auto">
            <b-col class="product">
              <b-row class="product-image" align-h="center">
                  <img v-bind:src="item.img" />
              </b-row>
              <b-row class="product-name" align-h="center">
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
  </b-container>
</template>

<script>
export default {
  data() {
    return {
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
  props: ['container'],
};
</script>

<style scoped lang="scss">
  @import "./src/styles/Containers.scss";
</style>
