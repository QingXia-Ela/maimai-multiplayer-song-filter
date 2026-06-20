import { computed, reactive } from 'vue'
import { useSongsStore } from '@/store'
import { safeReadStorage, safeWriteStorage } from '@/utils/storage'

const CACHE_KEY = 'maimai:disliked-songs:v1'
const dislikedSongIds = reactive(new Set<number>())
let initialized = false

function initialize() {
  if (initialized) return
  initialized = true

  const ids = safeReadStorage<unknown>(CACHE_KEY)
  if (!Array.isArray(ids)) return
  for (const id of ids) {
    if (typeof id === 'number' && Number.isInteger(id)) dislikedSongIds.add(id)
  }
}

function persist() {
  safeWriteStorage(CACHE_KEY, [...dislikedSongIds])
}

export function useDislikedSongs() {
  initialize()
  const songsStore = useSongsStore()

  const dislikedSongs = computed(() => {
    const songsById = new Map(songsStore.songs.map((song) => [song.id, song]))
    return [...dislikedSongIds]
      .map((id) => songsById.get(id))
      .filter((song): song is NonNullable<typeof song> => Boolean(song))
      .sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'))
  })

  function dislikeSong(songId: number) {
    dislikedSongIds.add(songId)
    persist()
  }

  function restoreSong(songId: number) {
    dislikedSongIds.delete(songId)
    persist()
  }

  return {
    dislikedSongIds,
    dislikedSongs,
    dislikeSong,
    restoreSong,
  }
}
