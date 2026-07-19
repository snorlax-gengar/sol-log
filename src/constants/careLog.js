export const FEEDING_TYPES = [
  { value: 'none', label: '없음' },
  { value: 'breast', label: '모유' },
  { value: 'formula', label: '분유' },
  { value: 'pumped', label: '모유' },
  { value: 'food', label: '이유식' },
]

// 젖병(모유가 아닌 용량 수유) 종류 — 각각 독립적인 ml 입력칸으로 동시에 기록 가능
// (예: 모유 8ml + 분유 70ml 처럼 한 기록에 함께)
export const BOTTLE_ML_TYPES = [
  { value: 'formula', label: '분유', emoji: '🍼' },
  { value: 'pumped', label: '모유', emoji: '🥛' },
  { value: 'food', label: '이유식', emoji: '🥣' },
]

export const DIAPER_STATUSES = [
  { value: 'none', label: '없음', emoji: null },
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
