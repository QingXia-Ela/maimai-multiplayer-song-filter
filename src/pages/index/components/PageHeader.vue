<script setup lang="ts">
import { ref } from 'vue'
import BaseSelect from '@/components/BaseSelect.vue'
import type { ThemeMode } from '@/store'
import ParamHelp from './ParamHelp.vue'
import UpdateAnnouncement from './UpdateAnnouncement.vue'

const props = defineProps<{
  modelValue: ThemeMode
  options: Array<{ label: string; value: ThemeMode }>
}>()

const emit = defineEmits<{ (e: 'update:modelValue', v: ThemeMode): void }>()
const announcementOpen = ref(false)
</script>

<template>
  <header class="header">
    <div class="headerTop">
      <div class="headerMain">
        <h1>MaiMai 选歌器</h1>
        <p class="sub">输入两位玩家的可接受范围，先筛选出玩家 1 可接受歌曲，再从中筛选玩家 2，最后按“期望定数接近度”排序。</p>
      </div>

      <div class="headerActions">
        <button type="button" class="btn announcementButton" @click="announcementOpen = true">
          更新公告
        </button>
        <label class="row gap headerTheme">
          <span class="label">主题</span>
          <BaseSelect
            class="input themeSelect"
            :model-value="props.modelValue"
            :options="props.options"
            @update:model-value="(v) => emit('update:modelValue', v)"
          />
        </label>
      </div>
    </div>

    <ParamHelp />
    <UpdateAnnouncement :open="announcementOpen" @close="announcementOpen = false" />
  </header>
</template>

<style scoped>
.headerActions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.announcementButton {
  white-space: nowrap;
}

@media (max-width: 900px) {
  .headerActions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 520px) {
  .headerActions {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
