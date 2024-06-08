<template>
  <div class="keypad flex-column">
    <div class="key-row d-flex justify-content-center" v-for="row in keypadLayout" :key="row[0]">
      <div :class="['key c-btn active square', { outlined: key === keypadBackspace || key === keypadExternal }]"
        v-for="key in row" :key="key" @click="handleKeyClick(key)">
        <font-awesome-icon icon="fa-solid fa-backspace" v-if="key === keypadBackspace" />
        {{ key !== keypadBackspace ? key : '' }}
      </div>
    </div>
  </div>

  <div class="fs-5 text-decoration-underline text-center" @click="() => howToModalVisible = true">How do I login?</div>

  <Dialog v-model:visible="howToModalVisible" header="How do I login?" modal :draggable="false" ref="howToModal"
    @show="addListenerOnDialogueOverlay(howToModal)">
    <div class="d-flex flex-column align-items-center">
      <div>
        <b style="font-weight: bold!important;">User id:</b> You can use your GEWIS number as user id. <br>
        <b style="font-weight: bold!important;">Pin:</b> You can (re)set your pin at https://sudosos.gewis.nl/ <br>
      </div>
      <img src="@/assets/sudosos-qr.png" style="width: 25rem;" />
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, type Ref } from 'vue';
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";

const keypadBackspace = 'B';
const keypadExternal = 'E';
const keypadLayout = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['E', '0', 'B']
];

const howToModalVisible: Ref<boolean> = ref<boolean>(false);
const howToModal: Ref<null | any> = ref(null);

const emits = defineEmits(['backspace', 'continue', 'input', 'external']);

const handleKeyClick = (key: string) => {
  if (key === keypadBackspace) {
    emits('backspace');
  } else if (key === keypadExternal) {
    emits('external')
  } else {
    emits('input', key);
  }
};
</script>

<style scoped lang="scss">
.keypad {
  gap: var(--key-gap-size);
  border-radius: $border-radius;
}

.key {
  color: rgba(255, 255, 255, 0.8)!important;
  width: var(--key-size);
  height: var(--key-size);
  font-weight: bold;
  font-size: $font-size-larger;

  &-row {
    gap: var(--key-gap-size);
  }
}

.backspace {
  background-color: #d40000 !important;
  color: rgba(255, 255, 255, 1);
}

.outlined {
  background-color: transparent!important;
  border-style: solid;
  border-width: 3px;
  border-color: #d40000;
  color: #d40000 !important;

  > * {
    color: #d40000!important;
  }
}
</style>
