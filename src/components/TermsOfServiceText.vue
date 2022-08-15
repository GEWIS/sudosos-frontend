<template>
  <div>
    <p>SudoSOS Terms of Service - version 1.0 (14/08/2022)</p>
    <div v-html="tos" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import termsOfService from '@/TermsOfService.md';
import { marked } from 'marked';

@Component
export default class TermsOfServiceText extends Vue {
  tos = marked(termsOfService);
}
</script>

<style scoped>
</style>
