import { AMOUNT_FEEDING_TYPES, FEEDING_TYPES } from '@/constants/careLog'

const STORAGE_KEY = 'sol-log:last-feeding-preset'

const VALID_TYPES = new Set(FEEDING_TYPES.map((item) => item.value))

/**
 * 직전에 저장한 수유 종류/용량을 불러온다.
 * 실패(사파리 프라이빗 모드 등)해도 앱이 죽지 않도록 null 반환.
 */
export function loadLastFeedingPreset() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed || !VALID_TYPES.has(parsed.feedingType)) return null
    if (parsed.feedingType === 'none') return null

    return {
      feedingType: parsed.feedingType,
      feedingAmountMl:
        AMOUNT_FEEDING_TYPES.has(parsed.feedingType) &&
        Number.isFinite(parsed.feedingAmountMl) &&
        parsed.feedingAmountMl > 0
          ? parsed.feedingAmountMl
          : 0,
    }
  } catch {
    return null
  }
}

/** 저장 성공 시 호출: 다음에 폼 기본값으로 쓰일 수유 종류/용량 기억 */
export function saveLastFeedingPreset(form) {
  try {
    if (!form.feedingType || form.feedingType === 'none') return
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        feedingType: form.feedingType,
        feedingAmountMl: AMOUNT_FEEDING_TYPES.has(form.feedingType)
          ? form.feedingAmountMl
          : 0,
      }),
    )
  } catch {
    // localStorage를 못 쓰는 환경이면 조용히 무시
  }
}
