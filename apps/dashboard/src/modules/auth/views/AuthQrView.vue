<template>
  <div class="flex flex-col items-center gap-6 p-6">
    <div class="text-center">
      <h1 class="text-2xl font-bold mb-2">{{ t('modules.auth.qr.title') }}</h1>
      <p class="text-gray-600">{{ t('modules.auth.qr.description') }}</p>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center gap-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p>{{ t('modules.auth.qr.generating') }}</p>
    </div>

    <div v-else-if="error" class="flex flex-col items-center gap-4">
      <div class="text-red-600 text-center">
        <p class="font-semibold">{{ t('modules.auth.qr.error') }}</p>
        <p class="text-sm">{{ error }}</p>
      </div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        @click="refreshQrCode"
      >
        {{ t('modules.auth.qr.retry') }}
      </button>
    </div>

    <div v-else-if="isExpired" class="flex flex-col items-center gap-4">
      <div class="text-orange-600 text-center">
        <p class="font-semibold">{{ t('modules.auth.qr.expired') }}</p>
        <p class="text-sm">{{ t('modules.auth.qr.expiredDescription') }}</p>
      </div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        @click="refreshQrCode"
      >
        {{ t('modules.auth.qr.generateNew') }}
      </button>
    </div>

    <div v-else-if="session" class="flex flex-col items-center gap-4">
      <div class="bg-white p-4 rounded-lg shadow-lg">
        <div ref="qrCodeContainer" class="w-64 h-64 flex items-center justify-center">
          <!-- QR Code will be rendered here -->
        </div>
      </div>

      <div class="text-center text-sm text-gray-600">
        <p>{{ t('modules.auth.qr.scanInstructions') }}</p>
        <p class="mt-2">
          {{ t('modules.auth.qr.expiresAt') }}:
          <span class="font-mono">{{ formatExpirationTime(session.expiresAt) }}</span>
        </p>
      </div>

      <button
        class="px-4 py-2 text-blue-600 border border-blue-600 rounded hover:bg-blue-50 transition-colors"
        @click="refreshQrCode"
      >
        {{ t('modules.auth.qr.refresh') }}
      </button>
    </div>

    <div class="mt-4 text-center">
      <router-link class="text-blue-600 hover:text-blue-800 underline" to="/login">
        {{ t('modules.auth.qr.backToLogin') }}
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { toDataURL } from 'qrcode';

// Watch for session changes to regenerate QR code
import { watch } from 'vue';
import { useQrAuth } from '../composables/useQrAuth';

const { t } = useI18n();
const { session, isLoading, error, isExpired, refreshQrCode } = useQrAuth();
const qrCodeContainer = ref<HTMLElement>();

const formatExpirationTime = (expiresAt: string) => {
  const date = new Date(expiresAt);
  return date.toLocaleTimeString();
};

const generateQrCodeImage = async () => {
  if (!session.value || !qrCodeContainer.value) return;

  try {
    const qrCodeUrl = session.value.qrCodeUrl;

    // Generate QR code as data URL
    const qrCodeDataUrl = await toDataURL(qrCodeUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });

    // Create QR code image
    qrCodeContainer.value.innerHTML = `
      <img src="${qrCodeDataUrl}" alt="QR Code" class="w-full h-full object-contain" />
    `;
  } catch (err) {
    console.error('Error generating QR code:', err);
    // Fallback to simple representation
    qrCodeContainer.value.innerHTML = `
      <div class="w-full h-full border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-center p-4">
        <div class="text-4xl mb-2">📱</div>
        <p class="text-sm text-gray-600 mb-2">QR Code</p>
        <p class="text-xs text-gray-500 break-all">${session.value.qrCodeUrl}</p>
      </div>
    `;
  }
};

onMounted(async () => {
  await nextTick();
  if (session.value) {
    void generateQrCodeImage();
  }
});
watch(
  session,
  async () => {
    await nextTick();
    if (session.value) {
      void generateQrCodeImage();
    }
  },
  { immediate: true },
);
</script>

<style scoped lang="scss">
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
