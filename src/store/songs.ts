import { defineStore } from 'pinia'

type SongListResponse = MaiMai.LXNS.API.GetSongList.Response
type SongListRequest = MaiMai.LXNS.API.GetSongList.Request

type SongsCacheV1 = {
  v: 1
  cachedAt: number
  params: SongListRequest
  data: SongListResponse
}

const CACHE_KEY = 'maimai:song-list:v1'
const CACHE_TTL_MS = 3 * 24 * 60 * 60 * 1000 // 3 天

const API_BASE = 'https://maimai.lxns.net'

function readCache(): SongsCacheV1 | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as SongsCacheV1
    if (!parsed || parsed.v !== 1) return null
    if (!parsed.data?.songs || !Array.isArray(parsed.data.songs)) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(cache: SongsCacheV1) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache))
  } catch {
    // ignore quota / blocked storage
  }
}

function normalizeParams(params: SongListRequest): Required<SongListRequest> {
  return {
    version: typeof params.version === 'number' ? params.version : 25000,
    notes: typeof params.notes === 'boolean' ? params.notes : false,
  }
}

function isSameParams(a: SongListRequest, b: SongListRequest) {
  const aa = normalizeParams(a)
  const bb = normalizeParams(b)
  return aa.version === bb.version && aa.notes === bb.notes
}

function buildQuery(params: SongListRequest) {
  const q = new URLSearchParams()
  if (typeof params.version === 'number') q.set('version', String(params.version))
  if (typeof params.notes === 'boolean') q.set('notes', String(params.notes))
  return q.toString()
}

async function fetchSongList(params: SongListRequest): Promise<SongListResponse> {
  const query = buildQuery(params)
  const path = '/api/v0/maimai/song/list'
  const url = query ? `${API_BASE}${path}?${query}` : `${API_BASE}${path}`

  const res = await fetch(url, { method: 'GET' })
  if (!res.ok) {
    throw new Error(`GetSongList failed: ${res.status} ${res.statusText}`)
  }
  return (await res.json()) as SongListResponse
}

let pending: Promise<void> | null = null

export const useSongsStore = defineStore('songs', {
  state: () => ({
    songs: [] as SongListResponse['songs'],
    genres: [] as SongListResponse['genres'],
    versions: [] as SongListResponse['versions'],
    lastUpdatedAt: null as number | null,
    source: 'empty' as 'empty' | 'cache' | 'network',
    loading: false,
    error: null as string | null,
    initialized: false,
    params: { version: 25000, notes: false } as SongListRequest,
  }),
  actions: {
    hydrateFromCache(cache?: SongsCacheV1) {
      const c = cache ?? readCache()
      if (!c) return false

      this.songs = c.data.songs
      this.genres = c.data.genres
      this.versions = c.data.versions
      this.lastUpdatedAt = c.cachedAt
      this.source = 'cache'
      return true
    },

    async loadAllSongs(options?: { force?: boolean; params?: SongListRequest }) {
      if (options?.params) this.params = options.params

      const force = Boolean(options?.force)
      const now = Date.now()

      const cache = readCache()
      const cacheUsable = Boolean(cache && isSameParams(cache.params, this.params))
      const cacheFresh = cacheUsable && now - (cache as SongsCacheV1).cachedAt < CACHE_TTL_MS

      // 3 天内命中缓存：直接使用缓存，不触发网络请求
      if (!force && !this.initialized && cacheFresh) {
        this.hydrateFromCache(cache as SongsCacheV1)
        this.initialized = true
        return
      }

      const shouldHydrate = !this.initialized || force
      const hasCache = shouldHydrate ? (cacheUsable ? this.hydrateFromCache(cache as SongsCacheV1) : false) : this.source !== 'empty'
      if (this.initialized && !force) return
      this.initialized = true

      if (pending) return pending

      this.loading = true
      this.error = null

      pending = (async () => {
        try {
          const data = await fetchSongList(this.params)
          this.songs = data.songs
          this.genres = data.genres
          this.versions = data.versions
          this.lastUpdatedAt = Date.now()
          this.source = 'network'

          writeCache({
            v: 1,
            cachedAt: this.lastUpdatedAt,
            params: this.params,
            data,
          })
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          this.error = msg
          // 离线/请求失败：如果之前已成功 hydrate 过缓存，就继续用缓存结果
          if (!hasCache) {
            this.source = 'empty'
          }
        } finally {
          this.loading = false
          pending = null
        }
      })()

      return pending
    },

    clearCache() {
      try {
        localStorage.removeItem(CACHE_KEY)
      } catch {
        // ignore
      }
    },
  },
})

