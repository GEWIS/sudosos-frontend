<template>
  <footer class="footer">
    <b-container fluid="md" class="container">
      <span class="copyright">
        <b>&copy; {{ new Date().getFullYear() }} GEWIS</b>
      </span>
      <span class="separator">
        |
      </span>
      <terms-of-service-modal />
    </b-container>
  </footer>
</template>

<script lang="ts">
import { Vue } from 'vue-property-decorator';
import Component from 'vue-class-component';
import '../styles/Footer.scss';
import TermsOfServiceModal from '@/components/TermsOfServiceModal.vue';

@Component({
  components: { TermsOfServiceModal },
})
export default class PageFooter extends Vue {}
</script>

<style scoped lang="scss">
.footer {

  .container {
    display: flex;

    .separator {
      margin: 0 1rem;
    }
  }
}
</style>
