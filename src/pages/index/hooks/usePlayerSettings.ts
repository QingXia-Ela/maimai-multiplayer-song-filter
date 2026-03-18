import { reactive, ref, watch, onMounted } from 'vue'
import type { LevelIndex, PlayerSettings } from '../utils/songFilter'
import { safeReadStorage, safeWriteStorage } from '@/utils/storage'

const PLAYER_SETTINGS_CACHE_KEY = 'maimai:player-settings:v1'

export const DEFAULT_FIRST_PLAYER: PlayerSettings = {
  name: '玩家 1',
  maxDifficulty: 3,
  minLevelValue: 11,
  maxLevelValue: 13.5,
  expectedLevelValue: 12.5,
  maxExpectedDelta: 0.5,
}

export const DEFAULT_SECOND_PLAYER: PlayerSettings = {
  name: '玩家 2',
  maxDifficulty: 2,
  minLevelValue: 10,
  maxLevelValue: 12.5,
  expectedLevelValue: 11.5,
  maxExpectedDelta: 0.5,
}

export const difficultyOptions: { label: string; value: LevelIndex }[] = [
  { label: 'BASIC', value: 0 },
  { label: 'ADVANCED', value: 1 },
  { label: 'EXPERT', value: 2 },
  { label: 'MASTER', value: 3 },
  { label: 'Re:MASTER', value: 4 },
]

function isFiniteNumber(v: unknown): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function clampToRange(value: number, min: number, max: number) {
  if (Number.isNaN(value)) return min
  return Math.min(max, Math.max(min, value))
}

function snapHalf(value: number) {
  return Math.round(value * 2) / 2
}

function clampPlayer(p: PlayerSettings) {
  if (p.minLevelValue > p.maxLevelValue) {
    p.maxLevelValue = p.minLevelValue
  }
}

function applyPlayerPatch(target: PlayerSettings, patch: Partial<PlayerSettings>) {
  if (typeof patch.maxDifficulty === 'number') {
    const v = Math.round(patch.maxDifficulty)
    target.maxDifficulty = clampToRange(v, 0, 4) as LevelIndex
  }
  if (isFiniteNumber(patch.minLevelValue)) target.minLevelValue = patch.minLevelValue
  if (isFiniteNumber(patch.maxLevelValue)) target.maxLevelValue = patch.maxLevelValue
  if (isFiniteNumber(patch.expectedLevelValue)) target.expectedLevelValue = patch.expectedLevelValue
  if (isFiniteNumber(patch.maxExpectedDelta)) target.maxExpectedDelta = patch.maxExpectedDelta
}

type PlayerSettingsCacheV1 = {
  v: 1
  ui: { firstManualLevelInput: boolean; secondManualLevelInput: boolean }
  sortPrimary: 'first' | 'second'
  firstPlayer: Partial<PlayerSettings>
  secondPlayer: Partial<PlayerSettings>
}

export function usePlayerSettings(options: { onDirty?: () => void } = {}) {
  const { onDirty } = options

  const ui = reactive({
    firstManualLevelInput: false,
    secondManualLevelInput: false,
  })

  const firstPlayer = reactive<PlayerSettings>({ ...DEFAULT_FIRST_PLAYER })
  const secondPlayer = reactive<PlayerSettings>({ ...DEFAULT_SECOND_PLAYER })

  const sortPrimary = ref<'first' | 'second'>('first')
  let cacheReady = false

  function onInputChanged() {
    clampPlayer(firstPlayer)
    clampPlayer(secondPlayer)
    onDirty?.()
  }

  function onSelectChanged(p: PlayerSettings, manual: boolean, opts?: { markDirty?: boolean }) {
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
    if (opts?.markDirty ?? true) onDirty?.()
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

  function resetPlayerSettings() {
    applyPlayerPatch(firstPlayer, DEFAULT_FIRST_PLAYER)
    applyPlayerPatch(secondPlayer, DEFAULT_SECOND_PLAYER)
    onSelectChanged(firstPlayer, ui.firstManualLevelInput, { markDirty: true })
    onSelectChanged(secondPlayer, ui.secondManualLevelInput, { markDirty: true })
  }

  function updateRangeFromExpected(p: PlayerSettings, manual: boolean) {
    const expected = manual ? clampToRange(p.expectedLevelValue, 1, 15) : clampToRange(snapHalf(p.expectedLevelValue), 1, 15)
    const delta = manual ? clampToRange(p.maxExpectedDelta, 0, 15) : clampToRange(snapHalf(p.maxExpectedDelta), 0, 15)
    p.expectedLevelValue = expected
    p.maxExpectedDelta = delta
    clampPlayer(p)
    if (expected < p.minLevelValue) {
      p.minLevelValue = expected
    } else if (expected > p.maxLevelValue) {
      p.maxLevelValue = expected
    }
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
    const guard = { fromExpected: false, fromRange: false }

    watch(
      () => [p.minLevelValue, p.maxLevelValue] as const,
      () => {
        if (guard.fromExpected) return
        guard.fromRange = true
        clampPlayer(p)
        syncExpectedToRangeCenter(p, manualGetter())
        guard.fromRange = false
        onDirty?.()
      },
      { flush: 'sync' }
    )

    watch(
      () => p.expectedLevelValue,
      () => {
        if (guard.fromRange) return
        guard.fromExpected = true
        updateRangeFromExpected(p, manualGetter())
        guard.fromExpected = false
        onDirty?.()
      },
      { flush: 'sync' }
    )

    watch(
      () => p.maxExpectedDelta,
      () => {
        if (guard.fromRange || guard.fromExpected) return
        onDirty?.()
      },
      { flush: 'sync' }
    )

    watch(manualGetter, (manual) => {
      onSelectChanged(p, manual, { markDirty: true })
    })
  }

  setupPlayerLinkage(firstPlayer, () => ui.firstManualLevelInput)
  setupPlayerLinkage(secondPlayer, () => ui.secondManualLevelInput)

  const cached = safeReadStorage<PlayerSettingsCacheV1>(PLAYER_SETTINGS_CACHE_KEY)
  if (cached && typeof cached === 'object' && cached.v === 1) {
    if (cached.ui && typeof cached.ui === 'object') {
      if (typeof cached.ui.firstManualLevelInput === 'boolean') ui.firstManualLevelInput = cached.ui.firstManualLevelInput
      if (typeof cached.ui.secondManualLevelInput === 'boolean') ui.secondManualLevelInput = cached.ui.secondManualLevelInput
    }
    if (cached.firstPlayer && typeof cached.firstPlayer === 'object') applyPlayerPatch(firstPlayer, cached.firstPlayer)
    if (cached.secondPlayer && typeof cached.secondPlayer === 'object') applyPlayerPatch(secondPlayer, cached.secondPlayer)
    if (cached.sortPrimary === 'first' || cached.sortPrimary === 'second') sortPrimary.value = cached.sortPrimary
  }

  watch(
    () => ({
      v: 1 as const,
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
      if (!cacheReady) return
      safeWriteStorage(PLAYER_SETTINGS_CACHE_KEY, payload)
    },
    { deep: true }
  )

  onMounted(() => {
    if (!ui.firstManualLevelInput) onSelectChanged(firstPlayer, false, { markDirty: false })
    if (!ui.secondManualLevelInput) onSelectChanged(secondPlayer, false, { markDirty: false })
    cacheReady = true
  })

  return {
    ui,
    firstPlayer,
    secondPlayer,
    sortPrimary,
    difficultyOptions,
    onInputChanged,
    onSelectChanged,
    normalizePlayerBeforeSearch,
    resetPlayerSettings,
  }
}
