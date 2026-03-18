<script setup lang="ts">
import BaseSelect from '@/components/BaseSelect.vue'
import type { MatchedSong } from '../utils/songFilter'

const props = defineProps<{
  hasSearched: boolean
  loadingSongs: boolean
  dirty: boolean
  page: number
  totalPages: number
  pageOptions: number[]
  firstPlayerAvailableCount: number
  matchedCount: number
  items: MatchedSong[]
  firstPlayerName: string
  secondPlayerName: string
}>()

const emit = defineEmits<{
  (e: 'update:page', v: number): void
  (e: 'prev'): void
  (e: 'next'): void
}>()
</script>

<template>
  <section class="panel">
    <div class="panelTitleRow">
      <h2>筛选结果</h2>
      <div class="row gap">
        <template v-if="props.hasSearched">
          <span class="muted">玩家 1 可接受：{{ props.firstPlayerAvailableCount }}</span>
          <span class="muted">两人都可接受：{{ props.matchedCount }}</span>
          <template v-if="props.matchedCount > 0">
            <span class="muted">第 {{ props.page }} / {{ props.totalPages }} 页</span>
          </template>
        </template>
        <template v-else>
          <span class="muted">尚未开始筛选</span>
        </template>
      </div>
    </div>

    <div v-if="!props.hasSearched" class="empty">
      点击上方“开始筛选”生成结果。
      <span v-if="props.loadingSongs" class="muted">（曲目加载中…）</span>
    </div>
    <div v-else-if="props.matchedCount === 0" class="empty">暂无符合条件的歌曲（可尝试放宽区间/阈值）。</div>

    <ul v-else class="list">
      <li v-for="item in props.items" :key="item.song.id" class="listItem">
        <div class="titleRow">
          <span class="title">{{ item.song.title }}</span>
          <span class="meta">#{{ item.song.id }}｜{{ item.song.genre }}</span>
        </div>
        <div class="row wrap gap">
          <span class="pill">
            {{ props.firstPlayerName }}：{{ item.first.best.level }}（{{ item.first.best.level_value.toFixed(1) }}） Δ{{ item.first.delta.toFixed(1) }}
          </span>
          <span class="pill">
            {{ props.secondPlayerName }}：{{ item.second.best.level }}（{{ item.second.best.level_value.toFixed(1) }}） Δ{{ item.second.delta.toFixed(1) }}
          </span>
        </div>
      </li>
    </ul>

    <p v-if="props.hasSearched" class="muted tiny">每页展示 30 条结果。<span v-if="props.dirty">参数已修改，点击“开始筛选”更新结果。</span></p>

    <div v-if="props.hasSearched && props.matchedCount > 0" class="pager">
      <button type="button" class="btn" :disabled="props.page <= 1" @click="emit('prev')">上一页</button>
      <div class="row gap">
        <span class="muted">页码</span>
        <BaseSelect
          class="input pagerSelect"
          :model-value="props.page"
          :options="props.pageOptions.map((p) => ({ label: String(p), value: p }))"
          @update:model-value="(v) => emit('update:page', v)"
        />
        <span class="muted">/ {{ props.totalPages }}</span>
      </div>
      <button type="button" class="btn" :disabled="props.page >= props.totalPages" @click="emit('next')">下一页</button>
    </div>
  </section>
</template>

