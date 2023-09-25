<template>
   <Slots :api-data="ApiData._slots"></Slots>
</template>
<script setup lang="ts">
import ApiData from "./Tooltip.vue.json";
import Slots from "@/components/common/slots.vue";
</script>