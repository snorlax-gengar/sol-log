const STORAGE_KEY = 'sol-log:home-visibility'

/** @type {ReadonlyArray<{ key: keyof typeof DEFAULT_HOME_VISIBILITY, label: string, description: string }>} */
export const HOME_VISIBILITY_OPTIONS = [
  {
    key: 'feedingTimer',
    label: '수유 경과 타이머',
    description: '마지막 수유 후 경과 시간',
  },
  {
    key: 'nextFeeding',
    label: '다음 수유 알람',
    description: '예정 시각과 알림 설정',
  },
  {
    key: 'summaryCards',
    label: '오늘 요약',
    description: '수유량·기저귀·간격 카드',
  },
  {
    key: 'dailyTotals',
    label: '일자별 총 수유량',
    description: '최근 7일 막대 차트',
  },
  {
    key: 'heatmap',
    label: '수유 리듬 히트맵',
    description: '날짜·시간대별 수유 빈도',
  },
  {
    key: 'weightTrend',
    label: '몸무게 변화',
    description: '성장 추이 선 그래프',
  },
]

export const DEFAULT_HOME_VISIBILITY = Object.freeze({
  feedingTimer: true,
  nextFeeding: true,
  summaryCards: true,
  dailyTotals: true,
  heatmap: true,
  weightTrend: true,
})

function isPlainObject(value) {
  return value != null && typeof value === 'object' && !Array.isArray(value)
}

/** localStorage에서 홈 표시 설정을 불러온다. 실패 시 기본값. */
export function loadHomeVisibility() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULT_HOME_VISIBILITY }

    const parsed = JSON.parse(raw)
    if (!isPlainObject(parsed)) return { ...DEFAULT_HOME_VISIBILITY }

    const next = { ...DEFAULT_HOME_VISIBILITY }
    for (const key of Object.keys(DEFAULT_HOME_VISIBILITY)) {
      if (typeof parsed[key] === 'boolean') next[key] = parsed[key]
    }
    return next
  } catch {
    return { ...DEFAULT_HOME_VISIBILITY }
  }
}

/** 홈 표시 설정을 저장한다. localStorage 불가 환경에서는 무시. */
export function saveHomeVisibility(visibility) {
  try {
    const next = { ...DEFAULT_HOME_VISIBILITY }
    for (const key of Object.keys(DEFAULT_HOME_VISIBILITY)) {
      if (typeof visibility?.[key] === 'boolean') next[key] = visibility[key]
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    return next
  } catch {
    return visibility
  }
}

export function hasAnyHomeSectionVisible(visibility) {
  return Object.values(visibility).some(Boolean)
}
