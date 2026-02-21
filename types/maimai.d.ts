declare namespace MaiMai {
  namespace LXNS {
    namespace API {
      namespace Types {
        /**
         * 收藏品类型（URL 参数 `collection_type`）。
         *
         * - `trophy`: 称号
         * - `icon`: 头像
         * - `plate`: 姓名框
         * - `frame`: 背景
         */
        type CollectionType = "trophy" | "icon" | "plate" | "frame";

        /** 玩家（用于上传/获取）。 */
        interface Player {
          /** 游戏内名称 */
          name: string;
          /** 玩家 DX Rating */
          rating: number;
          /** 好友码 */
          friend_code: number;
          /** 段位 ID */
          course_rank: number;
          /** 阶级 ID */
          class_rank: number;
          /** 搭档觉醒数 */
          star: number;
          /** 仅上传时可空，称号 */
          trophy?: Trophy | null;
          /** 值可空，头像 */
          icon?: Icon | null;
          /** 值可空，姓名框 */
          name_plate?: NamePlate | null;
          /** 值可空，背景 */
          frame?: Frame | null;
          /** 仅获取玩家信息返回，玩家被同步时的 UTC 时间 */
          upload_time?: string;
        }

        /** 游玩成绩 */
        interface Score {
          /** 曲目 ID */
          id: number;
          /** 仅获取 `Score` 时返回，曲名 */
          song_name?: string;
          /** 仅获取 `Score` 时返回，难度标级，如 `14+` */
          level?: string;
          /** 难度 */
          level_index: LevelIndex;
          /** 达成率 */
          achievements: number;
          /** 值可空，FULL COMBO 类型 */
          fc?: FCType | null;
          /** 值可空，FULL SYNC 类型 */
          fs?: FSType | null;
          /** DX 分数 */
          dx_score: number;
          /** DX 星级，最大值为 5 */
          dx_star?: number;
          /** 仅获取 `Score` 时返回，DX Rating（计算时需要向下取整） */
          dx_rating?: number;
          /** 仅获取 `Score` 时返回，评级类型 */
          rate?: RateType;
          /** 谱面类型 */
          type: SongType;
          /** 值可空，游玩的 UTC 时间，精确到分钟 */
          play_time?: string | null;
          /** 仅获取 `Score` 时返回，成绩被同步时的 UTC 时间 */
          upload_time?: string;
          /** 仅获取成绩列表/最佳成绩时返回，谱面最后游玩的 UTC 时间 */
          last_played_time?: string;
        }

        /** 游玩成绩（简化） */
        interface SimpleScore {
          /** 曲目 ID */
          id: number;
          /** 曲名 */
          song_name: string;
          /** 难度标级，如 `14+` */
          level: string;
          /** 难度 */
          level_index: LevelIndex;
          /** 值可空，FULL COMBO 类型 */
          fc?: FCType | null;
          /** 值可空，FULL SYNC 类型 */
          fs?: FSType | null;
          /** 评级类型 */
          rate: RateType;
          /** 谱面类型 */
          type: SongType;
        }

        /** DX Rating 趋势 */
        interface RatingTrend {
          /** 总 DX Rating */
          total: number;
          /** 旧版本谱面总 DX Rating */
          standard: number;
          /** 现版本谱面总 DX Rating */
          dx: number;
          /** 日期 */
          date: string;
        }

        /** 曲目 */
        interface Song {
          /** 曲目 ID */
          id: number;
          /** 曲名 */
          title: string;
          /** 艺术家 */
          artist: string;
          /** 曲目分类 */
          genre: string;
          /** 曲目 BPM */
          bpm: number;
          /** 值可空，曲目所属区域 */
          map?: string | null;
          /** 曲目首次出现版本 */
          version: number;
          /** 值可空，曲目版权信息 */
          rights?: string | null;
          /** 值可空，是否需要解锁，默认值为 `false` */
          locked?: boolean | null;
          /** 值可空，是否被禁用，默认值为 `false` */
          disabled?: boolean | null;
          /** 谱面难度 */
          difficulties: SongDifficulties;
        }

        /** 谱面难度 */
        interface SongDifficulties {
          /** 曲目标准谱面难度列表 */
          standard: SongDifficulty[];
          /** 曲目 DX 谱面难度列表 */
          dx: SongDifficulty[];
          /** 可选，宴会场曲目谱面难度列表 */
          utage?: SongDifficultyUtage[];
        }

        /** 谱面难度 */
        interface SongDifficulty {
          /** 谱面类型 */
          type: SongType;
          /** 难度 */
          difficulty: LevelIndex;
          /** 难度标级 */
          level: string;
          /** 谱面定数 */
          level_value: number;
          /** 谱师 */
          note_designer: string;
          /** 谱面首次出现版本 */
          version: number;
          /** 值可空，谱面物量 */
          notes?: Notes | null;
        }

        /** 宴会场曲目谱面难度 */
        interface SongDifficultyUtage {
          /** 谱面类型 */
          type: SongType;
          /** 难度 */
          difficulty: LevelIndex;
          /** 难度标级 */
          level: string;
          /** 谱面定数 */
          level_value: number;
          /** 谱师 */
          note_designer: string;
          /** 谱面首次出现版本 */
          version: number;
          /** 谱面属性 */
          kanji: string;
          /** 谱面描述 */
          description: string;
          /** 是否为 BUDDY 谱面 */
          is_buddy: boolean;
          /** 值可空，谱面物量（当 `is_buddy=true` 时为 `BuddyNotes`） */
          notes?: Notes | BuddyNotes | null;
        }

        /** 谱面物量 */
        interface Notes {
          /** 总物量 */
          total: number;
          /** TAP 物量 */
          tap: number;
          /** HOLD 物量 */
          hold: number;
          /** SLIDE 物量 */
          slide: number;
          /** TOUCH 物量 */
          touch: number;
          /** BREAK 物量 */
          break: number;
        }

        /** 仅宴会场曲目，BUDDY 谱面物量 */
        interface BuddyNotes {
          /** 1P 谱面物量 */
          left: Notes;
          /** 2P 谱面物量 */
          right: Notes;
        }

        /** 乐曲分类 */
        interface Genre {
          /** 内部 ID */
          id: number;
          /** 分类标题 */
          title: string;
          /** 分类标题（日文） */
          genre: string;
        }

        /** 曲目版本 */
        interface Version {
          /** 内部 ID */
          id: number;
          /** 版本标题 */
          title: string;
          /** 主要版本 ID */
          version: number;
        }

        /** 曲目别名 */
        interface Alias {
          /** 曲目 ID */
          song_id: number;
          /** 曲目所有别名 */
          aliases: string[];
        }

        /** 收藏品 */
        interface Collection {
          /** 收藏品 ID */
          id: number;
          /** 收藏品名称 */
          name: string;
          /** 值可空，仅玩家称号，称号颜色 */
          color?: TrophyColor | null;
          /** 值可空，收藏品说明 */
          description?: string | null;
          /** 值可空，除玩家称号，收藏品分类（日文） */
          genre?: string | null;
          /** 值可空，收藏品要求 */
          required?: CollectionRequired[] | null;
        }

        /** 收藏品要求 */
        interface CollectionRequired {
          /** 值可空，要求的谱面难度，长度为 0 时代表任意难度 */
          difficulties?: LevelIndex[] | null;
          /** 值可空，要求的评级类型 */
          rate?: RateType | null;
          /** 值可空，要求的 FULL COMBO 类型 */
          fc?: FCType | null;
          /** 值可空，要求的 FULL SYNC 类型 */
          fs?: FSType | null;
          /** 值可空，要求的曲目列表 */
          songs?: CollectionRequiredSong[] | null;
          /** 值可空，要求是否全部完成 */
          completed?: boolean | null;
        }

        /** 收藏品要求曲目 */
        interface CollectionRequiredSong {
          /** 曲目 ID */
          id: number;
          /** 曲名 */
          title: string;
          /** 谱面类型 */
          type: SongType;
          /** 值可空，要求的曲目是否完成 */
          completed?: boolean | null;
          /** 值可空，已完成的难度 */
          completed_difficulties?: LevelIndex[] | null;
        }

        /** 收藏品分类 */
        interface CollectionGenre {
          /** 收藏品分类 ID */
          id: number;
          /** 分类标题 */
          title: string;
          /** 分类标题（日文） */
          genre: string;
        }

        /** `Collection` 的语义别名：称号 */
        type Trophy = Collection;
        /** `Collection` 的语义别名：头像 */
        type Icon = Collection;
        /** `Collection` 的语义别名：姓名框 */
        type NamePlate = Collection;
        /** `Collection` 的语义别名：背景 */
        type Frame = Collection;

        /** 难度：0(BASIC) / 1(ADVANCED) / 2(EXPERT) / 3(MASTER) / 4(Re:MASTER) */
        type LevelIndex = 0 | 1 | 2 | 3 | 4;

        /** FULL COMBO 类型 */
        type FCType = "app" | "ap" | "fcp" | "fc";

        /** FULL SYNC 类型 */
        type FSType = "fsdp" | "fsd" | "fsp" | "fs" | "sync";

        /** 评级类型 */
        type RateType =
          | "sssp"
          | "sss"
          | "ssp"
          | "ss"
          | "sp"
          | "s"
          | "aaa"
          | "aa"
          | "a"
          | "bbb"
          | "bb"
          | "b"
          | "c"
          | "d";

        /** 谱面类型 */
        type SongType = "standard" | "dx" | "utage";

        /** 玩家称号颜色 */
        type TrophyColor = "normal" | "bronze" | "silver" | "gold" | "rainbow";
      }

      /**
       * `POST /api/v0/maimai/player`
       * 创建或修改玩家信息。
       */
      namespace UpsertPlayer {
        type Request = Types.Player;
        type Response = void;
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}`
       * 获取玩家信息。
       */
      namespace GetPlayerInfo {
        interface Request {
          /** 好友码 */
          friend_code: number;
        }
        type Response = Types.Player;
      }

      /**
       * `GET /api/v0/maimai/player/qq/{qq}`
       * 通过 QQ 号获取玩家信息。
       */
      namespace GetPlayerInfoByQQ {
        interface Request {
          /** 查分器用户绑定的 QQ 号 */
          qq: number;
        }
        type Response = Types.Player;
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/best`
       * 获取玩家缓存谱面的最佳成绩。
       */
      namespace GetPlayerBestScore {
        interface Request {
          /** 好友码 */
          friend_code: number;
          /** 曲目 ID，与 `song_name` 冲突 */
          song_id?: number;
          /** 曲名，与 `song_id` 冲突 */
          song_name?: string;
          /** 难度 */
          level_index?: Types.LevelIndex;
          /** 谱面类型 */
          song_type?: Types.SongType;
        }
        type Response = Types.Score;
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/bests`
       * 获取玩家缓存的 Best 50。
       */
      namespace GetPlayerBest50 {
        interface Request {
          /** 好友码 */
          friend_code: number;
        }
        interface Response {
          /** 旧版本谱面 Best 35 总分 */
          standard_total: number;
          /** 现版本谱面 Best 15 总分 */
          dx_total: number;
          /** 旧版本谱面 Best 35 列表 */
          standard: Types.Score[];
          /** 现版本谱面 Best 15 列表 */
          dx: Types.Score[];
        }
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/bests/ap`
       * 获取玩家缓存的 All Perfect 50。
       */
      namespace GetPlayerAllPerfect50 {
        interface Request {
          /** 好友码 */
          friend_code: number;
        }
        type Response = GetPlayerBest50.Response;
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/bests`
       * 获取玩家缓存单曲所有谱面的成绩。
       */
      namespace GetPlayerSongBests {
        interface Request {
          /** 好友码 */
          friend_code: number;
          /** 曲目 ID，与 `song_name` 冲突 */
          song_id?: number;
          /** 曲名，与 `song_id` 冲突 */
          song_name?: string;
          /** 谱面类型 */
          song_type?: Types.SongType;
        }
        type Response = Types.Score[];
      }

      /**
       * `POST /api/v0/maimai/player/{friend_code}/scores`
       * 上传玩家成绩。
       */
      namespace UploadPlayerScores {
        interface Request {
          /** 好友码 */
          friend_code: number;
          /** JSON 格式的玩家成绩 */
          scores: Types.Score[];
        }
        type Response = void;
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/recents`
       * 获取玩家缓存的 Recent 50（仅增量爬取可用），按照 `play_time` 排序。
       */
      namespace GetPlayerRecents {
        interface Request {
          /** 好友码 */
          friend_code: number;
        }
        type Response = Types.Score[];
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/scores`
       * 获取玩家缓存的所有最佳成绩（简化后）。
       */
      namespace GetPlayerScoresSimplified {
        interface Request {
          /** 好友码 */
          friend_code: number;
        }
        type Response = Types.SimpleScore[];
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/heatmap`
       * 获取玩家成绩上传热力图。
       */
      namespace GetPlayerScoreUploadHeatmap {
        interface Request {
          /** 好友码 */
          friend_code: number;
        }
        /**
         * 日期与成绩数量的映射：
         * - key: 日期（`YYYY-MM-DD`）
         * - value: 该日期上传的成绩数量
         */
        type Response = Record<string, number>;
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/trend`
       * 获取玩家 DX Rating 趋势。
       */
      namespace GetPlayerRatingTrend {
        interface Request {
          /** 好友码 */
          friend_code: number;
          /** 值可空，游戏版本，默认值为 `25000` */
          version?: number;
        }
        type Response = Types.RatingTrend[];
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/score/history`
       * 获取玩家成绩游玩历史记录（仅返回带有 `play_time` 的成绩）。
       */
      namespace GetPlayerScoreHistory {
        interface Request {
          /** 好友码 */
          friend_code: number;
          /** 曲目 ID */
          song_id: number;
          /** 谱面类型 */
          song_type: Types.SongType;
          /** 难度 */
          level_index: Types.LevelIndex;
        }
        type Response = Types.Score[];
      }

      /**
       * `GET /api/v0/maimai/player/{friend_code}/{collection_type}/{collection_id}`
       * 获取玩家收藏品进度。
       */
      namespace GetPlayerCollectionProgress {
        interface Request {
          /** 好友码 */
          friend_code: number;
          /** 收藏品类型 */
          collection_type: Types.CollectionType;
          /** 收藏品 ID */
          collection_id: number;
        }
        type Response = Types.Collection;
      }

      /**
       * `POST /api/v0/maimai/player/{friend_code}/html`
       * 通过 NET 的 HTML 源代码上传玩家数据。
       */
      namespace UploadPlayerDataByHTML {
        interface Request {
          /** 好友码 */
          friend_code: number;
          /** 文本格式的 HTML 源代码（应当完整，非流式）。 */
          html: string;
        }
        type Response = void;
      }

      /**
       * `GET /api/v0/user/maimai/player`
       * 获取玩家信息。
       */
      namespace GetMyPlayerInfo {
        type Request = Record<string, never>;
        type Response = Types.Player;
      }

      /**
       * `GET /api/v0/user/maimai/player/scores`
       * 获取玩家所有成绩。
       */
      namespace GetMyScores {
        type Request = Record<string, never>;
        type Response = Types.Score[];
      }

      /**
       * `POST /api/v0/user/maimai/player/scores`
       * 上传玩家成绩。
       */
      namespace UploadMyScores {
        interface Request {
          /** JSON 格式的玩家成绩 */
          scores: Types.Score[];
        }
        type Response = void;
      }

      /**
       * `GET /api/v0/maimai/song/list`
       * 获取曲目列表。
       */
      namespace GetSongList {
        interface Request {
          /** 值可空，游戏版本，默认值为 `25000` */
          version?: number;
          /** 值可空，是否包含谱面物量，默认值为 `false` */
          notes?: boolean;
        }
        interface Response {
          /** 曲目列表 */
          songs: Types.Song[];
          /** 乐曲分类列表 */
          genres: Types.Genre[];
          /** 曲目版本列表 */
          versions: Types.Version[];
        }
      }

      /**
       * `GET /api/v0/maimai/song/{song_id}`
       * 获取曲目信息。
       */
      namespace GetSong {
        interface Request {
          /** 值可空，游戏版本，默认值为 `25000` */
          version?: number;
          /** 曲目 ID */
          song_id: number;
        }
        type Response = Types.Song;
      }

      /**
       * `GET /api/v0/maimai/alias/list`
       * 获取曲目别名列表。
       */
      namespace GetAliasList {
        type Request = Record<string, never>;
        interface Response {
          /** 曲目别名列表 */
          aliases: Types.Alias[];
        }
      }

      /**
       * `GET /api/v0/maimai/{collection_type}/list`
       * 获取收藏品列表。
       */
      namespace GetCollectionList {
        interface Request {
          /** 值可空，游戏版本，默认值为 `25000` */
          version?: number;
          /** 值可空，是否包含曲目需求，默认值为 `false` */
          required?: boolean;
          /** 收藏品类型 */
          collection_type: Types.CollectionType;
        }
        interface Response {
          /** 仅收藏品类型为 `trophy`，称号列表 */
          trophies?: Types.Collection[];
          /** 仅收藏品类型为 `icon`，头像列表 */
          icons?: Types.Collection[];
          /** 仅收藏品类型为 `plate`，姓名框列表 */
          plates?: Types.Collection[];
          /** 仅收藏品类型为 `frame`，背景列表 */
          frames?: Types.Collection[];
        }
      }

      /**
       * `GET /api/v0/maimai/{collection_type}/{collection_id}`
       * 获取收藏品信息。
       */
      namespace GetCollection {
        interface Request {
          /** 值可空，游戏版本，默认值为 `25000` */
          version?: number;
          /** 收藏品类型 */
          collection_type: Types.CollectionType;
          /** 收藏品 ID */
          collection_id: number;
        }
        type Response = Types.Collection;
      }

      /**
       * `GET /api/v0/maimai/collection-genre/list`
       * 获取收藏品分类列表。
       */
      namespace GetCollectionGenreList {
        interface Request {
          /** 值可空，游戏版本，默认值为 `25000` */
          version?: number;
        }
        interface Response {
          /** 收藏品分类列表 */
          collectionGenres: Types.CollectionGenre[];
        }
      }

      /**
       * `GET /api/v0/maimai/collection-genre/{collection_genre_id}`
       * 获取收藏品分类信息。
       */
      namespace GetCollectionGenre {
        interface Request {
          /** 值可空，游戏版本，默认值为 `25000` */
          version?: number;
          /** 收藏品分类 ID */
          collection_genre_id: number;
        }
        type Response = Types.CollectionGenre;
      }
    }
  }
}