<template>
   <Intro :api-data="ApiData._component[0]"></Intro>
</template>
<script setup lang="ts">
import ApiData from "./Tooltip.vue.json";
import Intro from "@/components/common/intro.vue";
</script>