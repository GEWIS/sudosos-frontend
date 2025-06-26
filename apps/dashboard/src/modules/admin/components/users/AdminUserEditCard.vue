<template>
  <FormCard
    :form="form"
    :header="t('modules.admin.singleUser.userInfo.header')"
    @save="() => form.submit()"
    @update:model-value="edit = $event"
  >
    <UserUpsertForm :disabled="!edit" :form="form" @submit:success="setUser" />
  </FormCard>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import type { UserResponse } from '@sudosos/sudosos-client';
import { ref, watch } from 'vue';
import { schemaToForm } from '@/utils/formUtils';
import { userUpsertSchema } from '@/utils/validation-schema';
import UserUpsertForm from '@/modules/admin/components/users/forms/UserUpsertForm.vue';
import FormCard from '@/components/FormCard.vue';

const { t } = useI18n();
const form = schemaToForm(userUpsertSchema);

const props = defineProps<{
  user: UserResponse | undefined;
}>();

const edit = ref(false);

const setUser = (user: UserResponse) => {
  const values = {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    nickname: user.nickname,
    userType: user.type,
    isActive: user.active,
    ofAge: user.ofAge,
    canGoIntoDebt: user.canGoIntoDebt,
  };
  form.context.resetForm({ values });
};

watch(
  () => props.user,
  (user) => {
    if (user) setUser(user);
  },
  { immediate: true },
);
</script>

<style scoped lang="scss"></style>
