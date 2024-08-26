<template>
  <FormCard :header="$t('userDetails.User Information')"
            @update:modelValue="edit = $event" @save="formSubmit" :enableEdit="true">
      <div class="flex flex-column justify-content-between gap-2">
        <UserEditForm :user="props.user" :form="form" :edit="edit" @update:edit="edit = $event" test="test"/>
      </div>
  </FormCard>
</template>

<script setup lang="ts">
import FormCard from "@/components/FormCard.vue";
import { onBeforeMount, type PropType, type Ref, ref, watch } from "vue";
import type { UserResponse } from "@sudosos/sudosos-client";
import { schemaToForm } from "@/utils/formUtils";
import { updateUserDetailsObject, userTypes } from "@/utils/validation-schema";
import UserEditForm from "@/modules/admin/components/users/forms/UserEditForm.vue";

const props = defineProps({
  user: {
    type: Object as PropType<UserResponse>,
    required: true
  }
});

const edit = ref(false);
// const user: Ref<UserResponse> = ref(props.user);

const form = schemaToForm(updateUserDetailsObject);

const formSubmit = () => {
  form.submit();
};

const updateFieldValues = (p: UserResponse) => {
  if (!p) return;
  const values = {
    firstName: p.firstName,
    lastName: p.lastName,
    email: p.email,
    nickname: p.nickname,
    isActive: p.active,
    userType: userTypes.value.find(ut => ut.name === p.type)?.value || undefined,
    ofAge: p.ofAge,
    canGoIntoDebt: p.canGoIntoDebt,
  };
  form.context.resetForm({ values });
};

// watch(() => user.value, (newValue: UserResponse) => {
//   updateFieldValues(newValue);
// });

onBeforeMount(() => {
  console.log(props.user);
  // if (user.value) {
  //   updateFieldValues(user.value);
  // }
});
</script>

<style scoped lang="scss">

</style>
