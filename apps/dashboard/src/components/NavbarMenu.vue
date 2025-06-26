<template>
  <Menubar :class="menuClass" :model="model">
    <template #start>
      <slot name="start"></slot>
    </template>
    <template #item="{ item, props, hasSubmenu }">
      <slot :has-submenu="hasSubmenu" :item="item" name="item" :props="props">
        <router-link v-if="item.route" v-slot="{ href, navigate }" custom :to="item.route">
          <a v-bind="props.action" :href="href" @click="navigate">
            <span class="p-menuitem-text">{{ item.label }}</span>
            <Badge v-if="item.notifications" class="ml-2" severity="secondary" :value="item.notifications" />
            <span v-if="item.icon" :class="item.icon" />
            <span v-if="hasSubmenu" class="ml-2 pi pi-angle-down pi-fw" />
          </a>
        </router-link>
        <a v-else :href="item.url" :target="item.target" v-bind="props.action">
          <span class="p-menuitem-text">{{ item.label }}</span>
          <Badge v-if="item.notifications" class="ml-2" severity="secondary" :value="item.notifications" />
          <span v-if="item.icon" :class="item.icon" />
          <span v-if="hasSubmenu" class="ml-2 pi pi-angle-down pi-fw" />
        </a>
      </slot>
    </template>
  </Menubar>
</template>

<script setup lang="ts">
import Menubar from 'primevue/menubar';
import Badge from 'primevue/badge';

type Item = {
  label: string;
  route?: string;
  url?: string;
  target?: string;
  icon?: string;
  notifications?: number;
};

defineProps<{
  model: Item[];
  menuClass?: string;
}>();
</script>
