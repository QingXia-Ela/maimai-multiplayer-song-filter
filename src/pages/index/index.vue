<script lang="ts" setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useSongsStore, useThemeStore } from '@/store'
import type { ThemeMode } from '@/store'
import type { LevelIndex, PlayerSettings } from './utils/songFilter'
import { filterAndSortSongs } from './utils/songFilter'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseNumberInput from '@/components/BaseNumberInput.vue'

const songsStore = useSongsStore()
const themeStore = useThemeStore()

const PLAYER_SETTINGS_CACHE_KEY = 'maimai:player-settings:v1'

const themeMode = computed<ThemeMode>({
  get: () => themeStore.mode,
  set: (v) => themeStore.setMode(v),
})

const themeOptions: { label: string; value: ThemeMode }[] = [
  { label: '跟随系统', value: 'system' },
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
]

const songListMetaText = computed(() => {
  const modeMap: Record<typeof songsStore.source, string> = {
    empty: '无',
    cache: '缓存',
    network: '网络',
  }
  const updatedAt = songsStore.lastUpdatedAt ? new Date(songsStore.lastUpdatedAt).toLocaleString('zh-CN') : '—'
  return `数据源：LXNS｜方式：${modeMap[songsStore.source]}｜更新时间：${updatedAt}｜曲目数：${songsStore.songs.length}`
})

onMounted(() => {
  // 兜底：确保进入主页时曲目已加载（App.vue 也会触发一次）
  songsStore.loadAllSongs()
  // select 模式下确保初始值能命中 0.5 步进选项（避免下拉框空白）
  if (!ui.firstManualLevelInput) onSelectChanged(firstPlayer, false, { markDirty: false })
  if (!ui.secondManualLevelInput) onSelectChanged(secondPlayer, false, { markDirty: false })
  settingsCacheReady = true
})

const difficultyOptions: { label: string; value: LevelIndex }[] = [
  { label: 'BASIC', value: 0 },
  { label: 'ADVANCED', value: 1 },
  { label: 'EXPERT', value: 2 },
  { label: 'MASTER', value: 3 },
  // 需求里未提，但类型支持；默认不选到这里
  { label: 'Re:MASTER', value: 4 },
]

const levelValueOptions = computed(() => {
  const arr: number[] = []
  for (let v = 1; v <= 15.0001; v += 0.5) arr.push(Number(v.toFixed(1)))
  return arr
})

const levelValueSelectOptions = computed(() => levelValueOptions.value.map((v) => ({ label: String(v), value: v })))

const ui = reactive({
  firstManualLevelInput: false,
  secondManualLevelInput: false,
})

const DEFAULT_FIRST_PLAYER: PlayerSettings = {
  name: '玩家 1',
  maxDifficulty: 3,
  minLevelValue: 11,
  maxLevelValue: 13.5,
  expectedLevelValue: 12.5,
  maxExpectedDelta: 0.5,
}

const DEFAULT_SECOND_PLAYER: PlayerSettings = {
  name: '玩家 2',
  maxDifficulty: 2,
  minLevelValue: 10,
  maxLevelValue: 12.5,
  expectedLevelValue: 11.5,
  maxExpectedDelta: 0.5,
}

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function safeReadPlayerSettingsCache(): unknown | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(PLAYER_SETTINGS_CACHE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function safeWritePlayerSettingsCache(payload: unknown) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(PLAYER_SETTINGS_CACHE_KEY, JSON.stringify(payload))
  } catch {
    // ignore quota / blocked storage
  }
}

function applyPlayerPatch(target: PlayerSettings, patch: Partial<PlayerSettings>) {
  if (typeof patch.maxDifficulty === 'number') {
    // 0~4：BASIC/ADVANCED/EXPERT/MASTER/Re:MASTER
    const v = Math.round(patch.maxDifficulty)
    target.maxDifficulty = clampToRange(v, 0, 4) as LevelIndex
  }
  if (isFiniteNumber(patch.minLevelValue)) target.minLevelValue = patch.minLevelValue
  if (isFiniteNumber(patch.maxLevelValue)) target.maxLevelValue = patch.maxLevelValue
  if (isFiniteNumber(patch.expectedLevelValue)) target.expectedLevelValue = patch.expectedLevelValue
  if (isFiniteNumber(patch.maxExpectedDelta)) target.maxExpectedDelta = patch.maxExpectedDelta
}

function resetPlayerToDefaults(target: PlayerSettings, defaults: PlayerSettings) {
  applyPlayerPatch(target, defaults)
}

const firstPlayer = reactive<PlayerSettings>({ ...DEFAULT_FIRST_PLAYER })

const secondPlayer = reactive<PlayerSettings>({ ...DEFAULT_SECOND_PLAYER })

const sortPrimary = ref<'first' | 'second'>('first')

type SearchResult = ReturnType<typeof filterAndSortSongs>
const hasSearched = ref(false)
const dirty = ref(false)
const searchResult = ref<SearchResult>({
  firstPlayerAvaliabeSongs: [],
  matchedSongs: [],
})

const pageSize = 30
const page = ref(1)
const totalPages = computed(() => {
  if (!hasSearched.value) return 1
  return Math.max(1, Math.ceil(searchResult.value.matchedSongs.length / pageSize))
})
const pageOptions = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))
const pagedMatchedSongs = computed(() => {
  const start = (page.value - 1) * pageSize
  return searchResult.value.matchedSongs.slice(start, start + pageSize)
})

watch(totalPages, (tp) => {
  if (page.value > tp) page.value = tp
  if (page.value < 1) page.value = 1
})

function goPrevPage() {
  if (page.value > 1) page.value -= 1
}
function goNextPage() {
  if (page.value < totalPages.value) page.value += 1
}

function clampPlayer(p: PlayerSettings) {
  // 防止用户把区间输入反了
  if (p.minLevelValue > p.maxLevelValue) {
    const tmp = p.minLevelValue
    p.minLevelValue = p.maxLevelValue
    p.maxLevelValue = tmp
  }
}

function clampToRange(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function snapHalf(value: number) {
  return Math.round(value * 2) / 2
}

function onInputChanged() {
  clampPlayer(firstPlayer)
  clampPlayer(secondPlayer)
  dirty.value = true
}

function onSelectChanged(p: PlayerSettings, manual: boolean, options?: { markDirty?: boolean }) {
  if (!manual) {
    p.minLevelValue = clampToRange(snapHalf(p.minLevelValue), 1, 15)
    p.maxLevelValue = clampToRange(snapHalf(p.maxLevelValue), 1, 15)
    p.expectedLevelValue = clampToRange(snapHalf(p.expectedLevelValue), 1, 15)
    p.maxExpectedDelta = clampToRange(snapHalf(p.maxExpectedDelta), 0, 15)
  } else {
    p.minLevelValue = clampToRange(p.minLevelValue, 1, 15)
    p.maxLevelValue = clampToRange(p.maxLevelValue, 1, 15)
    p.expectedLevelValue = clampToRange(p.expectedLevelValue, 1, 15)
    p.maxExpectedDelta = clampToRange(p.maxExpectedDelta, 0, 15)
  }
  clampPlayer(p)
  if (options?.markDirty ?? true) dirty.value = true
}

function normalizePlayerBeforeSearch(p: PlayerSettings, manual: boolean) {
  if (manual) {
    p.minLevelValue = clampToRange(p.minLevelValue, 1, 15)
    p.maxLevelValue = clampToRange(p.maxLevelValue, 1, 15)
    p.expectedLevelValue = clampToRange(p.expectedLevelValue, 1, 15)
    p.maxExpectedDelta = clampToRange(p.maxExpectedDelta, 0, 15)
    clampPlayer(p)
  } else {
    onSelectChanged(p, false, { markDirty: false })
  }
}

function runSearch() {
  normalizePlayerBeforeSearch(firstPlayer, ui.firstManualLevelInput)
  normalizePlayerBeforeSearch(secondPlayer, ui.secondManualLevelInput)

  searchResult.value = filterAndSortSongs({
    songs: songsStore.songs,
    firstPlayer,
    secondPlayer,
    sortPrimary: sortPrimary.value,
  })
  hasSearched.value = true
  page.value = 1
  dirty.value = false
}

function resetPlayerSettings() {
  resetPlayerToDefaults(firstPlayer, DEFAULT_FIRST_PLAYER)
  resetPlayerToDefaults(secondPlayer, DEFAULT_SECOND_PLAYER)
  // 保持当前“手动输入/下拉选择”的偏好，但需要重新对齐数值
  onSelectChanged(firstPlayer, ui.firstManualLevelInput, { markDirty: true })
  onSelectChanged(secondPlayer, ui.secondManualLevelInput, { markDirty: true })
}

// ---- 读取本地缓存（玩家水平参数）----
let settingsCacheReady = false
const cached = safeReadPlayerSettingsCache()
if (cached && typeof cached === 'object') {
  const c = cached as any
  if (c.v === 1) {
    if (c.ui && typeof c.ui === 'object') {
      if (typeof c.ui.firstManualLevelInput === 'boolean') ui.firstManualLevelInput = c.ui.firstManualLevelInput
      if (typeof c.ui.secondManualLevelInput === 'boolean') ui.secondManualLevelInput = c.ui.secondManualLevelInput
    }
    if (c.firstPlayer && typeof c.firstPlayer === 'object') applyPlayerPatch(firstPlayer, c.firstPlayer)
    if (c.secondPlayer && typeof c.secondPlayer === 'object') applyPlayerPatch(secondPlayer, c.secondPlayer)
    if (c.sortPrimary === 'first' || c.sortPrimary === 'second') sortPrimary.value = c.sortPrimary

    // 缓存可能来自旧版本/手动输入，统一做一次归一化，保证 select 模式不会“选项空白”
    onSelectChanged(firstPlayer, ui.firstManualLevelInput, { markDirty: false })
    onSelectChanged(secondPlayer, ui.secondManualLevelInput, { markDirty: false })
  }
}

// ---- 联动逻辑：期望定数 ↔ 可接受区间（按阈值）----
function updateRangeFromExpected(p: PlayerSettings, manual: boolean) {
  const expected = manual ? clampToRange(p.expectedLevelValue, 1, 15) : clampToRange(snapHalf(p.expectedLevelValue), 1, 15)
  const delta = manual ? clampToRange(p.maxExpectedDelta, 0, 15) : clampToRange(snapHalf(p.maxExpectedDelta), 0, 15)

  // 先归一化自身字段，避免 drift
  p.expectedLevelValue = expected
  p.maxExpectedDelta = delta

  let min = expected - delta
  let max = expected + delta
  min = clampToRange(min, 1, 15)
  max = clampToRange(max, 1, 15)
  if (!manual) {
    min = snapHalf(min)
    max = snapHalf(max)
  }
  p.minLevelValue = min
  p.maxLevelValue = max
  clampPlayer(p)
}

function syncExpectedToRangeCenter(p: PlayerSettings, manual: boolean) {
  const min = p.minLevelValue
  const max = p.maxLevelValue
  let expected = (min + max) / 2
  expected = manual ? clampToRange(expected, 1, 15) : clampToRange(snapHalf(expected), 1, 15)
  p.expectedLevelValue = expected
}

function setupPlayerLinkage(p: PlayerSettings, manualGetter: () => boolean) {
  const guard = reactive({ fromExpected: false, fromRange: false, fromDelta: false })

  watch(
    () => [p.minLevelValue, p.maxLevelValue] as const,
    () => {
      if (guard.fromExpected) return
      guard.fromRange = true
      clampPlayer(p)
      syncExpectedToRangeCenter(p, manualGetter())
      guard.fromRange = false
      dirty.value = true
    }
  )

  watch(
    () => p.expectedLevelValue,
    () => {
      if (guard.fromRange) return
      guard.fromExpected = true
      updateRangeFromExpected(p, manualGetter())
      guard.fromExpected = false
      dirty.value = true
    }
  )

  watch(
    () => p.maxExpectedDelta,
    () => {
      if (guard.fromRange || guard.fromExpected) return
      guard.fromDelta = true
      updateRangeFromExpected(p, manualGetter())
      guard.fromDelta = false
      dirty.value = true
    }
  )

  // 切换“手动输入/下拉选择”时也要对齐一次（避免 select 选项空白）
  watch(
    manualGetter,
    (manual) => {
      onSelectChanged(p, manual, { markDirty: true })
    }
  )
}

setupPlayerLinkage(firstPlayer, () => ui.firstManualLevelInput)
setupPlayerLinkage(secondPlayer, () => ui.secondManualLevelInput)

// ---- 写入本地缓存 ----
watch(
  () => ({
    v: 1,
    ui: {
      firstManualLevelInput: ui.firstManualLevelInput,
      secondManualLevelInput: ui.secondManualLevelInput,
    },
    sortPrimary: sortPrimary.value,
    firstPlayer: {
      maxDifficulty: firstPlayer.maxDifficulty,
      minLevelValue: firstPlayer.minLevelValue,
      maxLevelValue: firstPlayer.maxLevelValue,
      expectedLevelValue: firstPlayer.expectedLevelValue,
      maxExpectedDelta: firstPlayer.maxExpectedDelta,
    },
    secondPlayer: {
      maxDifficulty: secondPlayer.maxDifficulty,
      minLevelValue: secondPlayer.minLevelValue,
      maxLevelValue: secondPlayer.maxLevelValue,
      expectedLevelValue: secondPlayer.expectedLevelValue,
      maxExpectedDelta: secondPlayer.maxExpectedDelta,
    },
  }),
  (payload) => {
    if (!settingsCacheReady) return
    safeWritePlayerSettingsCache(payload)
  },
  { deep: true }
)
</script>

<template>
<div class="page">
  <header class="header">
    <div class="headerTop">
      <div class="headerMain">
        <h1>MaiMai 选歌器</h1>
        <p class="sub">
          输入两位玩家的可接受范围，先筛选出玩家 1 可接受歌曲，再从中筛选玩家 2，最后按“期望定数接近度”排序。
        </p>
      </div>

      <label class="row gap headerTheme">
        <span class="label">主题</span>
        <BaseSelect v-model="themeMode" class="input themeSelect" :options="themeOptions" />
      </label>
    </div>
  </header>

  <section class="panel">
    <div class="panelTitleRow">
      <h2>歌曲列表来源</h2>
      <div class="row gap">
        <button type="button" class="btn" @click="songsStore.loadAllSongs({ force: true })"
          :disabled="songsStore.loading">
          重新拉取
        </button>
        <span class="muted">
          <template v-if="songsStore.loading">加载中…</template>
          <template v-else-if="songsStore.error">请求失败（已尽量使用缓存）：{{ songsStore.error }}</template>
          <template v-else>{{ songListMetaText }}</template>
        </span>
      </div>
    </div>
  </section>

  <section class="panel">
    <div class="panelTitleRow">
      <h2>玩家设置</h2>
      <div class="row gap">
        <label class="row gap">
          <span class="label">排序优先级</span>
          <BaseSelect v-model="sortPrimary" class="input" :options="[
            { label: '先贴近玩家 1 期望', value: 'first' },
            { label: '先贴近玩家 2 期望', value: 'second' },
          ]" @change="dirty = true" />
        </label>
        <button type="button" class="btn" @click="resetPlayerSettings">重置玩家参数</button>
        <button type="button" class="btn btnPrimary" @click="runSearch"
          :disabled="songsStore.loading || songsStore.songs.length === 0">
          开始筛选
        </button>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <h3>{{ firstPlayer.name }}</h3>

        <div class="formRow">
          <span class="label">最高可接受谱面难度</span>
          <BaseSelect v-model="firstPlayer.maxDifficulty" class="input" :options="difficultyOptions"
            @change="onInputChanged" />
        </div>

        <div class="formRow">
          <span class="label">可接受定数区间</span>
          <div class="row gap rangeRow">
            <template v-if="ui.firstManualLevelInput">
              <BaseNumberInput v-model="firstPlayer.minLevelValue" class="input inputFlex" :min="1" :max="15" step="0.1"
                @input="onInputChanged" />
            </template>
            <template v-else>
              <BaseSelect v-model="firstPlayer.minLevelValue" class="input inputFlex" :options="levelValueSelectOptions"
                @change="onSelectChanged(firstPlayer, ui.firstManualLevelInput)" />
            </template>
            <span class="muted">到</span>
            <template v-if="ui.firstManualLevelInput">
              <BaseNumberInput v-model="firstPlayer.maxLevelValue" class="input inputFlex" :min="1" :max="15" step="0.1"
                @input="onInputChanged" />
            </template>
            <template v-else>
              <BaseSelect v-model="firstPlayer.maxLevelValue" class="input inputFlex" :options="levelValueSelectOptions"
                @change="onSelectChanged(firstPlayer, ui.firstManualLevelInput)" />
            </template>
          </div>
        </div>

        <div class="formRow">
          <span class="label">期望定数（排序用）</span>
          <template v-if="ui.firstManualLevelInput">
            <BaseNumberInput v-model="firstPlayer.expectedLevelValue" class="input" :min="1" :max="15" step="0.1"
              @input="onInputChanged" />
          </template>
          <template v-else>
            <BaseSelect v-model="firstPlayer.expectedLevelValue" class="input" :options="levelValueSelectOptions"
              @change="onSelectChanged(firstPlayer, ui.firstManualLevelInput)" />
          </template>
        </div>

        <details class="details">
          <summary class="detailsSummary">高级设置</summary>
          <div class="detailsBody">
            <div class="formRow">
              <span class="label">期望差距阈值</span>
              <BaseNumberInput v-model="firstPlayer.maxExpectedDelta" class="input inputNarrow" :min="0" :max="15"
                step="0.1" @input="onInputChanged" />
            </div>
            <div class="formRow">
              <span class="label">手动输入定数</span>
              <label class="row gap">
                <input v-model="ui.firstManualLevelInput" type="checkbox"
                  @change="onSelectChanged(firstPlayer, ui.firstManualLevelInput)" />
                <span class="muted">关闭时使用下拉选择（1~15，每 0.5）</span>
              </label>
            </div>
          </div>
        </details>
      </div>

      <div class="card">
        <h3>{{ secondPlayer.name }}</h3>

        <div class="formRow">
          <span class="label">最高可接受谱面难度</span>
          <BaseSelect v-model="secondPlayer.maxDifficulty" class="input" :options="difficultyOptions"
            @change="onInputChanged" />
        </div>

        <div class="formRow">
          <span class="label">可接受定数区间</span>
          <div class="row gap rangeRow">
            <template v-if="ui.secondManualLevelInput">
              <BaseNumberInput v-model="secondPlayer.minLevelValue" class="input inputFlex" :min="1" :max="15"
                step="0.1" @input="onInputChanged" />
            </template>
            <template v-else>
              <BaseSelect v-model="secondPlayer.minLevelValue" class="input inputFlex"
                :options="levelValueSelectOptions" @change="onSelectChanged(secondPlayer, ui.secondManualLevelInput)" />
            </template>
            <span class="muted">到</span>
            <template v-if="ui.secondManualLevelInput">
              <BaseNumberInput v-model="secondPlayer.maxLevelValue" class="input inputFlex" :min="1" :max="15"
                step="0.1" @input="onInputChanged" />
            </template>
            <template v-else>
              <BaseSelect v-model="secondPlayer.maxLevelValue" class="input inputFlex"
                :options="levelValueSelectOptions" @change="onSelectChanged(secondPlayer, ui.secondManualLevelInput)" />
            </template>
          </div>
        </div>

        <div class="formRow">
          <span class="label">期望定数（排序用）</span>
          <template v-if="ui.secondManualLevelInput">
            <BaseNumberInput v-model="secondPlayer.expectedLevelValue" class="input" :min="1" :max="15" step="0.1"
              @input="onInputChanged" />
          </template>
          <template v-else>
            <BaseSelect v-model="secondPlayer.expectedLevelValue" class="input" :options="levelValueSelectOptions"
              @change="onSelectChanged(secondPlayer, ui.secondManualLevelInput)" />
          </template>
        </div>

        <details class="details">
          <summary class="detailsSummary">高级设置</summary>
          <div class="detailsBody">
            <div class="formRow">
              <span class="label">期望差距阈值</span>
              <BaseNumberInput v-model="secondPlayer.maxExpectedDelta" class="input inputNarrow" :min="0" :max="15"
                step="0.1" @input="onInputChanged" />
            </div>
            <div class="formRow">
              <span class="label">手动输入定数</span>
              <label class="row gap">
                <input v-model="ui.secondManualLevelInput" type="checkbox"
                  @change="onSelectChanged(secondPlayer, ui.secondManualLevelInput)" />
                <span class="muted">关闭时使用下拉选择（1~15，每 0.5）</span>
              </label>
            </div>
          </div>
        </details>
      </div>
    </div>
  </section>

  <section class="panel">
    <div class="panelTitleRow">
      <h2>筛选结果</h2>
      <div class="row gap">
        <template v-if="hasSearched">
          <span class="muted">玩家 1 可接受：{{ searchResult.firstPlayerAvaliabeSongs.length }}</span>
          <span class="muted">两人都可接受：{{ searchResult.matchedSongs.length }}</span>
          <template v-if="searchResult.matchedSongs.length > 0">
            <span class="muted">第 {{ page }} / {{ totalPages }} 页</span>
          </template>
        </template>
        <template v-else>
          <span class="muted">尚未开始筛选</span>
        </template>
      </div>
    </div>

    <div v-if="!hasSearched" class="empty">
      点击上方“开始筛选”生成结果。
      <span v-if="songsStore.loading" class="muted">（曲目加载中…）</span>
    </div>
    <div v-else-if="searchResult.matchedSongs.length === 0" class="empty">
      暂无符合条件的歌曲（可尝试放宽区间/阈值）。
    </div>

    <ul v-else class="list">
      <li v-for="item in pagedMatchedSongs" :key="item.song.id" class="listItem">
        <div class="titleRow">
          <span class="title">{{ item.song.title }}</span>
          <span class="meta">#{{ item.song.id }}｜{{ item.song.genre }}</span>
        </div>
        <div class="row wrap gap">
          <span class="pill">
            {{ firstPlayer.name }}：{{ item.first.best.level }}（{{ item.first.best.level_value.toFixed(1) }}）
            Δ{{ item.first.delta.toFixed(1) }}
          </span>
          <span class="pill">
            {{ secondPlayer.name }}：{{ item.second.best.level }}（{{ item.second.best.level_value.toFixed(1) }}）
            Δ{{ item.second.delta.toFixed(1) }}
          </span>
        </div>
      </li>
    </ul>

    <p v-if="hasSearched" class="muted tiny">
      每页展示 30 条结果。<span v-if="dirty">参数已修改，点击“开始筛选”更新结果。</span>
    </p>

    <div v-if="hasSearched && searchResult.matchedSongs.length > 0" class="pager">
      <button type="button" class="btn" @click="goPrevPage" :disabled="page <= 1">上一页</button>
      <div class="row gap">
        <span class="muted">页码</span>
        <BaseSelect v-model="page" class="input pagerSelect"
          :options="pageOptions.map((p) => ({ label: String(p), value: p }))" />
        <span class="muted">/ {{ totalPages }}</span>
      </div>
      <button type="button" class="btn" @click="goNextPage" :disabled="page >= totalPages">下一页</button>
    </div>
  </section>
</div>
</template>

<style scoped>
.page {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 60px;
  color: var(--c-text);
}

.headerTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.headerMain {
  min-width: 0;
}

.headerTheme {
  flex-shrink: 0;
}

.themeSelect {
  flex: 1;
}

@media (max-width: 900px) {
  .headerTop {
    flex-direction: column;
    align-items: stretch;
  }

  .headerTheme {
    justify-content: space-between;
  }

  .themeSelect {
    width: 100%;
  }
}

.header h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

.sub {
  margin: 0;
  color: var(--c-text-muted);
  line-height: 1.6;
}

.panel {
  margin-top: 16px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 14px 14px 16px;
  background: var(--c-surface);
}

.panelTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.panelTitleRow h2 {
  margin: 0;
  font-size: 16px;
}

.grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 900px) {
  .grid2 {
    grid-template-columns: 1fr;
  }
}

.card {
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  padding: 12px;
  background: var(--c-surface-soft);
}

.card h3 {
  margin: 0 0 10px;
  font-size: 15px;
}

.formRow {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}

.row {
  display: flex;
  align-items: center;
}

.wrap {
  flex-wrap: wrap;
}

.gap {
  gap: 10px;
}

.label {
  color: var(--c-text-subtle);
  font-size: 13px;
}

.input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--c-input-border);
  border-radius: 10px;
  background: var(--c-input-bg);
  color: var(--c-text);
}

.btn {
  padding: 8px 12px;
  border: 1px solid var(--c-input-border);
  background: var(--c-btn-bg);
  border-radius: 10px;
  cursor: pointer;
}

.btn:not(:disabled):hover {
  background: var(--c-btn-bg-hover);
}

.btnPrimary {
  border-color: var(--c-primary-border);
  background: var(--c-primary-bg);
  color: var(--c-primary);
}

.btnPrimary:not(:disabled):hover {
  background: var(--c-primary-bg-hover);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.muted {
  color: var(--c-text-muted);
  font-size: 13px;
}

.details {
  margin-top: 12px;
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  background: var(--c-surface);
  padding: 6px 10px;
}

.detailsSummary {
  cursor: pointer;
  color: var(--c-text-subtle);
  font-size: 13px;
  user-select: none;
}

.detailsBody {
  padding: 8px 0 2px;
}

.tiny {
  font-size: 12px;
  margin: 10px 0 0;
}

.pager {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.pagerSelect {
  width: 120px;
}

.rangeRow {
  width: 100%;
}

.inputFlex {
  flex: 1;
  min-width: 0;
}

.inputNarrow {
  width: 160px;
}

@media (max-width: 900px) {
  .inputNarrow {
    width: 140px;
  }
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.listItem {
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  padding: 12px;
  background: var(--c-surface);
}

.titleRow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.title {
  font-weight: 700;
  color: var(--c-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.meta {
  color: var(--c-text-weaker);
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

.pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid var(--c-border-soft);
  border-radius: 999px;
  background: var(--c-surface-soft);
  font-size: 12px;
  color: var(--c-text-subtle);
}

.empty {
  padding: 14px;
  border: 1px dashed var(--c-input-border);
  border-radius: 12px;
  color: var(--c-text-muted);
}
</style>