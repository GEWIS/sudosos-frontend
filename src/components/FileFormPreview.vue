<template>
  <b-form-file
    id="ad-file"
    name="ad-file"
    v-model="file"
    accept="image/*"
    :placeholder="$t('fileFormPreview.Choose image drop')"
    :drop-placeholder="$t('fileFormPreview.Drop file')"
  ></b-form-file>
</template>

<script lang="ts">
import {
  Component, Vue, Watch,
} from 'vue-property-decorator';

  @Component
export default class FileFormPreview extends Vue {
    file: File = new File([], '');

    // If a file is uploaded, add an image to the label next to in which contains said file
    // this way the user can preview the uploaded file.
    @Watch('file')
    onFileChanged(value: File, old: File) : void {
      if (document.activeElement !== null) {
        let element = document.getElementById('ad-file') as HTMLElement;
        const img = document.createElement('img');
        img.setAttribute('src', URL.createObjectURL(value));
        img.style.maxHeight = '100%';
        img.style.maxWidth = `${element.offsetWidth - 48}px`;

        if (element.nextElementSibling !== null) {
          element = element.nextElementSibling as HTMLElement;
          element.style.height = '150px';
          element.style.padding = '0.75rem';
          element.innerHTML = '';
          element.appendChild(img);
          element = element.parentElement as HTMLElement;
          element.style.height = '150px';
        }
      }

      // To let the v-model property know that the file has been updated
      this.$emit('input', value);
    }
}
</script>

<style scoped>

</style>
