<template>
  <div class="main-content">
    <div v-if="loggingIn" class="items-center flex h-full justify-center">
      <div>
        <ProgressSpinner aria-label="Loading" />
      </div>
    </div>
    <div v-else>
      <div class="keypad-container m-auto pt-6">
        <div class="display-container" :class="displayContainerClasses">
          <KeypadDisplayComponent
            :external="external"
            :is-active="enteringUserId"
            :pin-code="pinCode"
            :user-id="userId"
            :wrong-pin="wrongPin"
            @focus:passcode="focusPasscode"
            @focus:userid="focusUserId"
          />
        </div>
        <KeypadComponent
          @backspace="handleBackspace"
          @continue="handleContinue"
          @external="handleExternal"
          @input="handleInput"
        />
      </div>
      <BannerComponent v-if="shouldShowBanner" />
    </div>
  </div>
  <SettingsIconComponent />
  <GitInfo />
  <ScannersLoginComponent :handle-ean-login="eanLogin" :handle-nfc-login="nfcLogin" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore, useUserStore } from '@sudosos/sudosos-frontend-common';
import SettingsIconComponent from '@/components/SettingsIconComponent.vue';
import KeypadComponent from '@/components/Keypad/KeypadComponent.vue';
import KeypadDisplayComponent from '@/components/Keypad/KeypadDisplayComponent.vue';
import router from '@/router';
import { useCartStore } from '@/stores/cart.store';
import apiService from '@/services/ApiService';
import BannerComponent from '@/components/Banner/BannerComponent.vue';
import ScannersLoginComponent from '@/components/ScannersLoginComponent.vue';

import GitInfo from '@/components/GitInfo.vue';

const userStore = useUserStore();
const authStore = useAuthStore();

const userId = ref('');
const pinCode = ref('');
const enteringUserId = ref(true);
const animateSwitch = ref(false);
const loggingIn = ref(false);
const wrongPin = ref(false);
const maxUserIdLength = 5;
const maxPasscodeLength = 4;
const maxUserId = 40000;
const external = ref<boolean>(false);

const handleInput = (value: string) => {
  if (wrongPin.value) wrongPin.value = false;

  if (enteringUserId.value) {
    if (userId.value.length >= maxUserIdLength) return;
    userId.value += value;
    if (userId.value.length === maxUserIdLength || (Number(userId.value) * 10 > maxUserId && !external.value)) {
      switchInput();
    }
  } else {
    if (pinCode.value.length >= maxPasscodeLength) return;
    pinCode.value += value;
    if (pinCode.value.length === maxPasscodeLength) {
      login();
    }
  }
};

const handleBackspace = () => {
  wrongPin.value = false;
  if (userId.value.length == 0 && enteringUserId.value && external.value) external.value = false;

  if (pinCode.value.length === 0 && !enteringUserId.value) {
    switchInput();
  } else {
    if (enteringUserId.value) userId.value = userId.value.slice(0, -1);
    if (!enteringUserId.value) pinCode.value = pinCode.value.slice(0, -1);
  }
};

const switchInput = () => {
  enteringUserId.value = !enteringUserId.value;
  animateSwitch.value = true;
  setTimeout(() => {
    animateSwitch.value = false;
  }, 500);
};

const focusPasscode = () => {
  if (enteringUserId.value) switchInput();
};

const focusUserId = () => {
  if (!enteringUserId.value) switchInput();
};

const handleExternal = () => {
  external.value = !external.value;
};

const displayContainerClasses = computed(() => ({
  to: enteringUserId.value,
  from: !enteringUserId.value,
  animating: animateSwitch.value,
  switched: !enteringUserId.value && !animateSwitch.value,
}));

const loginSucces = async () => {
  const user = authStore.getUser;
  if (user === null) return;

  if (userStore.getActiveUsers.length === 0) void userStore.fetchUsers(apiService);
  await useCartStore().setBuyer(user);
  void userStore.fetchCurrentUserBalance(user.id, apiService);

  await router.push({ path: '/cashier' });
  userId.value = '';
  pinCode.value = '';
  enteringUserId.value = true;
};

const loginFail = () => {
  pinCode.value = '';
  wrongPin.value = true;
};

const login = () => {
  loggingIn.value = true;

  if (external.value) {
    authStore
      .externalPinLogin(Number(userId.value), pinCode.value, apiService)
      .then(async () => {
        await loginSucces();
      })
      .catch((error) => {
        console.error(error);
        loginFail();
      });
  } else {
    authStore
      .gewisPinlogin(userId.value, pinCode.value, apiService)
      .then(async () => {
        await loginSucces();
      })
      .catch((error) => {
        console.error(error);
        loginFail();
      });
  }

  loggingIn.value = false;
};

const nfcLogin = async (nfcCode: string) => {
  try {
    await authStore.nfcLogin(nfcCode, apiService).then(async () => {
      await loginSucces();
    });
  } catch (error) {
    console.error(error);
  }
};

const eanLogin = async (eanCode: string) => {
  try {
    await authStore.eanLogin(eanCode, apiService).then(async () => {
      await loginSucces();
    });
  } catch (error) {
    console.error(error);
  }
};

const handleContinue = () => {
  switchInput();
};

const shouldShowBanner = computed(() => {
  const minHeightThreshold = 950;
  const screenHeight = window.innerHeight;

  const screenWidth = window.innerWidth;
  const minWidthThreshold = 1280;

  return screenHeight >= minHeightThreshold && screenWidth >= minWidthThreshold;
});
</script>

<style scoped lang="scss">
.keypad-container {
  width: calc(3 * var(--key-size) + 2 * var(--key-gap-size));
  padding-top: 45px;
  margin: auto;
}

.display-container {
  display: flex;
  margin-bottom: 40px;
  justify-content: space-between;
}

.display-container.from.animating {
  transform: translateX(-126.5%);
  transition: transform 0.5s ease;
}

.display-container.to.animating {
  transform: translateX(126.5%);
  justify-content: flex-end;
  transition: transform 0.5s ease;
}

.display-container.switched {
  justify-content: flex-end;
}

.keypad-container,
.display-container {
  align-items: flex-start;
}
</style>
