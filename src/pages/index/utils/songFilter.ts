export type LevelIndex = MaiMai.LXNS.API.Types.LevelIndex
export type Song = MaiMai.LXNS.API.Types.Song
export type SongDifficulty = MaiMai.LXNS.API.Types.SongDifficulty
export type SongDifficultyUtage = MaiMai.LXNS.API.Types.SongDifficultyUtage

export type PlayerSettings = {
  name: string
  /** 最高可接受谱面难度（0 BASIC / 1 ADVANCED / 2 EXPERT / 3 MASTER / 4 Re:MASTER） */
  maxDifficulty: LevelIndex
  /** 可接受定数区间（含） */
  minLevelValue: number
  maxLevelValue: number
  /** 期望定数（用于排序接近度） */
  expectedLevelValue: number
  /** 与期望定数最大允许差距（超过则剔除该曲） */
  maxExpectedDelta: number
}

export type ChartCandidate = {
  type: MaiMai.LXNS.API.Types.SongType
  difficulty: LevelIndex
  level: string
  level_value: number
  isUtage: boolean
}

export type PlayerMatch = {
  best: ChartCandidate
  delta: number
}

export type MatchedSong = {
  song: Song
  first: PlayerMatch
  second: PlayerMatch
}

function toCandidates(song: Song): ChartCandidate[] {
  const std = song.difficulties.standard.map((c: SongDifficulty) => ({
    type: c.type,
    difficulty: c.difficulty,
    level: c.level,
    level_value: c.level_value,
    isUtage: false,
  }))

  const dx = song.difficulties.dx.map((c: SongDifficulty) => ({
    type: c.type,
    difficulty: c.difficulty,
    level: c.level,
    level_value: c.level_value,
    isUtage: false,
  }))

  const utage = (song.difficulties.utage ?? []).map((c: SongDifficultyUtage) => ({
    type: c.type,
    difficulty: c.difficulty,
    level: c.level,
    level_value: c.level_value,
    isUtage: true,
  }))

  return [...std, ...dx, ...utage]
}

export function matchSongForPlayer(song: Song, p: PlayerSettings): PlayerMatch | null {
  const candidates = toCandidates(song).filter((c) => {
    if (c.difficulty > p.maxDifficulty) return false
    if (c.level_value < p.minLevelValue) return false
    if (c.level_value > p.maxLevelValue) return false
    return true
  })

  if (candidates.length === 0) return null

  let best = candidates[0]
  let bestDelta = Math.abs(best.level_value - p.expectedLevelValue)

  for (let i = 1; i < candidates.length; i++) {
    const c = candidates[i]
    const delta = Math.abs(c.level_value - p.expectedLevelValue)

    // delta 更小优先；delta 相同时更接近期望（更小的 level_value 差异相同则取更低定数，偏保守）
    if (delta < bestDelta || (delta === bestDelta && c.level_value < best.level_value)) {
      best = c
      bestDelta = delta
    }
  }

  if (bestDelta > p.maxExpectedDelta) return null
  return { best, delta: bestDelta }
}

export function filterAndSortSongs(options: {
  songs: Song[]
  firstPlayer: PlayerSettings
  secondPlayer: PlayerSettings
  /** 排序主优先级：'first' 表示先贴近 firstPlayer；'second' 表示先贴近 secondPlayer */
  sortPrimary: 'first' | 'second'
}): {
  firstPlayerAvaliabeSongs: { song: Song; match: PlayerMatch }[]
  matchedSongs: MatchedSong[]
} {
  const firstPlayerAvaliabeSongs: { song: Song; match: PlayerMatch }[] = []

  for (const song of options.songs) {
    const m1 = matchSongForPlayer(song, options.firstPlayer)
    if (!m1) continue
    firstPlayerAvaliabeSongs.push({ song, match: m1 })
  }

  const matchedSongs: MatchedSong[] = []
  for (const item of firstPlayerAvaliabeSongs) {
    const m2 = matchSongForPlayer(item.song, options.secondPlayer)
    if (!m2) continue
    matchedSongs.push({ song: item.song, first: item.match, second: m2 })
  }

  const primary = options.sortPrimary
  matchedSongs.sort((a, b) => {
    // 1) 先按两人 delta 之和（越小越“共同合适”）
    const aSum = a.first.delta + a.second.delta
    const bSum = b.first.delta + b.second.delta
    if (aSum !== bSum) return aSum - bSum

    // 2) 再按用户设置的优先级：优先贴近某位玩家期望
    const a1 = primary === 'first' ? a.first.delta : a.second.delta
    const b1 = primary === 'first' ? b.first.delta : b.second.delta
    if (a1 !== b1) return a1 - b1

    // 3) 最后贴近另一位玩家
    const a2 = primary === 'first' ? a.second.delta : a.first.delta
    const b2 = primary === 'first' ? b.second.delta : b.first.delta
    if (a2 !== b2) return a2 - b2

    // 稳定输出：按曲名、再按 id
    const t = a.song.title.localeCompare(b.song.title, 'zh-Hans-CN')
    if (t !== 0) return t
    return a.song.id - b.song.id
  })

  return { firstPlayerAvaliabeSongs, matchedSongs }
}

