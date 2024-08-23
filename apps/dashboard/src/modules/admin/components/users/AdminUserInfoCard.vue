<template>
  <FormCard :header="$t('userDetails.User Information')" v-if="user"
            @update:modelValue="edit = $event" @save="formSubmit" :enableEdit="true">
      <div class="flex flex-column justify-content-between gap-2">
        <UserEditForm :user="user" :form="form" :edit="edit" @update:edit="edit = $event"/>
      </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import {computed, onBeforeMount, onMounted, type PropType, type Ref, ref, watch} from "vue";
import { useUserStore } from "@sudosos/sudosos-frontend-common";
import type { UserResponse } from "@sudosos/sudosos-client";
import { schemaToForm } from "@/utils/formUtils";
import { updateUserDetailsObject } from "@/utils/validation-schema";
import UserEditForm from "@/modules/admin/components/users/forms/UserEditForm.vue";
import apiService from "@/services/ApiService";

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true
  }
});

const edit = ref(false);
const userStore = useUserStore();
const user: Ref<UserResponse> = ref(props.user);



const form = schemaToForm(updateUserDetailsObject);

const formSubmit = () => {
  form.submit();
};

const updateFieldValues = (p: UserResponse) => {
  console.error("updating user");
  if (!p) return;
  const values = {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    nickname: p.nickname,
    isActive: p.active,
    ofAge: p.ofAge,
    canGoIntoDebt: p.canGoIntoDebt,
  };
  form.context.resetForm({ values });
};

watch(() => user.value, (newValue: UserResponse) => {
  updateFieldValues(newValue);
});

onBeforeMount(() => {
  if (user.value) {
    updateFieldValues(user.value);
  }
});
</script>

<style scoped lang="scss">

</style>
