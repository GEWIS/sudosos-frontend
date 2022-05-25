<template>
  <div>
    <IncreaseSaldo />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import CurrentSaldo from '@/components/CurrentSaldo.vue';
import IncreaseSaldo from '@/components/IncreaseSaldo.vue';
// import TransactionEditor from '@/components/TransactionEditor';

@Component({
  components: {
    IncreaseSaldo,
  },
})
export default class Home extends Vue {
}
</script>
