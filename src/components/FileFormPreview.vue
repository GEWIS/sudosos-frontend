<template>
  <b-form-file
    id="ad-file"
    name="ad-file"
    v-model="file"
    accept="image/*"
    :placeholder="$t('c_fileFormPreview.Choose image drop')"
    :drop-placeholder="$t('c_fileFormPreview.Drop file')"
    :disabled="disabled"
    :state="state"
  ></b-form-file>
</template>

<script lang="ts">
import {
  Component, Prop, Vue, Watch,
} from 'vue-property-decorator';

  @Component
export default class FileFormPreview extends Vue {
    @Prop() private img: string | undefined;

    @Prop({ default: false }) disabled?: boolean;

    @Prop() state?: void;

    file: File = new File([], '');

    setFilePreview = (file: File, src?: string) : void => {
      if (document.activeElement !== null) {
        let element = document.getElementById('ad-file') as HTMLElement;
        const img = document.createElement('img');
        const url = src || URL.createObjectURL(file);

        img.setAttribute('src', url);
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
    };

    // If a file is uploaded, add an image to the label next to in which contains said file
    // this way the user can preview the uploaded file.
    @Watch('file')
    onFileChanged(value: File, old: File) : void {
      this.setFilePreview(value);

      // To let the v-model property know that the file has been updated
      this.$emit('input', value);
    }

    @Watch('img')
    onIMGChange(value: string | undefined, old: string | undefined) {
      if (value !== undefined) {
        this.setFilePreview(this.file, value);
      }
    }
}
</script>

<style lang="scss" scoped>

</style>
