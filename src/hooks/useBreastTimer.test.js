import { describe, it, expect } from 'vitest'
import { formatTimerMs } from '@/hooks/useBreastTimer'

describe('formatTimerMs', () => {
  it('mm:ss 포맷', () => {
    expect(formatTimerMs(0)).toBe('00:00')
    expect(formatTimerMs(75500)).toBe('01:15')
    expect(formatTimerMs(3600000)).toBe('60:00')
  })
})
