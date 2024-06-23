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
    <form @submit="handleSubmitContainer" class="flex flex-column gap-3">
      <div class="flex flex-row flex-wrap justify-content-between align-items-center">
        <label for="name" class="mr-8">{{ $t('c_productContainerOperations.Name') }}</label>
        <div class="relative">
          <InputText id="name" class="w-18rem" v-model="form.model.name.value.value"
                     type="text" v-bind="form.model.name.attr.value"/>
          <error-span :error="form.context.errors.value.name"/>
        </div>
      </div>
      <div class="flex flex-row flex-wrap justify-content-between align-items-center">
        <label for="owner" class="mr-8">
          {{ $t('c_POSCreate.Owner') }}
          <i class="pi pi-exclamation-circle text-red-500 cursor-pointer"
             v-tooltip.top="$t('tooltip.owner_revenue')"/>
        </label>
        <div class="flex flex-column flex-end relative">
          <div v-if="state.create">
            <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organsList" optionLabel="firstName"
                      v-model="form.model.owner.value.value" class="w-18rem" id="owner"
                      v-bind="form.model.owner.attr.value"/>
            <error-span :error="form.context.errors.value.owner"/>
          </div>
          <div v-else-if="container">
            <p class="my-0">{{ container.owner.firstName + ' ' + container.owner.lastName }}</p>
          </div>
        </div>
      </div>
      <div class="flex flex-row flex-wrap justify-content-between align-items-center">
        <label for="name" class="mr-8">{{ $t('c_containerEditModal.Public') }}</label>
        <div class="relative">
          <Checkbox v-model="form.model.public.value.value" v-bind="form.model.public.attr.value"
                    inputId="publicContainer"
                    name="public" value="public" :binary="true"/>
          <error-span :error="form.context.errors.value.public"/>
        </div>
      </div>
      <div class="flex flex-row justify-content-end gap-2">
        <Button outlined @click="closeDialog">{{ $t("c_containerEditModal.cancel") }}</Button>
        <Button type="submit">{{ $t("c_containerEditModal.save") }}</Button>
      </div>
    </form>
  </Dialog>
</template>

<script setup lang="ts">
import { addListenerOnDialogueOverlay } from "@/utils/dialogUtil";
import Dialog from "primevue/dialog";
import { computed, type PropType, type Ref, ref } from "vue";
import type {
  BaseUserResponse, ContainerResponse, ContainerWithProductsResponse
} from "@sudosos/sudosos-client";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import * as yup from "yup";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import ErrorSpan from "@/components/ErrorSpan.vue";
import { useContainerStore } from "@/stores/container.store";
import { handleError } from "@/utils/errorUtils";
import { useToast } from "primevue/usetoast";
import { useI18n } from "vue-i18n";
import InputText from "primevue/inputtext";
import { specToForm } from "@/utils/formUtil";

const { t } = useI18n();

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
    required: false,
  },
});

const emit = defineEmits(['update:visible', 'create:container']);
const authStore = useAuthStore();
const containerStore = useContainerStore();

const visible = ref(false);
const dialog = ref();
const organsList: Ref<BaseUserResponse[]> = ref(authStore.organs);

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

const updateFieldValues = (p: ContainerWithProductsResponse) => {
  if (!p) return;
  const name = p.name;
  const owner = organsList.value.find((o) => o.id == p.owner.id);
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
