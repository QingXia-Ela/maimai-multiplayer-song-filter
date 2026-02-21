<script lang="ts" setup>
import { onMounted } from 'vue'
import { useSongsStore } from '@/store'
import { RouterView } from 'vue-router'

onMounted(() => {
  // 页面加载时请求曲目列表；离线时自动复用本地缓存
  useSongsStore().loadAllSongs()
})
</script>

<template>
<RouterView />
</template>