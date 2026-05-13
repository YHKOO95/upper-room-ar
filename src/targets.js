export const targets = [
  {
    index: 0,
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
    slug: 'sconce',
    num: '04',
    title: '기도의 능력',
    en: 'Power of Prayer',
    glyph: 'lamp',
    hint: 'UPPER ROOM 구조물',
    message: '네 번째 오브제를 발견했어요. 기도는 하늘을 움직이는 능력입니다.',
    detailTitle: '기도를 시작하는 순간',
    detail:
      '다니엘이 기도를 시작하는 그 순간, 하나님의 응답 명령이 내려졌습니다. 기도는 하나님의 응답을 이끌어내는 통로입니다. 어퍼룸에 모여 기도하는 이 시간이 하늘의 문을 여는 순간입니다.',
    verse: '네가 기도를 시작할 즈음에 명령이 내렸으므로 이제 내가 네게 알리러 왔느니라 너는 크게 은총을 입은 자라.',
    verseRef: '다니엘 9:23',
    reflection: '기도를 시작하는 것이 망설여질 때가 있나요?\n지금 이 자리에서 하나님께 무엇을 구하고 싶은가요?',
  },
];

export function findTargetBySlug(slug) {
  return targets.find((t) => t.slug === slug);
}
