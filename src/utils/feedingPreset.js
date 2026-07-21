const STORAGE_KEY = 'sol-log:last-feeding-preset'

function toPositiveMl(value) {
  return Number.isFinite(value) && value > 0 ? value : 0
}

/**
 * 직전에 저장한 젖병(분유/이유식) ml을 불러온다.
 * 모유는 방식(직접수유/유축)만 기록하고 용량이 없어 프리셋 대상이 아니다.
 * 실패(사파리 프라이빗 모드 등)해도 앱이 죽지 않도록 null 반환.
 */
export function loadLastFeedingPreset() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed) return null

    const formulaMl = toPositiveMl(parsed.formulaMl)
    const foodMl = toPositiveMl(parsed.foodMl)
    if (formulaMl === 0 && foodMl === 0) return null

    return { formulaMl, foodMl }
  } catch {
    return null
  }
}

/** 저장 성공 시 호출: 다음에 폼 기본값으로 쓰일 젖병 ml 기억 */
export function saveLastFeedingPreset(form) {
  try {
    const formulaMl = form.formulaMl || 0
    const foodMl = form.foodMl || 0
    if (formulaMl === 0 && foodMl === 0) return

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ formulaMl, foodMl }),
    )
  } catch {
    // localStorage를 못 쓰는 환경이면 조용히 무시
  }
}
