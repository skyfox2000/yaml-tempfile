<template>
   <Slots :api-data="ApiData._slots"></Slots>
</template>
<script setup lang="ts">
import ApiData from "./Badge.vue.json";
import Slots from "@/components/common/slots.vue";
</script>