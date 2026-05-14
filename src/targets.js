/**
 * 역당 JSON·씬 타깃 개수. 1이면 `station-N-1`만 사용(인식 안정에 유리).
 * 늘리려면 `N-2` … 파일 + index.html 의 xrextras 블록도 같은 개수로 추가.
 */
export const IMAGE_REFS_PER_STATION = 1;

export const targets = [
  {
    index: 0,
    /** `station-{stationNum}-{1…IMAGE_REFS_PER_STATION}` JSON / named-image-target */
    stationNum: 1,
    slug: 'window',
    num: '01',
    title: '기도의 창문',
    en: 'Window of Prayer',
    glyph: 'window',
    hint: '창문 그림',
    message: '첫 번째 오브제를 발견했어요. 다니엘처럼 창문을 열고 기도하세요.',
    detailTitle: '매일의 자리를 지키는 기도',
    detail:
      '다니엘은 금령이 내려진 위기 상황에서도 예루살렘을 향해 창문을 열고 하루 세 번 기도했습니다. 기도의 자리를 지킨다는 것은 환경이 아닌 하나님을 선택하는 것입니다.',
    verse: '다니엘이 예루살렘으로 향한 창문을 열고 전에 하던 대로 하루 세 번씩 무릎을 꿇고 기도하며 그의 하나님께 감사하였더라.',
    verseRef: '다니엘 6:10',
    reflection: '내 삶에서 기도의 자리는 어디인가요?\n매일 하나님을 향해 창문을 여는 그 시간이 있나요?',
  },
  {
    index: 1,
    stationNum: 2,
    slug: 'bible',
    num: '02',
    title: '하나님의 격려',
    en: "God's Encouragement",
    glyph: 'book',
    hint: '책상 위의 펼쳐진 성경책',
    message: '두 번째 오브제를 발견했어요. 두려움 대신 하나님의 격려를 받으세요.',
    detailTitle: '두려움을 넘는 하나님의 말씀',
    detail:
      '하나님은 다니엘에게 "두려워하지 말라 평안하라 강건하라"고 말씀하셨습니다. 가장 연약한 순간에도 하나님의 말씀은 우리를 일으키는 살아있는 격려가 됩니다.',
    verse: '두려워하지 말라 평안하라 강건하라 강건하라.',
    verseRef: '다니엘 10:19',
    reflection: '지금 두려운 마음이 있나요?\n하나님이 오늘 나에게 주시는 격려의 말씀은 무엇인가요?',
  },
  {
    index: 2,
    stationNum: 3,
    slug: 'light',
    num: '03',
    title: '하늘의 빛',
    en: 'Light of Heaven',
    glyph: 'star',
    hint: '무드등 굿즈',
    message: '세 번째 오브제를 발견했어요. 지혜로운 자는 별처럼 영원토록 빛납니다.',
    detailTitle: '별처럼 빛나는 삶',
    detail:
      '지혜 있는 자는 궁창의 빛같이 빛나고, 많은 사람을 옳은 데로 돌아오게 한 자는 별과 같이 영원토록 빛납니다. 하나님의 빛을 받아 세상을 밝히는 삶으로 부름받았습니다.',
    verse: '지혜 있는 자는 궁창의 빛과 같이 빛날 것이요 많은 사람을 옳은 데로 돌아오게 한 자는 별과 같이 영원토록 빛나리라.',
    verseRef: '다니엘 12:3',
    reflection: '내가 빛을 발하고 있는 자리는 어디인가요?\n주변 사람을 하나님께로 인도하고 있나요?',
  },
  {
    index: 3,
    stationNum: 4,
    slug: 'flag',
    num: '04',
    title: '기도의 능력',
    en: 'Daniel 9:23 · Power of prayer',
    glyph: 'flag',
    hint: '어퍼룸 스카시',
    message:
      '네 번째 오브제를 발견했어요. 어퍼룸 스카시 - 다니엘이 간구할 때 명령이 내렸다는 말씀처럼, 기도는 하늘의 응답을 부릅니다.',
    detailTitle: '어퍼룸 스카시 - 다니엘 9:23(기도의 능력)',
    detail:
      '다니엘은 기도로 땅의 시간을 꿰뚫어 보았고, 간구가 시작되는 순간 천사의 직무가 움직였습니다. 어퍼룸 스카시에 서 있듯, 빛이 스며드는 틈처럼 기도는 하나님 나라와 이 땅을 잇는 통로입니다.',
    verse:
      '네가 간구를 시작할 때에 명령이 내려졌고 내가 와서 네게 이르노니 이는 네가 크게 연모함을 받았음이라 그러므로 이 말을 깨닫고 그 이상을 이해할지니라',
    verseRef: '다니엘 9:23',
    reflection:
      '내 기도가 ‘시작’되는 순간, 주님은 이미 일하고 계신다는 것을 믿나요?\n오늘 무릎 꿇는 그 첫마디에 어떤 간구를 맡기고 싶나요?',
  },
];

/** 8th Wall `name` 목록 (한 역의 여러 각도/촬영본) */
export function imageTargetNamesForStation(stationNum) {
  return Array.from(
    { length: IMAGE_REFS_PER_STATION },
    (_, i) => `station-${stationNum}-${i + 1}`,
  );
}

export function findTargetBySlug(slug) {
  return targets.find((t) => t.slug === slug);
}
