<template>
  <div class="flex flex-column align-items-center gap-3">
    <div class="picture-container" @click="triggerUpload">
      <img v-if="imageSrc" class="product-image" :src="imageSrc" />
      <div v-else class="no-banner">
        <p class="no-banner-text">{{ t('modules.admin.banners.noBannerFound') }}</p>
        <input
            ref="fileInput"
            type="file"
            class="hidden-file-input"
            accept="image/*"
            @change="handleFileUpload"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from "vue-i18n";

const { t } = useI18n();

defineProps<{
  imageSrc?: string,
}>();

const fileInput = ref<HTMLInputElement | null>(null);

const emit = defineEmits<{
  upload: [image: File]
}>();

const triggerUpload = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    emit('upload', target.files[0]);
  }
};
</script>

<style scoped lang="scss">
.picture-container {
  width: 800px; /* Set a fixed width */
  position: relative;
  padding-bottom: calc((7 / 52) * 100%); /* Maintain aspect ratio of 52:7 */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: lightgray;
}

.no-banner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: lightgray;
  color: black;
  cursor: pointer;
}

.no-banner-text {
  color: black;
  font-size: 1.2em;
  text-align: center;
}

.hidden-file-input {
  display: none;
}

.product-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
