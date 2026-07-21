export const FEEDING_TYPES = [
  { value: 'none', label: '없음' },
  { value: 'breast', label: '모유' },
  { value: 'formula', label: '분유' },
  { value: 'pumped', label: '모유' },
  { value: 'food', label: '이유식' },
]

// 젖병(모유가 아닌 용량 수유) 종류 — 각각 독립적인 ml 입력칸으로 동시에 기록 가능
// 'pumped'(유축 모유 ml)는 과거 기록 표시/집계 호환용으로 남겨두고,
// 입력 폼에는 더 이상 노출하지 않는다 (BOTTLE_ML_INPUT_TYPES 참고).
// 모유는 이제 용량이 아니라 방식(직수/유축)만 BREAST_TYPES로 구분해서 기록한다.
export const BOTTLE_ML_TYPES = [
  { value: 'formula', label: '분유', emoji: '🍼' },
  { value: 'pumped', label: '모유', emoji: '🥛' },
  { value: 'food', label: '이유식', emoji: '🥣' },
]

// 입력 폼에 실제로 보여줄 ml 항목 (모유 유축 ml은 더 이상 입력받지 않음)
export const BOTTLE_ML_INPUT_TYPES = BOTTLE_ML_TYPES.filter(
  (item) => item.value !== 'pumped',
)

// 모유 수유 방식 — 용량(ml)은 기록하지 않고 방식만 구분한다.
export const BREAST_TYPES = [
  { value: 'direct', label: '직수', emoji: '🤱' },
  { value: 'pumped', label: '유축', emoji: '🍼' },
]

// 칩 목록엔 '없음'을 두지 않는다 — 아무것도 선택하지 않은 상태 자체가
// "기저귀 확인 안 함(none)"을 의미하므로 별도 칩이 필요 없다.
// (체크했는데 깨끗했으면 '깨끗'을 선택)
export const DIAPER_STATUSES = [
  { value: 'pee', label: '소변', emoji: '💧' },
  { value: 'poop', label: '대변', emoji: '💩' },
  { value: 'both', label: '둘 다', emoji: '💧💩' },
  { value: 'clean', label: '깨끗', emoji: '✨' },
]

export const POOP_COLORS = [
  { value: 'yellow', label: '황색', swatch: '#F5D76E' },
  { value: 'green', label: '녹색', swatch: '#8FBF8F' },
  { value: 'brown', label: '갈색', swatch: '#A67C52' },
  { value: 'etc', label: '기타', swatch: '#C4B8A8' },
]

export const POOP_TEXTURES = [
  { value: 'normal', label: '정상' },
  { value: 'loose', label: '묽음' },
  { value: 'hard', label: '딱딱' },
]

export const MINUTE_QUICK_ADD = [1, 5, 10]

export const AMOUNT_FEEDING_TYPES = new Set(['formula', 'pumped', 'food'])
export const POOP_DIAPER_STATUSES = new Set(['poop', 'both'])
