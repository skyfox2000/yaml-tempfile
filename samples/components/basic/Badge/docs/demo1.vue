<template>
  <VueLiveEditor :code="code"></VueLiveEditor>
</template>
<script setup lang="ts">
import VueLiveEditor from "@/editor/vue-live-editor.vue";
/**
 * 基础用法
*/
const code = `<Button icon="pen">按钮</Button>`;
</script>