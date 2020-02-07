<template>
  <div class="card text-left saldoCard" style="width: 18rem;">
    <div class="card-header">
      <h1>Your balance</h1>
    </div>
    <div class="card-body">
      <div class="card-text">
        <h3>&euro;{{ currentBalance.toString().replace('.', ',') }}</h3>
      </div>
    </div>
    <div class="card-footer footer">
      <p>Some links or something</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      currentBalance: 152.78,
    };
  },
  name: 'CurrentSaldo',
};
</script>

<style scoped>

</style>
