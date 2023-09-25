<template>
  <VueLiveEditor :code="code"></VueLiveEditor>
</template>
<script setup lang="ts">
import VueLiveEditor from "@/editor/vue-live-editor.vue";
/**
 * 多图标自动切换
*/
const code = `<Icon autoSwitch :icons="['pen', '']" />`;
</script>