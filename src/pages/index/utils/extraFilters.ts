export type Song = MaiMai.LXNS.API.Types.Song

export type ExtraFilterMode = 'include' | 'exclude'

export type ExtraFilterConditionAlbum = {
  id: string
  kind: 'album'
  /** 曲目分类（Song.genre）；空字符串表示未选择（视为不生效） */
  album: string | ''
}

export type ExtraFilterCondition = ExtraFilterConditionAlbum

export type ExtraFiltersState = {
  /** include: 从空集合开始，命中任一条件则加入；exclude: 从全集开始，命中任一条件则剔除 */
  mode: ExtraFilterMode
  conditions: ExtraFilterCondition[]
}

export function applyExtraFilters(songs: Song[], extra: ExtraFiltersState): Song[] {
  const condsRaw = extra.conditions ?? []
  const conds = condsRaw.filter((c) => {
    if (c.kind === 'album') return c.album !== ''
    return true
  })
  if (conds.length === 0) return songs

  function testOne(song: Song, c: ExtraFilterCondition) {
    if (c.kind === 'album') {
      return song.genre === c.album
    }
    return false
  }

  const matchAny = (song: Song) => conds.some((c) => testOne(song, c))
  const mode: ExtraFilterMode = extra.mode === 'exclude' ? 'exclude' : 'include'

  if (mode === 'include') return songs.filter(matchAny)
  return songs.filter((s) => !matchAny(s))
}

