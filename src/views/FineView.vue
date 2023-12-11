<template>
  <div class="page-container">
    <div class="page-title">{{ $t('home.Overview') }}</div>
    <div class="content-wrapper">

    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import apiService from "@/services/ApiService";

const { t, locale } = useI18n();

apiService.debtor
</script>

<style scoped>
@import '../styles/BasePage.css';
</style>
