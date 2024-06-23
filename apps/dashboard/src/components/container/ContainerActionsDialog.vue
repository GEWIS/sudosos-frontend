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
      <Button type="submit" @click="handleSubmitContainer">{{ $t("c_containerEditModal.save") }}</Button>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Dialog from "primevue/dialog";
import { computed, type PropType, ref } from "vue";
import type {
  BaseUserResponse, ContainerResponse, ContainerWithProductsResponse
} from "@sudosos/sudosos-client";
import * as yup from "yup";
import Button from "primevue/button";
import { useContainerStore } from "@/stores/container.store";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
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
const containerStore = useContainerStore();

const visible = ref(false);
const dialog = ref();
const toast = useToast();

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

const form = specToForm({
  name: yup.string().required(),
  public: yup.boolean().required().default(true),
  owner: yup.mixed<BaseUserResponse>().required(),
});

const closeDialog = () => {
  form.context.resetForm();
  emit('update:visible', false);
};

const handleSubmitContainer = form.context.handleSubmit(async (values) => {
  // Updating a container
  if (props.container) {
    await containerStore.updateContainer(
        props.container.id,
        {
          name: values.name,
          public: values.public,
          products: props.container.products.map((p) => p.id)
        }
    ).then(() => {
      closeDialog();
      toast.add({
        severity: 'success',
        summary: t('successMessages.success'),
        detail: t('successMessages.updateContainer'),
        life: 3000,
      });
    }).catch((err) => handleError(err, toast));
  } else {
    // Creating a container
    await containerStore.createEmptyContainer(
        values.name,
        values.public,
        values.owner.id
    ).then((c: ContainerResponse) => {
      emit('create:container', c);
      closeDialog();
      toast.add({
        severity: 'success',
        summary: t('successMessages.success'),
        detail: t('successMessages.createContainer'),
        life: 3000,
      });
    }).catch((err) => handleError(err, toast));
  }

  closeDialog();
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
