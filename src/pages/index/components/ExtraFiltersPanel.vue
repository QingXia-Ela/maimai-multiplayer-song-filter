<script setup lang="ts">
import BaseSelect from '@/components/BaseSelect.vue'
import type { ExtraFiltersState } from '../utils/extraFilters'

const props = defineProps<{
  extraFilters: ExtraFiltersState
  extraModeOptions: Array<{ label: string; value: ExtraFiltersState['mode'] }>
  albumSelectOptions: Array<{ label: string; value: string | '' }>
}>()

const emit = defineEmits<{
  (e: 'add'): void
  (e: 'remove', id: string): void
  (e: 'clear'): void
}>()
</script>

<template>
  <section class="panel">
    <div class="panelTitleRow">
      <h2>额外筛选</h2>
      <div class="row gap">
        <label class="row gap">
          <span class="label">筛选模式</span>
          <BaseSelect v-model="props.extraFilters.mode" class="input connectorSelect" :options="props.extraModeOptions" />
        </label>

        <button type="button" class="btn" @click="emit('add')">添加条件</button>
        <button v-if="props.extraFilters.conditions.length > 0" type="button" class="btn" @click="emit('clear')">清空</button>
      </div>
    </div>

    <div v-if="props.extraFilters.conditions.length === 0" class="empty">暂无条件。点击上方“添加条件”开始配置。</div>

    <ul v-else class="condList">
      <li v-for="c in props.extraFilters.conditions" :key="c.id" class="condItem">
        <div class="row gap wrap condRow">
          <span class="pill condKind">专辑</span>
          <BaseSelect v-model="c.album" class="input condAlbum" :options="props.albumSelectOptions" />
          <button type="button" class="btn" @click="emit('remove', c.id)">移除</button>
        </div>
      </li>
    </ul>

    <p class="muted tiny">多个条件之间按“或”处理（命中任一条件即生效）。该模块会在“开始筛选”时生效，并自动保存到本地。</p>
  </section>
</template>

