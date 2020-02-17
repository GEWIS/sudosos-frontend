<template>
  <div>
    <table class="table table-striped">
      <thead>
      <tr>
        <th>Thumbnail</th>
        <th>Duur (ms)</th>
        <th>Actief</th>
        <th>Toegevoegd op</th>
        <th style="width: 0"></th>
        <th style="width: 0"></th>
      </tr>
      </thead>
      <tbody>
      <tr v-bind:key="ad.id" v-for="ad in advertisements">
        <td><img class="thumbnail" :src="ad.thumbnail" alt=""></td>
        <td>{{ ad.duration }}</td>
        <td>
          <font-awesome-icon icon="check-circle"/>
        </td>
        <td>{{ ad.added.toLocaleString() }}</td>
        <td><a href="https://gewis.nl/">
          <font-awesome-icon icon="pencil-alt" class="font-awesome-icon"/>
        </a></td>
        <td><a href="https://gewis.nl/">
          <font-awesome-icon icon="times" class="font-awesome-icon"/>
        </a></td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'Advertisements',
  props: ['advertisements'],
};
</script>

<style scoped lang="scss">
  @import '../styles/global/_table.scss';

  .thumbnail {
    width: 64px;
    height: 36px;
  }
</style>
