import { useCallback, useEffect, useRef, useState } from 'react'

function createInitialState() {
  return {
    accumulatedMs: { left: 0, right: 0 },
    activeSide: null, // 'left' | 'right' | null
    runningSince: null, // timestamp(ms) | null
  }
}

function elapsedMsOf(state, side, now = Date.now()) {
  const base = state.accumulatedMs[side]
  if (state.activeSide === side && state.runningSince != null) {
    return base + (now - state.runningSince)
  }
  return base
}

function msToMinutes(ms) {
  if (ms <= 0) return 0
  // 1초라도 측정됐다면 최소 1분으로 기록 (DB 컬럼이 '분' 단위 정수)
  return Math.max(1, Math.round(ms / 60000))
}

/**
 * 모유 수유 스톱워치 훅.
 * - toggleSide('left'|'right'): 해당 쪽 시작/일시정지. 반대쪽이 돌던 중이면 자동 일시정지 후 전환.
 * - finish(): 측정값을 분 단위로 반환하고 타이머 초기화. { leftMinutes, rightMinutes }
 * - reset(): 측정값 폐기.
 */
export function useBreastTimer() {
  const [state, setState] = useState(createInitialState)
  const [now, setNow] = useState(() => Date.now())
  const intervalRef = useRef(null)

  const isRunning = state.activeSide != null && state.runningSince != null

  useEffect(() => {
    if (!isRunning) return undefined
    intervalRef.current = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(intervalRef.current)
  }, [isRunning])

  const toggleSide = useCallback((side) => {
    setState((prev) => {
      const timestamp = Date.now()

      // 같은 쪽이 돌고 있으면 -> 일시정지
      if (prev.activeSide === side && prev.runningSince != null) {
        return {
          ...prev,
          accumulatedMs: {
            ...prev.accumulatedMs,
            [side]: prev.accumulatedMs[side] + (timestamp - prev.runningSince),
          },
          activeSide: null,
          runningSince: null,
        }
      }

      // 반대쪽이 돌고 있으면 -> 반대쪽 누적 후 전환
      if (prev.activeSide && prev.runningSince != null) {
        return {
          accumulatedMs: {
            ...prev.accumulatedMs,
            [prev.activeSide]:
              prev.accumulatedMs[prev.activeSide] +
              (timestamp - prev.runningSince),
          },
          activeSide: side,
          runningSince: timestamp,
        }
      }

      // 정지 상태 -> 시작(재개)
      return {
        ...prev,
        activeSide: side,
        runningSince: timestamp,
      }
    })
    setNow(Date.now())
  }, [])

  const reset = useCallback(() => {
    setState(createInitialState())
  }, [])

  const finish = useCallback(() => {
    let result = { leftMinutes: 0, rightMinutes: 0 }
    setState((prev) => {
      const timestamp = Date.now()
      result = {
        leftMinutes: msToMinutes(elapsedMsOf(prev, 'left', timestamp)),
        rightMinutes: msToMinutes(elapsedMsOf(prev, 'right', timestamp)),
      }
      return createInitialState()
    })
    return result
  }, [])

  const leftMs = elapsedMsOf(state, 'left', now)
  const rightMs = elapsedMsOf(state, 'right', now)

  return {
    leftMs,
    rightMs,
    totalMs: leftMs + rightMs,
    activeSide: state.activeSide,
    isRunning,
    hasMeasured: leftMs > 0 || rightMs > 0,
    toggleSide,
    finish,
    reset,
  }
}

export function formatTimerMs(ms) {
  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
