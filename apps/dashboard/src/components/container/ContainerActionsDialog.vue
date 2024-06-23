<template>
  <Dialog v-model:visible="visible"
          :header="header"
          :draggable="false"
          modal
          @update:visible="closeDialog"
          :close-on-escape="true"
          ref="dialog"
          @show="openDialog"
  >
    <ContainerActionForm :form="form" :container="props.container"/>
    <div class="flex flex-row justify-content-end gap-2 mt-3">
      <Button outlined @click="closeDialog">{{ $t("c_containerEditModal.cancel") }}</Button>
      <Button type="submit" @click="submit">{{ $t("c_containerEditModal.save") }}</Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Dialog from "primevue/dialog";
import { computed, type PropType, ref } from "vue";
import type {
  BaseUserResponse, ContainerWithProductsResponse
} from "@sudosos/sudosos-client";
import * as yup from "yup";
import Button from "primevue/button";
import { useI18n } from "vue-i18n";
import { specToForm } from "@/utils/formUtil";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { storeToRefs } from "pinia";
import ContainerActionForm from "@/components/container/ContainerActionForm.vue";

const { t } = useI18n();

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
    required: false,
  },
});

const emit = defineEmits(['update:visible', 'create:container']);

const visible = ref(false);
const dialog = ref();

const state = computed(() => {
  return {
    create: props.container == undefined,
    edit: props.container != undefined,
  };
});

const header = computed(() => {
  if (state.value.create) return t('c_containerEditModal.header.create');
  if (state.value.edit) return t('c_containerEditModal.header.edit');
  return '';
});

async function submit() {
  await form.submit().then(() => {
    closeDialog();
  });
}

const form = specToForm({
  name: yup.string().required(),
  public: yup.boolean().required().default(true),
  owner: yup.mixed<BaseUserResponse>().required(),
});

const { organs } = storeToRefs(useAuthStore());
const updateFieldValues = (p: ContainerWithProductsResponse) => {
  if (!p) return;
  const name = p.name;
  const owner = organs.value.find((o) => o.id == p.owner.id);
  const isPublic = p.public;
  form.context.resetForm();
  form.context.setValues({ name, owner, public: isPublic });
};

const closeDialog = () => {
  form.context.resetForm();
  emit('update:visible', false);
};

const openDialog = () => {
  addListenerOnDialogueOverlay(dialog.value);
  if (props.container) updateFieldValues(props.container);
};

</script>

<style scoped lang="scss">
.error-text {
  position: absolute;
  bottom: -1.5rem;
  left: 0;
  color: red;
  font-size: 0.875rem;
  text-align: right;
  width: 100%;
}
</style>
