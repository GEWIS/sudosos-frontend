<template>
  <div
    class="rounded-xl flex items-center font-semibold text-lg my-1 md:my-3 py-3 shadow-sm text-center user-row"
    :class="[rowBackground, { inactive: !active }]"
    @click="selectUser"
  >
    {{ displayName() }}
    <i v-if="shouldShowAge()" class="pi pi-user-minus" />
  </div>
</template>

<script setup lang="ts">
import { GewisUserResponse, UserResponse } from '@sudosos/sudosos-client';
import { useCartStore } from '@/stores/cart.store';
import { rowBackground } from '@/services/PointOfSaleSwitchService';

const props = defineProps({
  user: {
    type: Object as () => UserResponse | GewisUserResponse,
    required: true,
  },
});

const cartStore = useCartStore();
const selectUser = () => {
  void cartStore.setBuyer(props.user);
};

const aged = ['MEMBER', 'LOCAL_USER', 'LOCAL_ADMIN'];

const shouldShowAge = () => {
  return !props.user.ofAge && active && aged.includes(props.user.type);
};

const displayName = () => {
  let name = props.user.firstName;
  if (props.user) {
    if (props.user.nickname) name += ` "${props.user.nickname}"`;
  }
  name += ' ' + props.user.lastName;

  if ('gewisId' in props.user && props.user.gewisId) {
    name += ` - ${props.user?.gewisId}`;
  } else {
    switch (props.user?.type) {
      case 'LOCAL_USER':
        name += ` - Local`;
        break;
    }
  }
  return name;
};

const canUse = props.user.acceptedToS !== 'NOT_ACCEPTED';
const active = canUse;
</script>

<style scoped lang="scss">
.user-row {
  padding-left: 75px;
}

.inactive {
  color: grey;
}
</style>
