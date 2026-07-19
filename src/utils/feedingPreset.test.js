import { describe, it, expect, beforeEach } from 'vitest'
import {
  loadLastFeedingPreset,
  saveLastFeedingPreset,
} from '@/utils/feedingPreset'

describe('feedingPreset (localStorage)', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('저장한 젖병 ml 복원', () => {
    saveLastFeedingPreset({ formulaMl: 70, pumpedMl: 8, foodMl: 0 })
    expect(loadLastFeedingPreset()).toEqual({
      formulaMl: 70,
      pumpedMl: 8,
      foodMl: 0,
    })
  })

  it('모두 0이면 저장하지 않음', () => {
    saveLastFeedingPreset({ formulaMl: 0, pumpedMl: 0, foodMl: 0 })
    expect(loadLastFeedingPreset()).toBe(null)
  })

  it('손상된 JSON은 null', () => {
    window.localStorage.setItem('sol-log:last-feeding-preset', '{{{broken')
    expect(loadLastFeedingPreset()).toBe(null)
  })
})
