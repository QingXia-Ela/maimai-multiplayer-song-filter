<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useSongsStore, useThemeStore } from '@/store'
import type { ThemeMode } from '@/store'
import PageHeader from './components/PageHeader.vue'
import SongSourcePanel from './components/SongSourcePanel.vue'
import PlayerSettingsPanel from './components/PlayerSettingsPanel.vue'
import ExtraFiltersPanel from './components/ExtraFiltersPanel.vue'
import SearchResultPanel from './components/SearchResultPanel.vue'
import { usePlayerSettings } from './hooks/usePlayerSettings'
import { useExtraFilters } from './hooks/useExtraFilters'
import { useSongSearch } from './hooks/useSongSearch'

const songsStore = useSongsStore()
const themeStore = useThemeStore()

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
  return `曲目：LXNS｜公投拟合定数：水鱼查分器 chart_stats｜方式：${modeMap[songsStore.source]}｜更新时间：${updatedAt}｜曲目数：${songsStore.songs.length}`
})

const dirty = ref(false)

const {
  ui,
  firstPlayer,
  secondPlayer,
  sortPrimary,
  levelValueSource,
  difficultyOptions,
  onInputChanged,
  onSelectChanged,
  normalizePlayerBeforeSearch,
  resetPlayerSettings: resetPlayers,
} = usePlayerSettings({ onDirty: () => (dirty.value = true) })

const {
  extraFilters,
  extraModeOptions,
  albumSelectOptions,
  addAlbumCondition,
  removeCondition,
  clearExtraConditions,
  markCacheReady,
} = useExtraFilters({ onDirty: () => (dirty.value = true) })

const {
  hasSearched,
  searchResult,
  page,
  totalPages,
  pageOptions,
  pagedMatchedSongs,
  goPrevPage,
  goNextPage,
  runSearch: runSongSearch,
} = useSongSearch()

const levelValueOptions = computed(() => {
  const arr: number[] = []
  for (let v = 1; v <= 15.0001; v += 0.5) arr.push(Number(v.toFixed(1)))
  return arr
})

const levelValueSelectOptions = computed(() => levelValueOptions.value.map((v) => ({ label: String(v), value: v })))

function runSearch() {
  runSongSearch({
    firstPlayer,
    secondPlayer,
    sortPrimary: sortPrimary.value,
    levelValueSource: levelValueSource.value,
    extraFilters,
    normalizePlayerBeforeSearch,
    ui,
  })
  dirty.value = false
}

function resetPlayerSettings() {
  resetPlayers()
}

onMounted(() => {
  songsStore.loadAllSongs()
  markCacheReady()
})
</script>

<template>
<div class="indexPage">
  <PageHeader v-model="themeMode" :options="themeOptions" />

  <SongSourcePanel
    :loading="songsStore.loading"
    :error="songsStore.error"
    :meta-text="songListMetaText"
    @reload="songsStore.loadAllSongs({ force: true })"
  />

  <PlayerSettingsPanel
    v-model:sort-primary="sortPrimary"
    v-model:level-value-source="levelValueSource"
    v-model:first-manual-level-input="ui.firstManualLevelInput"
    v-model:second-manual-level-input="ui.secondManualLevelInput"
    :first-player="firstPlayer"
    :second-player="secondPlayer"
    :difficulty-options="difficultyOptions"
    :level-value-select-options="levelValueSelectOptions"
    :on-input-changed="onInputChanged"
    :on-select-changed="onSelectChanged"
    :search-disabled="songsStore.loading || songsStore.songs.length === 0"
    @dirty="dirty = true"
    @reset="resetPlayerSettings"
    @search="runSearch"
  />

  <ExtraFiltersPanel
    :extra-filters="extraFilters"
    :extra-mode-options="extraModeOptions"
    :album-select-options="albumSelectOptions"
    @add="addAlbumCondition"
    @remove="removeCondition"
    @clear="clearExtraConditions"
  />

  <SearchResultPanel
    v-model:page="page"
    :has-searched="hasSearched"
    :loading-songs="songsStore.loading"
    :dirty="dirty"
    :total-pages="totalPages"
    :page-options="pageOptions"
    :first-player-available-count="searchResult.firstPlayerAvaliabeSongs.length"
    :matched-count="searchResult.matchedSongs.length"
    :items="pagedMatchedSongs"
    :first-player-name="firstPlayer.name"
    :second-player-name="secondPlayer.name"
    @prev="goPrevPage"
    @next="goNextPage"
  />
</div>
</template>

<style>
.indexPage {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px 16px 60px;
  color: var(--c-text);
}

@media (max-width: 600px) {
  .indexPage {
    padding: 16px 12px 44px;
  }
}

.indexPage .headerTop {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.indexPage .headerMain {
  min-width: 0;
}

.indexPage .headerTheme {
  flex-shrink: 0;
}

.indexPage .themeSelect {
  flex: 1;
}

@media (max-width: 900px) {
  .indexPage .headerTop {
    flex-direction: column;
    align-items: stretch;
  }

  .indexPage .headerTheme {
    justify-content: space-between;
  }

  .indexPage .themeSelect {
    width: 100%;
  }
}

.indexPage .header h1 {
  margin: 0 0 8px;
  font-size: 28px;
}

@media (max-width: 600px) {
  .indexPage .header h1 {
    font-size: 24px;
  }
}

.indexPage .sub {
  margin: 0;
  color: var(--c-text-muted);
  line-height: 1.6;
}

.indexPage .panel {
  margin-top: 16px;
  border: 1px solid var(--c-border);
  border-radius: 12px;
  padding: 14px 14px 16px;
  background: var(--c-surface);
}

@media (max-width: 600px) {
  .indexPage .panel {
    padding: 12px;
  }
}

.indexPage .panelTitleRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

@media (max-width: 600px) {
  .indexPage .panelTitleRow {
    flex-direction: column;
    align-items: stretch;
  }

  .indexPage .panelTitleRow .row {
    flex-wrap: wrap;
    justify-content: flex-start;
  }
}

.indexPage .panelTitleRow h2 {
  margin: 0;
  font-size: 16px;
}

.indexPage .grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 900px) {
  .indexPage .grid2 {
    grid-template-columns: 1fr;
  }
}

.indexPage .card {
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  padding: 12px;
  background: var(--c-surface-soft);
}

.indexPage .card h3 {
  margin: 0 0 10px;
  font-size: 15px;
}

.indexPage .formRow {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  align-items: center;
  margin-top: 10px;
}

@media (max-width: 600px) {
  .indexPage .formRow {
    grid-template-columns: 1fr;
    gap: 8px;
    align-items: flex-start;
  }
}

.indexPage .row {
  display: flex;
  align-items: center;
}

.indexPage .wrap {
  flex-wrap: wrap;
}

.indexPage .gap {
  gap: 10px;
}

.indexPage .label {
  color: var(--c-text-subtle);
  font-size: 13px;
}

.indexPage .input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--c-input-border);
  border-radius: 10px;
  background: var(--c-input-bg);
  color: var(--c-text);
}

@media (max-width: 600px) {
  .indexPage .input {
    min-height: 40px;
    padding: 10px 10px;
  }
}

.indexPage .btn {
  padding: 8px 12px;
  border: 1px solid var(--c-input-border);
  background: var(--c-btn-bg);
  border-radius: 10px;
  cursor: pointer;
}

@media (max-width: 600px) {
  .indexPage .btn {
    min-height: 40px;
    padding: 10px 12px;
  }
}

.indexPage .btn:not(:disabled):hover {
  background: var(--c-btn-bg-hover);
}

.indexPage .btnPrimary {
  border-color: var(--c-primary-border);
  background: var(--c-primary-bg);
  color: var(--c-primary);
}

.indexPage .btnPrimary:not(:disabled):hover {
  background: var(--c-primary-bg-hover);
}

.indexPage .btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.indexPage .muted {
  color: var(--c-text-muted);
  font-size: 13px;
}

.indexPage .details {
  margin-top: 12px;
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  background: var(--c-surface);
  padding: 6px 10px;
}

.indexPage .detailsSummary {
  cursor: pointer;
  color: var(--c-text-subtle);
  font-size: 13px;
  user-select: none;
}

.indexPage .detailsBody {
  padding: 8px 0 2px;
}

.indexPage .tiny {
  font-size: 12px;
  margin: 10px 0 0;
}

.indexPage .pager {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

@media (max-width: 600px) {
  .indexPage .pager {
    flex-direction: column;
    align-items: stretch;
  }

  .indexPage .pagerSelect {
    width: 100%;
  }
}

.indexPage .pagerSelect {
  width: 120px;
}

.indexPage .connectorSelect {
  width: 160px;
}

.indexPage .condList {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.indexPage .condItem {
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  padding: 10px;
  background: var(--c-surface);
}

.indexPage .condRow {
  width: 100%;
}

.indexPage .condAlbum {
  flex: 1;
  min-width: 220px;
}

.indexPage .condKind {
  flex-shrink: 0;
}

.indexPage .rangeRow {
  width: 100%;
}

@media (max-width: 420px) {
  .indexPage .rangeRow {
    flex-wrap: wrap;
  }

  .indexPage .inputFlex {
    flex: 1 1 140px;
  }
}

.indexPage .inputFlex {
  flex: 1;
  min-width: 0;
}

.indexPage .inputNarrow {
  width: 160px;
}

@media (max-width: 900px) {
  .indexPage .inputNarrow {
    width: 140px;
  }

  .indexPage .connectorSelect {
    width: 140px;
  }

  .indexPage .condAlbum {
    min-width: 0;
  }
}

.indexPage .list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 10px;
}

.indexPage .listItem {
  border: 1px solid var(--c-border-soft);
  border-radius: 12px;
  padding: 12px;
  background: var(--c-surface);
}

.indexPage .titleRow {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.indexPage .title {
  font-weight: 700;
  color: var(--c-text);
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.indexPage .meta {
  color: var(--c-text-weaker);
  font-size: 12px;
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 600px) {
  .indexPage .meta {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.indexPage .pill {
  display: inline-flex;
  align-items: center;
  padding: 6px 10px;
  border: 1px solid var(--c-border-soft);
  border-radius: 999px;
  background: var(--c-surface-soft);
  font-size: 12px;
  color: var(--c-text-subtle);
}

.indexPage .empty {
  padding: 14px;
  border: 1px dashed var(--c-input-border);
  border-radius: 12px;
  color: var(--c-text-muted);
}
</style>
