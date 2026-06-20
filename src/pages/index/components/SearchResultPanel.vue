<script setup lang="ts">
import { onBeforeUnmount, reactive, ref, watch } from 'vue'
import BaseSelect from '@/components/BaseSelect.vue'
import SongCover from './SongCover.vue'
import SongTitleInfo from './SongTitleInfo.vue'
import type { MatchedSong, Song } from '../utils/songFilter'

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
  allItems: MatchedSong[]
  dislikedSongs: Song[]
  firstPlayerName: string
  secondPlayerName: string
}>()

const emit = defineEmits<{
  (e: 'update:page', v: number): void
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'dislike', songId: number): void
  (e: 'restore', songId: number): void
}>()

const chartSearchDialog = reactive({
  open: false,
  title: '',
  webUrl: '',
})
let deeplinkTimer: number | null = null

const drawCount = ref(1)
const drawDialogOpen = ref(false)
const drawRunning = ref(false)
const drawnSongs = ref<MatchedSong[]>([])
const drawFrame = ref(0)
let drawShuffleTimer: number | null = null
let drawStopTimer: number | null = null

watch(
  () => props.matchedCount,
  (count) => {
    drawCount.value = Math.min(drawCount.value, Math.max(1, count))
  },
)

function formatFitDiff(item: MatchedSong['first']) {
  const value = item.best.fit_level_value
  return typeof value === 'number' ? value.toFixed(2) : '暂无'
}

function isMobileDevice() {
  const mobileUserAgent = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
  const iPadDesktopMode = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return mobileUserAgent || iPadDesktopMode
}

function closeChartSearchDialog() {
  if (deeplinkTimer !== null) {
    window.clearTimeout(deeplinkTimer)
    deeplinkTimer = null
  }
  document.removeEventListener('visibilitychange', handleChartSearchVisibility)
  chartSearchDialog.open = false
}

function handleChartSearchVisibility() {
  if (document.visibilityState === 'hidden') closeChartSearchDialog()
}

function openChartSearch(title: string) {
  const keyword = `${title} maimai谱面确认`
  const encodedKeyword = encodeURIComponent(keyword)
  const webUrl = `https://search.bilibili.com/all?keyword=${encodedKeyword}`

  if (!isMobileDevice()) {
    window.open(webUrl, '_blank', 'noopener,noreferrer')
    return
  }

  closeChartSearchDialog()
  chartSearchDialog.title = title
  chartSearchDialog.webUrl = webUrl
  chartSearchDialog.open = true
  document.addEventListener('visibilitychange', handleChartSearchVisibility)

  deeplinkTimer = window.setTimeout(() => {
    deeplinkTimer = null
    window.location.href = `bilibili://search?keyword=${encodedKeyword}`
  }, 100)
}

function clearDrawTimers() {
  if (drawShuffleTimer !== null) {
    window.clearInterval(drawShuffleTimer)
    drawShuffleTimer = null
  }
  if (drawStopTimer !== null) {
    window.clearTimeout(drawStopTimer)
    drawStopTimer = null
  }
}

function randomUniqueSongs(songs: MatchedSong[], count: number) {
  const pool = [...songs]
  const result: MatchedSong[] = []
  const limit = Math.min(count, pool.length)

  while (result.length < limit) {
    const index = Math.floor(Math.random() * pool.length)
    result.push(pool.splice(index, 1)[0])
  }
  return result
}

function closeDrawDialog() {
  clearDrawTimers()
  drawRunning.value = false
  drawDialogOpen.value = false
}

function startSongDraw() {
  if (props.allItems.length === 0) return

  clearDrawTimers()
  drawDialogOpen.value = true
  drawRunning.value = true
  drawnSongs.value = randomUniqueSongs(props.allItems, drawCount.value)
  drawFrame.value += 1

  drawShuffleTimer = window.setInterval(() => {
    drawnSongs.value = randomUniqueSongs(props.allItems, drawCount.value)
    drawFrame.value += 1
  }, 90)

  drawStopTimer = window.setTimeout(() => {
    clearDrawTimers()
    drawnSongs.value = randomUniqueSongs(props.allItems, drawCount.value)
    drawFrame.value += 1
    drawRunning.value = false
  }, 3000)
}

onBeforeUnmount(() => {
  closeChartSearchDialog()
  closeDrawDialog()
})
</script>

<template>
  <section class="panel">
    <div class="panelTitleRow">
      <h2>筛选结果</h2>
      <div class="row gap resultMeta">
        <template v-if="props.hasSearched">
          <span class="muted">玩家 1 可接受：{{ props.firstPlayerAvailableCount }}</span>
          <span class="muted">两人都可接受：{{ props.matchedCount }}</span>
          <span v-if="props.matchedCount > 0" class="muted">第 {{ props.page }} / {{ props.totalPages }} 页</span>
        </template>
        <span v-else class="muted">尚未开始筛选</span>
      </div>
    </div>

    <div v-if="!props.hasSearched" class="empty">
      点击上方“开始筛选”生成结果。
      <span v-if="props.loadingSongs" class="muted">（曲目加载中…）</span>
    </div>
    <div v-else-if="props.matchedCount === 0" class="empty">暂无符合条件的歌曲（可尝试放宽区间/阈值）。</div>

    <template v-else>
      <div class="drawBar">
        <div class="drawCountGroup" aria-label="抽取歌曲数量">
          <span class="label">抽取数量</span>
          <button
            v-for="count in 4"
            :key="count"
            type="button"
            class="drawCountBtn"
            :class="{ active: drawCount === count }"
            :disabled="props.matchedCount < count"
            :aria-pressed="drawCount === count"
            @click="drawCount = count"
          >
            {{ count }}
          </button>
        </div>
        <button type="button" class="btn btnPrimary" @click="startSongDraw">抽取歌曲</button>
      </div>

      <ul class="list">
        <li v-for="item in props.items" :key="item.song.id" class="listItem songItem">
          <SongCover :song-id="item.song.id" :title="item.song.title" />
          <div class="songInfo">
            <div class="titleRow">
              <SongTitleInfo class="resultSongTitle" :song-id="item.song.id" :title="item.song.title" />
              <div class="songActions">
                <span class="meta">#{{ item.song.id }}｜{{ item.song.genre }}</span>
                <button type="button" class="chartSearchBtn" @click="openChartSearch(item.song.title)">
                  谱面确认
                </button>
                <button type="button" class="dislikeBtn" @click="emit('dislike', item.song.id)">
                  我不想玩
                </button>
              </div>
            </div>
            <div class="row wrap gap">
              <span class="pill">
                {{ props.firstPlayerName }}：{{ item.first.best.level }}
                （官方 {{ item.first.best.official_level_value.toFixed(1) }}｜公投 {{ formatFitDiff(item.first) }}）
                Δ{{ item.first.delta.toFixed(1) }}
              </span>
              <span class="pill">
                {{ props.secondPlayerName }}：{{ item.second.best.level }}
                （官方 {{ item.second.best.official_level_value.toFixed(1) }}｜公投 {{ formatFitDiff(item.second) }}）
                Δ{{ item.second.delta.toFixed(1) }}
              </span>
            </div>
          </div>
        </li>
      </ul>
    </template>

    <p v-if="props.hasSearched" class="muted tiny">
      每页展示 30 条结果。<span v-if="props.dirty">参数已修改，点击“开始筛选”更新结果。</span>
    </p>

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

  <details class="panel dislikedPanel">
    <summary class="dislikedSummary">
      <span>不想玩的歌曲</span>
      <span class="muted">{{ props.dislikedSongs.length }} 首</span>
    </summary>
    <div v-if="props.dislikedSongs.length === 0" class="empty dislikedEmpty">
      暂无记录。标记后的歌曲不会出现在筛选结果和随机抽取中。
    </div>
    <ul v-else class="dislikedList">
      <li v-for="song in props.dislikedSongs" :key="song.id" class="dislikedItem">
        <SongCover :song-id="song.id" :title="song.title" />
        <div class="dislikedInfo">
          <SongTitleInfo :song-id="song.id" :title="song.title" compact />
          <span class="meta">#{{ song.id }}｜{{ song.genre }}</span>
        </div>
        <button type="button" class="btn" @click="emit('restore', song.id)">恢复</button>
      </li>
    </ul>
  </details>

  <div v-if="drawDialogOpen" class="dialogBackdrop" @click.self="closeDrawDialog">
    <section class="dialog drawDialog" role="dialog" aria-modal="true" aria-labelledby="song-draw-title">
      <div class="dialogTitleRow">
        <div>
          <h2 id="song-draw-title">{{ drawRunning ? '正在抽取歌曲' : '抽取结果' }}</h2>
          <p class="drawStatus" aria-live="polite">
            {{ drawRunning ? '随机选择中，3 秒后停止…' : `已抽取 ${drawnSongs.length} 首歌曲` }}
          </p>
        </div>
        <button type="button" class="dialogClose" aria-label="关闭" @click="closeDrawDialog">×</button>
      </div>
      <div class="drawProgress" :class="{ running: drawRunning }" aria-hidden="true"><span></span></div>
      <ol class="drawResults">
        <li
          v-for="(item, index) in drawnSongs"
          :key="`${drawFrame}-${index}-${item.song.id}`"
          class="drawResult"
          :class="{ shuffling: drawRunning }"
        >
          <span class="drawIndex">{{ index + 1 }}</span>
          <SongCover v-if="!drawRunning" :song-id="item.song.id" :title="item.song.title" />
          <div v-else class="drawCoverPlaceholder" aria-hidden="true"></div>
          <div class="drawSongInfo">
            <SongTitleInfo :song-id="item.song.id" :title="item.song.title" compact />
            <span class="meta">#{{ item.song.id }}｜{{ item.song.genre }}</span>
            <span class="drawChartInfo">
              {{ props.firstPlayerName }} {{ item.first.best.level }}｜公投 {{ formatFitDiff(item.first) }}
            </span>
            <span class="drawChartInfo">
              {{ props.secondPlayerName }} {{ item.second.best.level }}｜公投 {{ formatFitDiff(item.second) }}
            </span>
          </div>
        </li>
      </ol>
      <div v-if="!drawRunning" class="drawDialogActions">
        <button type="button" class="btn" @click="closeDrawDialog">关闭</button>
        <button type="button" class="btn btnPrimary" @click="startSongDraw">再抽一次</button>
      </div>
    </section>
  </div>

  <div v-if="chartSearchDialog.open" class="dialogBackdrop" @click.self="closeChartSearchDialog">
    <section class="dialog" role="dialog" aria-modal="true" aria-labelledby="chart-search-title">
      <div class="dialogTitleRow">
        <h2 id="chart-search-title">正在拉起哔哩哔哩 App</h2>
        <button type="button" class="dialogClose" aria-label="关闭" @click="closeChartSearchDialog">×</button>
      </div>
      <p class="dialogSong">{{ chartSearchDialog.title }}</p>
      <p class="dialogText">
        如果没有跳转，请点击
        <a
          :href="chartSearchDialog.webUrl"
          target="_blank"
          rel="noopener noreferrer"
          @click="closeChartSearchDialog"
        >这里</a>
        打开网页搜索。
      </p>
    </section>
  </div>
</template>

<style scoped>
.resultMeta,
.songActions {
  flex-wrap: wrap;
}

.drawBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
  padding: 10px;
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  background: var(--c-surface-soft);
}

.drawCountGroup,
.songActions {
  display: flex;
  align-items: center;
  gap: 6px;
}

.drawCountBtn {
  width: 34px;
  height: 34px;
  padding: 0;
  border: 1px solid var(--c-input-border);
  border-radius: 10px;
  background: var(--c-btn-bg);
  color: var(--c-text-subtle);
  cursor: pointer;
}

.drawCountBtn.active {
  border-color: var(--c-primary-border);
  background: var(--c-primary-bg);
  color: var(--c-primary);
  font-weight: 700;
}

.drawCountBtn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.songItem {
  display: flex;
  align-items: center;
  gap: 12px;
}

.songInfo {
  min-width: 0;
  flex: 1;
  display: grid;
  gap: 10px;
}

.resultSongTitle {
  min-width: 0;
  flex: 1;
}

.songActions {
  justify-content: flex-end;
}

.chartSearchBtn,
.dislikeBtn {
  padding: 4px 8px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 12px;
  white-space: nowrap;
}

.chartSearchBtn {
  border: 1px solid var(--c-primary-border);
  background: var(--c-primary-bg);
  color: var(--c-primary);
}

.dislikeBtn {
  border: 1px solid var(--c-input-border);
  background: var(--c-btn-bg);
  color: var(--c-text-subtle);
}

.dislikedPanel {
  padding: 0;
  overflow: hidden;
}

.dislikedSummary {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  list-style: none;
}

.dislikedSummary::-webkit-details-marker {
  display: none;
}

.dislikedSummary::after {
  content: "展开";
  margin-left: auto;
  color: var(--c-text-muted);
  font-size: 12px;
  font-weight: 400;
}

.dislikedPanel[open] .dislikedSummary {
  border-bottom: 1px solid var(--c-border-soft);
}

.dislikedPanel[open] .dislikedSummary::after {
  content: "收起";
}

.dislikedEmpty {
  margin: 12px 14px 14px;
}

.dislikedList {
  list-style: none;
  display: grid;
  gap: 10px;
  margin: 0;
  padding: 12px 14px 14px;
}

.dislikedItem {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  padding: 8px;
  background: var(--c-surface-soft);
}

.dislikedInfo,
.drawSongInfo {
  min-width: 0;
  display: grid;
  gap: 3px;
}

.dialogBackdrop {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--c-dialog-backdrop);
}

.dialog {
  width: min(420px, 100%);
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 16px;
  background: var(--c-surface);
}

.drawDialog {
  width: min(620px, 100%);
  max-height: min(760px, calc(100vh - 32px));
  overflow-y: auto;
}

.dialogTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.dialogTitleRow h2 {
  margin: 0;
  font-size: 16px;
}

.dialogClose {
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  border: 1px solid var(--c-input-border);
  border-radius: 10px;
  background: var(--c-btn-bg);
  cursor: pointer;
  font-size: 20px;
}

.dialogSong {
  margin: 14px 0 0;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.dialogText {
  margin: 10px 0 0;
  color: var(--c-text-muted);
  line-height: 1.7;
}

.dialogText a {
  color: var(--c-primary);
  font-weight: 700;
}

.drawStatus {
  min-height: 18px;
  margin: 4px 0 0;
  color: var(--c-text-muted);
  font-size: 12px;
}

.drawProgress {
  height: 4px;
  margin-top: 14px;
  overflow: hidden;
  border-radius: 999px;
  background: var(--c-border-soft);
}

.drawProgress span {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--c-primary);
  transform: scaleX(1);
  transform-origin: left;
}

.drawProgress.running span {
  animation: drawProgress 3s linear forwards;
}

.drawResults {
  list-style: none;
  display: grid;
  gap: 10px;
  margin: 14px 0 0;
  padding: 0;
}

.drawResult {
  min-height: 74px;
  display: grid;
  grid-template-columns: 28px 72px minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  padding: 8px;
  background: var(--c-surface-soft);
}

.drawResult.shuffling {
  animation: drawShuffleIn 90ms ease-out;
}

.drawIndex {
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: var(--c-primary-bg);
  color: var(--c-primary);
  font-size: 12px;
  font-weight: 700;
}

.drawCoverPlaceholder {
  width: 72px;
  height: 72px;
  border: 1px solid var(--c-border-soft);
  border-radius: 10px;
  background: var(--c-surface);
}

.drawChartInfo {
  color: var(--c-text-muted);
  font-size: 12px;
}

.drawDialogActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 14px;
}

@keyframes drawProgress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

@keyframes drawShuffleIn {
  from { opacity: 0.55; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 700px) {
  .drawBar {
    align-items: stretch;
    flex-direction: column;
  }

  .drawCountGroup {
    justify-content: space-between;
  }

  .songActions {
    width: 100%;
    justify-content: space-between;
  }

  .titleRow {
    align-items: flex-start;
    flex-direction: column;
  }

  .pill {
    white-space: normal;
  }

  .drawResult {
    grid-template-columns: 24px 64px minmax(0, 1fr);
  }

  .drawCoverPlaceholder {
    width: 64px;
    height: 64px;
  }

  .dislikedItem {
    grid-template-columns: 64px minmax(0, 1fr);
  }

  .dislikedItem > .btn {
    grid-column: 1 / -1;
    width: 100%;
  }
}
</style>
