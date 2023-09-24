<template>
  <Dialog v-model:visible="visible" :header="$t('c_POSCreate.add container')">
    <div class="dialog">
      <form @submit="handleCreateContainer">
        <div class="row">
          <h6>{{ $t("c_containerEditModal.Name") }}</h6>
          <InputText class="flex-child" v-bind="name"/>
          <span class="error-text">{{ errors.name }}</span>
        </div>
        <div class="row">
          <h6>{{ $t("c_containerEditModal.owner") }}</h6>
          <Dropdown
              class="flex-child"
              :options="organsList"
              optionLabel="firstName"
              v-bind="selectedOwner"
              :placeholder="$t('c_containerEditModal.select owner')"
          />
          <span class="error-text">{{ errors.selectedOwner }}</span>
        </div>
        <div class="row">
          <h6>{{ $t("c_containerEditModal.Public") }}</h6>
          <Checkbox class="flex-child" :binary="true" v-bind="isPublic"/>
          <span class="error-text">{{ errors.isPublic }}</span>
        </div>
        <div class="row" id="actions">
          <Button severity="danger" outlined @click="visible = false">{{ $t("c_containerEditModal.cancel") }}</Button>
          <Button severity="danger" type="submit">{{ $t("c_containerEditModal.save") }}</Button>
        </div>
      </form>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Ref } from "vue";
import type { UserResponse } from "@sudosos/sudosos-client";
import { useAuthStore } from "@sudosos/sudosos-frontend-common";
import { useContainerStore } from "@/stores/container.store";
import * as yup from 'yup';
import { useForm } from "vee-validate";

const { defineComponentBinds, handleSubmit, errors } = useForm({
  validationSchema: {
    name: yup.string().required(),
    owner: yup.mixed<UserResponse>().required(),
    isPublic: yup.boolean().required().default(false),
  }
});

const visible = ref(false);
const selectedOwner = defineComponentBinds('selectedOwner');
const organsList: Ref<Array<UserResponse>> = ref([]);
const authStore = useAuthStore();
const name = defineComponentBinds('name');
const isPublic = defineComponentBinds('isPublic');
const containerStore = useContainerStore();

onMounted(async () => {
  organsList.value = authStore.organs;
});

const handleCreateContainer = handleSubmit(async (values) => {
  const createContainerResponse = await containerStore.createEmptyContainer(
      values.name,
      values.isPublic,
      values.selectedOwner.id
  );
  if (createContainerResponse.status === 204){
    // TODO: Correct toasts
  } else {
    // TODO: Correct error handling
  }
});

</script>

<style scoped lang="scss">
.dialog {
  width: 50vw;
  display: flex;
  flex-direction: column;
  padding-bottom: 1rem;

  .row {
    display: flex;
    width: 100%;
    padding-left: 1rem;
    padding-right: 1rem;

    h6 {
      font-weight: 700!important;
      font-family: Lato,Arial,sans-serif!important;
      font-size: 1rem!important;
      flex: 0 0 33.33333%;
      max-width: 33.33333%;
    }

    .flex-child {
      font-family: Lato,Arial,sans-serif!important;
      font-size: 1rem!important;
      flex: 1; /* Make the child fill the available space within the .row */
      max-width: 66.66666%;
      margin-bottom: 0.25rem;
    }

    img {
      max-width: 10rem;
      max-height: 10rem;
      width: 100%;
      height: 100%;
    }
  }

  #actions {
    display: flex;
    justify-content: flex-end;
    flex-direction: row;

    .p-button {
      margin: 0 0.2rem;
    }
  }
}

</style>
