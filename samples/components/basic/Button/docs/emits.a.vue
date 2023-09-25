<template>
   <Emits :api-data="ApiData._emits"></Emits>
</template>
<script setup lang="ts">
import ApiData from "./Button.vue.json";
import Emits from "@/components/common/emits.vue";
</script>