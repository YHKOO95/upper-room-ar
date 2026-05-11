export const targets = [
  {
    index: 0,
    slug: 'light-gate',
    title: '빛의 문',
    message: '첫 번째 AR 조각을 발견했어요. 하나님이 여시는 길을 기억하세요.',
    detailTitle: '하나님이 여시는 길',
    detail:
      '닫힌 것처럼 보이는 순간에도 하나님은 새로운 길을 여십니다. 빛의 문은 두려움보다 믿음으로 한 걸음 내딛는 초대를 의미합니다.',
    verse: '내가 네 앞에 열린 문을 두었으되 능히 닫을 사람이 없으리라.',
    verseRef: '요한계시록 3:8',
  },
  {
    index: 1,
    slug: 'word-sword',
    title: '말씀의 검',
    message: '두 번째 AR 조각을 발견했어요. 말씀으로 다시 일어서는 시간입니다.',
    detailTitle: '흔들리지 않는 기준',
    detail:
      '말씀의 검은 우리를 무너뜨리는 생각과 상황 속에서 다시 중심을 잡게 하는 하나님의 말씀을 상징합니다.',
    verse: '성령의 검 곧 하나님의 말씀을 가지라.',
    verseRef: '에베소서 6:17',
  },
  {
    index: 2,
    slug: 'prayer-flame',
    title: '기도의 불씨',
    message: '세 번째 AR 조각을 발견했어요. 작은 기도가 큰 불씨가 됩니다.',
    detailTitle: '작게 시작되는 뜨거움',
    detail:
      '기도의 불씨는 작아 보여도 공동체와 삶을 다시 뜨겁게 하는 시작점입니다. 오늘의 짧은 기도가 내일의 방향을 바꿉니다.',
    verse: '쉬지 말고 기도하라.',
    verseRef: '데살로니가전서 5:17',
  },
  {
    index: 3,
    slug: 'rising-flag',
    title: '비상의 깃발',
    message: '네 번째 AR 조각을 발견했어요. 이제 함께 비상할 준비가 됐습니다.',
    detailTitle: '함께 일어나는 공동체',
    detail:
      '비상의 깃발은 혼자가 아니라 함께 부르심을 따라 일어나는 공동체를 뜻합니다. 발견한 믿음을 들고 삶의 자리로 나아갑니다.',
    verse: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요.',
    verseRef: '이사야 40:31',
  },
];

export function findTargetBySlug(slug) {
  return targets.find((target) => target.slug === slug);
}
