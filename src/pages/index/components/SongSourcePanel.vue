<script setup lang="ts">
const props = defineProps<{
  loading: boolean
  error: string | null
  metaText: string
}>()

const emit = defineEmits<{ (e: 'reload'): void }>()
</script>

<template>
  <section class="panel">
    <div class="panelTitleRow">
      <h2>歌曲列表来源</h2>
      <div class="row gap">
        <button type="button" class="btn" :disabled="props.loading" @click="emit('reload')">重新拉取</button>
        <span class="muted">
          <template v-if="props.loading">加载中…</template>
          <template v-else-if="props.error">请求失败（已尽量使用缓存）：{{ props.error }}</template>
          <template v-else>{{ props.metaText }}</template>
        </span>
      </div>
    </div>
  </section>
</template>

