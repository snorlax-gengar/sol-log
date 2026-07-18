import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadLastFeedingPreset,
  saveLastFeedingPreset,
} from '@/utils/feedingPreset'

describe('feedingPreset (localStorage)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('저장한 값 복원', () => {
    saveLastFeedingPreset({ feedingType: 'formula', feedingAmountMl: 160 })
    expect(loadLastFeedingPreset()).toEqual({
      feedingType: 'formula',
      feedingAmountMl: 160,
    })
  })

  it('모유는 용량을 0으로 정규화', () => {
    saveLastFeedingPreset({ feedingType: 'breast', feedingAmountMl: 999 })
    expect(loadLastFeedingPreset()).toEqual({
      feedingType: 'breast',
      feedingAmountMl: 0,
    })
  })

  it('none은 저장하지 않음', () => {
    saveLastFeedingPreset({ feedingType: 'none', feedingAmountMl: 100 })
    expect(loadLastFeedingPreset()).toBe(null)
  })

  it('손상된 JSON은 null', () => {
    window.localStorage.setItem('sol-log:last-feeding-preset', '{{{broken')
    expect(loadLastFeedingPreset()).toBe(null)
  })
})
