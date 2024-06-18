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
          <InputText id="name" class="w-18rem" v-model="name" type="text" v-bind="nameAttrs"/>
          <error-span :error="errors.name"/>
        </div>
      </div>
      <div class="flex flex-row flex-wrap justify-content-between align-items-center">
        <label for="owner" class="mr-8">{{ $t('c_POSCreate.Owner') }}</label>
        <div class="flex flex-column flex-end relative">
          <Dropdown :placeholder="$t('c_POSCreate.Select owner')" :options="organsList" optionLabel="firstName"
                    v-model="owner" class="w-18rem" id="owner" v-bind="ownerAttrs"/>
          <error-span :error="errors.owner"/>
        </div>
      </div>
      <div class="flex flex-row flex-wrap justify-content-between align-items-center">
        <label for="name" class="mr-8">{{ $t('c_productContainerOperations.Public') }}</label>
        <div class="relative">
          <Checkbox v-model="publicContainer" v-bind="publicAttrs" inputId="publicContainer"
                    name="public" value="public" :binary="true"/>
          <error-span :error="errors.public"/>
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
import { computed, onMounted, type PropType, type Ref, ref, watch } from "vue";
import type {
  BaseUserResponse, ContainerWithProductsResponse,
  CreateContainerRequest
} from "@sudosos/sudosos-client";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { toTypedSchema } from "@vee-validate/yup";
import * as yup from "yup";
import { useForm } from "vee-validate";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import ErrorSpan from "@/components/ErrorSpan.vue";

const props = defineProps({
  container: {
    type: Object as PropType<ContainerWithProductsResponse>,
  },
});

const emit = defineEmits(['update:visible', 'create:container']);
const authStore = useAuthStore();

const visible = ref(false);
const dialog = ref();
const organsList: Ref<BaseUserResponse[]> = ref(authStore.organs);

const state = computed(() => {
  return {
    create: props.container === undefined,
    edit: props.container !== undefined,
  };
});
const header = computed(() => {
  if (state.value.create) return 'Create Container';
  if (state.value.edit) return 'Edit Container';
  return '';
});

const creationSchema = toTypedSchema(
    yup.object({
      name: yup.string().required(),
      public: yup.boolean().required().default(true),
      owner: yup.mixed<BaseUserResponse>().required()
    })
);

const { defineField, handleSubmit, errors, resetForm } = useForm({
  validationSchema: creationSchema,
});

const [name, nameAttrs] = defineField('name');
const [publicContainer, publicAttrs] = defineField('public');
const [owner, ownerAttrs] = defineField('owner');

const closeDialog = () => {
  name.value = '';
  publicContainer.value = true;
  owner.value = null;
  resetForm();
  emit('update:visible', false);
};

const handleSubmitContainer = handleSubmit(async (values) => {
  const request: CreateContainerRequest = {
    name: values.name, ownerId: values.owner.id, public: values.public
  };

  // Updating a container
  if (props.container) {
    request.products = props.container.products.map((p) => p.id);
  } else {
    // Creating a container

  }

  console.error(request);
  closeDialog();
});

const updateFieldValues = (p: ContainerWithProductsResponse) => {
  if (!p) return;
  name.value = p.name;
  owner.value = organsList.value.find((o) => o.id == p.owner.id);
  publicContainer.value = p.public;
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
