<template>
  <div id="beerMugContainer">
    <span class="beerMug"></span>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import setupBeerMugs from '../mixins/beerMugs';

@Component
export default class Login extends Vue {
  // eslint-disable-next-line class-methods-use-this
  mounted() {
    setupBeerMugs();
  }
}
</script>

<style lang="scss" scoped>

#beerMugContainer {
  position: absolute;
  left: 0;
  top: 0;
  display: none;

.beerMug {
  position: fixed;
  user-select: none;
  pointer-events: none;
  width: 50px;
  height: 50px;
  background-image: url("~@/assets/img/bier.png");
  background-size: 100%;
}
}
</style>
