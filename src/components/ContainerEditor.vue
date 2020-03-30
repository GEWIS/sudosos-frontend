<template>
    <b-modal :id="'modal_' + container.id">
      <h5 class="em-title">Container aanpassen</h5>
      <p> {{ container.name }}</p>
    </b-modal>
</template>

<script>

export default {
  props: ['container'],
};
</script>

<style scoped>

</style>
