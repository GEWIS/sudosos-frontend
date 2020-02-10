<template>
  <div class="hello">
    <h1>{{ usr.firstName + " - " + usr.lastName + "! " }}</h1>
    <h2>{{ msg }}</h2>
  </div>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { User } from '@/entities/User';

@Component
export default class HelloWorld extends Vue {
  @Prop() private msg!: string;

  @Prop({ type: Object as () => User }) private usr!: User;
}

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
