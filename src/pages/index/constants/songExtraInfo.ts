export type SongExtraInfo = {
  title: string
  tags?: readonly string[]
  description?: string
}

export const SONG_EXTRA_INFO: Readonly<Record<number, SongExtraInfo>> = {
  189: {
    title: '弱虫モンブラン',
    tags: ['错位入门', '经典练习曲'],
    description: '拍滑错位与星星衔接的入门谱。熟悉后较轻松，不熟时容易连续脑梗，常被视为错位必修曲。',
  },
  1572: {
    title: 'tape/stop/night',
    tags: ['强虫', '星星脑梗', '低物量'],
    description: '常被称为“弱虫加强版”。后半星星映射较特殊，鸟相对容易但鸟加容错低，失误会明显伤分。',
  },
  417: {
    title: 'ウミユリ海底譚',
    tags: ['海底谭', '舞萌科目二', '脑梗谱'],
    description: '集中考查错位、45 度斜向与镜像动作。容易胡到 S，但稳定高分需要读懂手顺，也很容易形成手癖。',
  },
  573: {
    title: '四月の雨',
    tags: ['星星读谱', '谱面-100号', '评价两极'],
    description: '慢 BPM 配合复杂连笔星星，启动时机和读谱压力突出。有人认为优美且有代表性，也有人觉得抽象、易蹭。',
  },
  308: {
    title: 'Back 2 Back',
    tags: ['一笔画入门', '变速星星', '机况敏感'],
    description: '整体定级相对友好，主要难点是一笔画和变速星星。需要分清大手滑与小手防蹭，机况也会影响体验。',
  },
  777: {
    title: '花と、雪と、ドラムンベース。',
    tags: ['花一轮', '均衡 14', '防蹭定位'],
    description: '紫谱整体难度分布均衡，少有特别抽象的星星组合；鸟加时仍要求扫键交互、定位和防蹭稳定。',
  },
  1504: {
    title: 'ばかみたい【Taxi Driver Edition】',
    tags: ['像笨蛋一样', '娱乐谱', '低体力'],
    description: '偏轻松的娱乐谱，不太吃体力或复杂读星。绝赞大多带保护，仅少数关键绝赞需要特别注意。',
  },
  1358: {
    title: 'インドア系ならトラックメイカー',
    tags: ['室内系', '一笔画期末考试', '交互节奏'],
    description: '前后两段一笔画适合练习防蹭与手顺，后段更容易脑梗；交互节奏失准后也可能连续掉分。',
  },
}

export function getSongExtraInfo(songId: number) {
  return SONG_EXTRA_INFO[songId]
}
