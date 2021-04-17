<template>
  <b-container fluid="lg">
    <UserTable />
  </b-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator';
import UserTable from '@/components/UserTable.vue';

@Component({
  components: {
    UserTable,
  },
})
export default class UserOverview extends Vue {

}
</script>

<style scoped>

</style>
