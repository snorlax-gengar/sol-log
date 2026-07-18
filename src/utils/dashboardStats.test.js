import { describe, it, expect } from 'vitest'
import {
  formatMinutesDuration,
  getTodayAverageFeedingIntervalMinutes,
  getRecentAverageFeedingIntervalMinutes,
  getFeedingIntervalMap,
  getDailyFeedingTotals,
  getFeedingHeatmap,
} from '@/utils/dashboardStats'

const now = new Date()
function todayAt(h, m = 0) {
  const d = new Date(now)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}
function agoMs(ms) {
  return new Date(now.getTime() - ms).toISOString()
}
const H = 3600000

const feed = (id, iso, extra = {}) => ({
  id,
  feeding_type: 'formula',
  feeding_amount_ml: 60,
  logged_at: iso,
  ...extra,
})

describe('formatMinutesDuration', () => {
  it('시/분 포맷', () => {
    expect(formatMinutesDuration(45)).toBe('45분')
    expect(formatMinutesDuration(195)).toBe('3시간 15분')
    expect(formatMinutesDuration(120)).toBe('2시간 0분')
    expect(formatMinutesDuration(null)).toBe(null)
  })
})

describe('getTodayAverageFeedingIntervalMinutes', () => {
  it('오늘 수유 간격 평균', () => {
    const logs = [
      feed('a', todayAt(6)),
      feed('b', todayAt(9, 30)),
      feed('c', todayAt(12, 30)),
    ]
    expect(Math.round(getTodayAverageFeedingIntervalMinutes(logs))).toBe(195)
  })
  it('2건 미만이면 null', () => {
    expect(getTodayAverageFeedingIntervalMinutes([feed('a', todayAt(6))])).toBe(
      null,
    )
  })
})

describe('getRecentAverageFeedingIntervalMinutes', () => {
  it('최근 간격 평균, 기저귀만 있는 기록 제외', () => {
    const logs = [
      feed('a', agoMs(4 * H)),
      { id: 'd', feeding_type: 'none', diaper_status: 'pee', logged_at: agoMs(2 * H) },
      feed('b', agoMs(0)),
    ]
    expect(Math.round(getRecentAverageFeedingIntervalMinutes(logs))).toBe(240)
  })
})

describe('getFeedingIntervalMap', () => {
  it('직전 수유로부터의 간격(분)', () => {
    const logs = [
      feed('a', todayAt(6)),
      feed('b', todayAt(9)),
      feed('c', todayAt(11)),
    ]
    const map = getFeedingIntervalMap(logs)
    expect(map.get('b')).toBe(180)
    expect(map.get('c')).toBe(120)
    expect(map.has('a')).toBe(false) // 첫 수유는 라벨 없음
  })
})

describe('getDailyFeedingTotals', () => {
  it('일자별 ml/모유분/횟수 집계', () => {
    const logs = [
      feed('a', todayAt(9), { feeding_amount_ml: 60 }),
      feed('b', todayAt(12), { feeding_amount_ml: 75 }),
      {
        id: 'c',
        feeding_type: 'breast',
        breast_left_minutes: 10,
        breast_right_minutes: 5,
        logged_at: todayAt(15),
      },
    ]
    const totals = getDailyFeedingTotals(logs)
    const today = totals[totals.length - 1]
    expect(today.ml).toBe(135)
    expect(today.breastMin).toBe(15)
    expect(today.count).toBe(3)
  })
})

describe('getFeedingHeatmap', () => {
  it('오늘 행이 맨 위, 시간대별 카운트', () => {
    const logs = [feed('a', todayAt(9)), feed('b', todayAt(9)), feed('c', todayAt(14))]
    const heat = getFeedingHeatmap(logs)
    expect(heat[0].counts[9]).toBe(2)
    expect(heat[0].counts[14]).toBe(1)
    expect(heat[0].counts[3]).toBe(0)
  })
})
