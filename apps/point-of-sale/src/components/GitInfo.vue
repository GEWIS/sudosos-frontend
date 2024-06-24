<template>
  <div class="absolute tag font-bold opacity-30"> {{branch}}#{{commit}} </div>
</template>

<script setup lang="ts">
const branch = __VITE_GIT_BRANCH__;
const commit = __VITE_GIT_COMMIT__;
</script>

<style scoped lang="scss">
.tag {
  bottom: 10px;
  right: 10px;
}
</style>
