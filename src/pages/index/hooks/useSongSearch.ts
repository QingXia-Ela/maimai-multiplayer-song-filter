import { ref, computed, watch } from 'vue'
import { useSongsStore } from '@/store'
import { filterAndSortSongs } from '../utils/songFilter'
import { applyExtraFilters } from '../utils/extraFilters'
import type { PlayerSettings } from '../utils/songFilter'
import type { ExtraFiltersState } from '../utils/extraFilters'

const PAGE_SIZE = 30

export function useSongSearch() {
  const songsStore = useSongsStore()

  const hasSearched = ref(false)
  const searchResult = ref<ReturnType<typeof filterAndSortSongs>>({
    firstPlayerAvaliabeSongs: [],
    matchedSongs: [],
  })

  const page = ref(1)

  const totalPages = computed(() => {
    if (!hasSearched.value) return 1
    return Math.max(1, Math.ceil(searchResult.value.matchedSongs.length / PAGE_SIZE))
  })

  const pageOptions = computed(() => Array.from({ length: totalPages.value }, (_, i) => i + 1))

  const pagedMatchedSongs = computed(() => {
    const start = (page.value - 1) * PAGE_SIZE
    return searchResult.value.matchedSongs.slice(start, start + PAGE_SIZE)
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

  function runSearch(options: {
    firstPlayer: PlayerSettings
    secondPlayer: PlayerSettings
    sortPrimary: 'first' | 'second'
    extraFilters: ExtraFiltersState
    normalizePlayerBeforeSearch: (p: PlayerSettings, manual: boolean) => void
    ui: { firstManualLevelInput: boolean; secondManualLevelInput: boolean }
  }) {
    const { firstPlayer, secondPlayer, sortPrimary, extraFilters, normalizePlayerBeforeSearch, ui } = options

    normalizePlayerBeforeSearch(firstPlayer, ui.firstManualLevelInput)
    normalizePlayerBeforeSearch(secondPlayer, ui.secondManualLevelInput)

    const baseSongs = applyExtraFilters(songsStore.songs, extraFilters)
    searchResult.value = filterAndSortSongs({
      songs: baseSongs,
      firstPlayer,
      secondPlayer,
      sortPrimary,
    })

    hasSearched.value = true
    page.value = 1
  }

  return {
    hasSearched,
    searchResult,
    page,
    totalPages,
    pageOptions,
    pagedMatchedSongs,
    goPrevPage,
    goNextPage,
    runSearch,
  }
}
