<template>
  <div class="container-block">
    <div class="container-head container d-inline-flex">
      <b-input-group>
        <!-- TODO: Implement selecting -->
        <b-form-checkbox inline :id="'cb_' + containerId" class="cb_space"></b-form-checkbox>
        <div v-b-toggle="containerId" v-on:click="isOpen = !isOpen">
          <div class="d-inline">
            <span>{{ containerId }}</span>
          </div>
          <div class="d-inline text-right">
            <font-awesome-icon pull="right" icon="caret-down" v-show="!isOpen"></font-awesome-icon>
            <font-awesome-icon pull="right" icon="caret-up" v-show="isOpen"></font-awesome-icon>
          </div>
        </div>
      </b-input-group>
    </div>
    <b-collapse :id="containerId" class="mt-1">
      <b-container fluid="md">
        <!-- TODO: fix images -->
        <b-row>
          <b-col v-for="item in items" :key="item.id" class="itemSpace">
            {{ item.name }}
            <img v-bind:src="item.img" />
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

<style scoped>
  .container-head {
    background-color: silver;
    margin-top: 10px;
  }
  .cb_space {
    margin-right: 0.1rem;
  }

  .itemSpace {
    background-color: #DFDFDF;
    border: 1px solid #1b4b72;
    margin: 0.1em;
  }
</style>
