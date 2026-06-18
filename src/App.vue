<script lang="ts" setup>
import { onMounted } from 'vue'
import { useSongsStore } from '@/store'
import { RouterView } from 'vue-router'
import PwaUpdatePrompt from '@/components/PwaUpdatePrompt.vue'

onMounted(() => {
  // 页面加载时请求曲目列表；离线时自动复用本地缓存
  useSongsStore().loadAllSongs()
})
</script>

<template>
  <RouterView />
  <PwaUpdatePrompt />
</template>
