export const targets = [
  {
    index: 0,
    slug: 'light-gate',
    num: '01',
    title: '빛의 문',
    en: 'Gate of Light',
    glyph: 'gate',
    hint: '강당 입구 - 환영 안내판 부근',
    message: '첫 번째 AR 조각을 발견했어요. 하나님이 여시는 길을 기억하세요.',
    detailTitle: '하나님이 여시는 길',
    detail:
      '닫힌 것처럼 보이는 순간에도 하나님은 새로운 길을 여십니다. 빛의 문은 두려움보다 믿음으로 한 걸음 내딛는 초대를 의미합니다.',
    verse: '내가 네 앞에 열린 문을 두었으되 능히 닫을 사람이 없으리라.',
    verseRef: '요한계시록 3:8',
    reflection: '지금 내 삶에서 닫혀 있다고 느끼는 문은 어디인가요?\n믿음으로 한 걸음 내딛는 자리를 떠올려 보세요.',
  },
  {
    index: 1,
    slug: 'word-sword',
    num: '02',
    title: '말씀의 검',
    en: 'Sword of the Word',
    glyph: 'sword',
    hint: '본당 강단 - 십자가 근처',
    message: '두 번째 AR 조각을 발견했어요. 말씀으로 다시 일어서는 시간입니다.',
    detailTitle: '흔들리지 않는 기준',
    detail:
      '말씀의 검은 우리를 무너뜨리는 생각과 상황 속에서 다시 중심을 잡게 하는 하나님의 말씀을 상징합니다.',
    verse: '성령의 검 곧 하나님의 말씀을 가지라.',
    verseRef: '에베소서 6:17',
    reflection: '오늘 내 마음을 흔드는 생각이 있나요?\n말씀의 어떤 구절이 그 자리를 붙잡아 주었나요?',
  },
  {
    index: 2,
    slug: 'prayer-flame',
    num: '03',
    title: '기도의 불씨',
    en: 'Prayer Flame',
    glyph: 'flame',
    hint: '기도실 - 촛대 옆 벽면',
    message: '세 번째 AR 조각을 발견했어요. 작은 기도가 큰 불씨가 됩니다.',
    detailTitle: '작게 시작되는 뜨거움',
    detail:
      '기도의 불씨는 작아 보여도 공동체와 삶을 다시 뜨겁게 하는 시작점입니다. 오늘의 짧은 기도가 내일의 방향을 바꿉니다.',
    verse: '쉬지 말고 기도하라.',
    verseRef: '데살로니가전서 5:17',
    reflection: '내 기도의 자리는 어디인가요?\n쉬지 않고 기도한다는 것이 오늘 내게 무엇을 의미하는지 생각해 보세요.',
  },
  {
    index: 3,
    slug: 'rising-flag',
    num: '04',
    title: '비상의 깃발',
    en: 'Rising Flag',
    glyph: 'flag',
    hint: '야외 광장 - 국기 게양대 옆',
    message: '네 번째 AR 조각을 발견했어요. 이제 함께 비상할 준비가 됐습니다.',
    detailTitle: '함께 일어나는 공동체',
    detail:
      '비상의 깃발은 혼자가 아니라 함께 부르심을 따라 일어나는 공동체를 뜻합니다. 발견한 믿음을 들고 삶의 자리로 나아갑니다.',
    verse: '오직 여호와를 앙망하는 자는 새 힘을 얻으리니 독수리가 날개치며 올라감 같을 것이요.',
    verseRef: '이사야 40:31',
    reflection: '함께 비상하고 싶은 사람이 있나요?\n오늘 밤 그 사람을 위해 기도해 보세요.',
  },
];

export function findTargetBySlug(slug) {
  return targets.find((t) => t.slug === slug);
}
