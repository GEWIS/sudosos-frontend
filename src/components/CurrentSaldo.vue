<template>
  <div class="card text-left saldoCard" style="width: 18rem;">
    <div class="card-header">
      <h2>Your balance</h2>
    </div>
    <div class="card-body">
      <div class="card-text">
        <h4>&euro;{{ currentBalance.toString().replace('.', ',') }}</h4>
      </div>
    </div>
    <div class="card-footer footer">
      <p><a href="#">Increase balance online</a></p>
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
