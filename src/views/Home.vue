<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld :usr="user"  msg= "Welcome to Your Vue.js App"/>
  </div>
</template>

<script lang="ts">
// @ is an alias to /src
import HelloWorld from '@/components/HelloWorld.vue';
import { User } from '@/entities/User';

const usar : User = {
  id: '8549',
  firstName: 'Pieter',
  lastName: 'Ebbers',
  saldo: 12,
};

export default {
  name: 'home',
  components: {
    HelloWorld,
  },
  data() {
    return {
      dismissSecs: 10,
      dismissCountDown: 0,
      showDismissibleAlert: false,
      user: usar,
    };
  },
  methods: {

  },
};
</script>
