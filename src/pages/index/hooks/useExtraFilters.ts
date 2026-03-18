import { reactive, ref, watch, computed } from 'vue'
import { useSongsStore } from '@/store'
import type { ExtraFiltersState, ExtraFilterMode } from '../utils/extraFilters'
import { safeReadStorage, safeWriteStorage } from '@/utils/storage'

const EXTRA_FILTERS_CACHE_KEY = 'maimai:extra-filters:v3'

function newConditionId() {
  try {
    return crypto.randomUUID()
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`
  }
}

type ExtraFiltersCacheV3 = {
  v: 3
  mode: ExtraFilterMode
  conditions: Array<{ id: string; kind: 'album'; album: string }>
}

export function useExtraFilters(options: { onDirty?: () => void } = {}) {
  const { onDirty } = options
  const songsStore = useSongsStore()
  let cacheReady = false

  const extraFilters = reactive<ExtraFiltersState>({
    mode: 'include',
    conditions: [],
  })

  const extraModeOptions = [
    { label: '包含（只保留命中条件的歌曲）', value: 'include' },
    { label: '不包含（剔除命中条件的歌曲）', value: 'exclude' },
  ] as const

  const albumSelectOptions = computed(() => {
    const opts: { label: string; value: string | '' }[] = [{ label: '请选择专辑', value: '' }]
    const labelMap = new Map<string, string>()

    for (const g of songsStore.genres ?? []) {
      if (typeof (g as any)?.title === 'string') labelMap.set((g as any).title, (g as any).title)
      if (typeof (g as any)?.genre === 'string' && (g as any).genre) {
        const title = typeof (g as any).title === 'string' && (g as any).title ? (g as any).title : (g as any).genre
        labelMap.set((g as any).genre, title)
      }
    }

    const seen = new Set<string>()
    for (const s of songsStore.songs ?? []) {
      if (typeof (s as any)?.genre !== 'string') continue
      const v = (s as any).genre.trim()
      if (!v) continue
      if (seen.has(v)) continue
      seen.add(v)
    }

    const values = Array.from(seen).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
    for (const v of values) {
      opts.push({ label: labelMap.get(v) ?? v, value: v })
    }
    return opts
  })

  function addAlbumCondition() {
    extraFilters.conditions.push({
      id: newConditionId(),
      kind: 'album',
      album: '',
    })
    onDirty?.()
  }

  function removeCondition(id: string) {
    const idx = extraFilters.conditions.findIndex((c) => c.id === id)
    if (idx >= 0) extraFilters.conditions.splice(idx, 1)
    onDirty?.()
  }

  function clearExtraConditions() {
    extraFilters.conditions.splice(0, extraFilters.conditions.length)
    onDirty?.()
  }

  const cached = safeReadStorage<ExtraFiltersCacheV3>(EXTRA_FILTERS_CACHE_KEY)
  if (cached && typeof cached === 'object' && cached.v === 3) {
    if (cached.mode === 'include' || cached.mode === 'exclude') extraFilters.mode = cached.mode
    if (Array.isArray(cached.conditions)) {
      extraFilters.conditions.splice(0, extraFilters.conditions.length)
      for (const it of cached.conditions) {
        if (!it || typeof it !== 'object') continue
        if (it.kind !== 'album') continue
        const id = typeof it.id === 'string' && it.id ? it.id : newConditionId()
        const album = typeof it.album === 'string' ? it.album : ''
        extraFilters.conditions.push({ id, kind: 'album', album })
      }
    }
  }

  watch(
    () => ({
      v: 3 as const,
      mode: extraFilters.mode,
      conditions: extraFilters.conditions.map((c) => ({
        id: c.id,
        kind: c.kind,
        album: c.album,
      })),
    }),
    (payload) => {
      if (!cacheReady) return
      safeWriteStorage(EXTRA_FILTERS_CACHE_KEY, payload)
      onDirty?.()
    },
    { deep: true }
  )

  watch(
    () => extraFilters.conditions.length,
    () => {
      if (!cacheReady) return
      onDirty?.()
    }
  )

  watch(
    () => extraFilters.mode,
    () => {
      if (!cacheReady) return
      onDirty?.()
    }
  )

  return {
    extraFilters,
    extraModeOptions,
    albumSelectOptions,
    addAlbumCondition,
    removeCondition,
    clearExtraConditions,
    markCacheReady: () => {
      cacheReady = true
    },
  }
}
