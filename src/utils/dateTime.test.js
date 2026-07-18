import { describe, it, expect } from 'vitest'
import {
  shiftMinutes,
  formatShortDate,
  formatRelativeAgo,
  combineLocalDateAndTime,
  toLocalDateValue,
} from '@/utils/dateTime'

describe('shiftMinutes', () => {
  const base = new Date(2026, 6, 18, 15, 43)

  it('과거로 이동', () => {
    const r = shiftMinutes(base, -30)
    expect(r.getHours()).toBe(15)
    expect(r.getMinutes()).toBe(13)
  })

  it('자정 넘는 롤오버', () => {
    const r = shiftMinutes(new Date(2026, 6, 18, 0, 10), -30)
    expect(r.getDate()).toBe(17)
    expect(r.getHours()).toBe(23)
    expect(r.getMinutes()).toBe(40)
  })

  it('max 클램프로 미래 방지', () => {
    const r = shiftMinutes(base, 120, { max: base })
    expect(r.getTime()).toBe(base.getTime())
  })
})

describe('formatRelativeAgo', () => {
  const base = new Date(2026, 6, 18, 15, 43)

  it('과거', () => {
    expect(formatRelativeAgo(base, base)).toBe('방금')
    expect(formatRelativeAgo(shiftMinutes(base, -35), base)).toBe('35분 전')
    expect(formatRelativeAgo(shiftMinutes(base, -195), base)).toBe('3시간 15분 전')
    expect(formatRelativeAgo(shiftMinutes(base, -120), base)).toBe('2시간 전')
  })

  it('미래 (예약/접종)', () => {
    expect(formatRelativeAgo(shiftMinutes(base, 30), base)).toBe('30분 후')
    expect(formatRelativeAgo(shiftMinutes(base, 90), base)).toBe('1시간 30분 후')
  })

  it('24시간 이상은 null', () => {
    expect(formatRelativeAgo(shiftMinutes(base, -60 * 25), base)).toBe(null)
  })
})

describe('formatShortDate / combine', () => {
  const base = new Date(2026, 6, 18, 15, 43)

  it('짧은 날짜 표기', () => {
    expect(formatShortDate(base)).toMatch(/7.*18/)
  })

  it('날짜+시각 조합 복원', () => {
    const c = combineLocalDateAndTime(toLocalDateValue(base), '09:05')
    expect(c.getHours()).toBe(9)
    expect(c.getMinutes()).toBe(5)
    expect(c.getDate()).toBe(18)
  })
})
