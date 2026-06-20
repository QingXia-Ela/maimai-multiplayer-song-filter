import { ref, computed, watch } from 'vue'
import { useSongsStore } from '@/store'
import { filterAndSortSongs } from '../utils/songFilter'
import { applyExtraFilters } from '../utils/extraFilters'
import type { LevelValueSource, PlayerSettings } from '../utils/songFilter'
import type { ExtraFiltersState } from '../utils/extraFilters'
import { useDislikedSongs } from './useDislikedSongs'

const PAGE_SIZE = 30

export function useSongSearch() {
  const songsStore = useSongsStore()
  const { dislikedSongIds } = useDislikedSongs()

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
    levelValueSource: LevelValueSource
    extraFilters: ExtraFiltersState
    normalizePlayerBeforeSearch: (p: PlayerSettings, manual: boolean) => void
    ui: { firstManualLevelInput: boolean; secondManualLevelInput: boolean }
  }) {
    const { firstPlayer, secondPlayer, sortPrimary, levelValueSource, extraFilters, normalizePlayerBeforeSearch, ui } = options

    normalizePlayerBeforeSearch(firstPlayer, ui.firstManualLevelInput)
    normalizePlayerBeforeSearch(secondPlayer, ui.secondManualLevelInput)

    const allowedSongs = songsStore.songs.filter((song) => !dislikedSongIds.has(song.id))
    const baseSongs = applyExtraFilters(allowedSongs, extraFilters)
    searchResult.value = filterAndSortSongs({
      songs: baseSongs,
      firstPlayer,
      secondPlayer,
      sortPrimary,
      levelValueSource,
    })

    hasSearched.value = true
    page.value = 1
  }

  function removeSong(songId: number) {
    searchResult.value = {
      firstPlayerAvaliabeSongs: searchResult.value.firstPlayerAvaliabeSongs.filter(
        (item) => item.song.id !== songId,
      ),
      matchedSongs: searchResult.value.matchedSongs.filter((item) => item.song.id !== songId),
    }
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
    removeSong,
  }
}
