<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  loading: boolean
  error: string | null
  metaText: string
}>()

const emit = defineEmits<{ (e: 'reload'): void }>()

const metaParts = computed(() => {
  if (!props.metaText) return []
  return props.metaText
    .split('｜')
    .map((s) => s.trim())
    .filter(Boolean)
})
</script>

<template>
  <section class="panel">
    <div class="panelTitleRow">
      <h2>歌曲列表来源</h2>
      <div class="row gap">
        <button type="button" class="btn" :disabled="props.loading" @click="emit('reload')">重新拉取</button>
      </div>
    </div>

    <div class="muted metaBox">
      <template v-if="props.loading">加载中…</template>
      <template v-else-if="props.error">请求失败（已尽量使用缓存）：{{ props.error }}</template>
      <template v-else>
        <div class="metaList">
          <span v-for="(p, idx) in metaParts" :key="idx" class="metaPill">{{ p }}</span>
        </div>
      </template>
    </div>
  </section>
</template>

<style scoped>
.metaBox {
  line-height: 1.6;
}

.metaList {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.metaPill {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border: 1px solid var(--c-border-soft);
  border-radius: 999px;
  background: var(--c-surface-soft);
  color: var(--c-text-muted);
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 600px) {
  .metaPill {
    white-space: normal;
  }
}
</style>
