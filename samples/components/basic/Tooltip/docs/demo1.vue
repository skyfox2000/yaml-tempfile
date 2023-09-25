<template>
  <VueLiveEditor :code="code"></VueLiveEditor>
</template>
<script setup lang="ts">
import VueLiveEditor from "@/editor/vue-live-editor.vue";
/**
 * 基础用法
*/
const code = `<Tooltip content='按钮提示'>按钮</Tooltip>`;
</script>