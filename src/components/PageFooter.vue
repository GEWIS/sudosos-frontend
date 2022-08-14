<template>
  <footer class="footer">
    <b-container fluid="md">
      <b>&copy; {{ new Date().getFullYear() }} GEWIS</b>
    </b-container>
  </footer>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import '../styles/Footer.scss';

@Component
export default class PageFooter extends Vue {}
</script>

<style scoped>

</style>
