import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { hasFeeding } from '@/utils/careLogFormat'
import { getRecentAverageFeedingIntervalMinutes } from '@/utils/dashboardStats'
import { showSystemNotification } from '@/lib/notify'
import { isPushSupported, subscribeToPush, unsubscribeFromPush } from '@/lib/push'

const DEFAULT_INTERVAL_MIN = 180 // 텀 데이터가 부족할 때 기본 3시간
const MIN_INTERVAL_MIN = 60 // 계산된 텀 하한 (오기록 방어)
const MAX_INTERVAL_MIN = 300 // 계산된 텀 상한
const REPEAT_MS = 15 * 60 * 1000 // 재알림 간격 15분
const MAX_ALERTS = 4 // 수유 1건당 최대 알림 횟수
const TICK_MS = 30000
const ENABLED_KEY = 'sol-log:feeding-alarm-enabled'

function loadEnabled() {
  try {
    return window.localStorage.getItem(ENABLED_KEY) === '1'
  } catch {
    return false
  }
}

function saveEnabled(enabled) {
  try {
    window.localStorage.setItem(ENABLED_KEY, enabled ? '1' : '0')
  } catch {
    // 무시
  }
}

function notificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

/**
 * 수유 텀 기반 웹 알람.
 * - 기록이 들어올 때마다(Realtime 포함) 최근 텀 평균으로 다음 수유 예상 시각을 재계산
 * - 예상 시각이 지나면 시스템 알림(가능 시) + onAlarm 콜백(토스트), 15분 간격 재알림
 * - 새 수유가 기록되면 알람 사이클이 자동 리셋
 */
export function useFeedingAlarm(logs, { onAlarm } = {}) {
  const [enabled, setEnabled] = useState(loadEnabled)
  const [permission, setPermission] = useState(notificationPermission)
  const [now, setNow] = useState(() => Date.now())
  const alertStateRef = useRef({ key: null, count: 0, lastAt: 0 })
  const onAlarmRef = useRef(onAlarm)
  onAlarmRef.current = onAlarm

  const lastFeeding = useMemo(() => {
    const feedings = logs
      .filter(hasFeeding)
      .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at))
    return feedings[0] ?? null
  }, [logs])

  const intervalMinutes = useMemo(() => {
    const avg = getRecentAverageFeedingIntervalMinutes(logs)
    if (avg == null) return DEFAULT_INTERVAL_MIN
    return Math.min(MAX_INTERVAL_MIN, Math.max(MIN_INTERVAL_MIN, Math.round(avg)))
  }, [logs])

  const isAuto = useMemo(
    () => getRecentAverageFeedingIntervalMinutes(logs) != null,
    [logs],
  )

  const dueAtMs = lastFeeding
    ? new Date(lastFeeding.logged_at).getTime() + intervalMinutes * 60000
    : null

  useEffect(() => {
    if (!enabled) return undefined
    const timer = setInterval(() => setNow(Date.now()), TICK_MS)
    return () => clearInterval(timer)
  }, [enabled])

  // 알람 발화
  useEffect(() => {
    if (!enabled || !dueAtMs || !lastFeeding) return

    // 새 수유가 기록되면 사이클 리셋
    if (alertStateRef.current.key !== lastFeeding.id) {
      alertStateRef.current = { key: lastFeeding.id, count: 0, lastAt: 0 }
    }

    const state = alertStateRef.current
    if (now < dueAtMs) return
    if (state.count >= MAX_ALERTS) return
    if (state.count > 0 && now - state.lastAt < REPEAT_MS) return

    state.count += 1
    state.lastAt = now

    const overdueMinutes = Math.floor((now - dueAtMs) / 60000)
    const message =
      overdueMinutes < 1
        ? '수유 시간이 되었어요.'
        : `수유 예상 시간이 ${overdueMinutes}분 지났어요.`

    // 서비스워커 경로로 시스템 알림 시도 (설치형 PWA/iOS 포함)
    showSystemNotification({
      title: '솔로그 수유 알람',
      body: message,
      tag: `sol-log-feeding-${lastFeeding.id}`, // 같은 사이클은 알림 갱신
    })

    // 앱이 열려 있으면 인앱 토스트도 함께
    onAlarmRef.current?.(message)
  }, [now, enabled, dueAtMs, lastFeeding])

  const [pushError, setPushError] = useState(null)

  const toggleEnabled = useCallback(async () => {
    const next = !enabled
    setPushError(null)

    if (next && typeof Notification !== 'undefined') {
      let current = Notification.permission
      if (current === 'default') {
        try {
          current = await Notification.requestPermission()
        } catch {
          current = Notification.permission
        }
      }
      setPermission(current)

      // 권한이 있으면 서버 푸시 구독 (앱을 꺼도 알람이 오게)
      if (current === 'granted' && isPushSupported()) {
        const { error } = await subscribeToPush()
        if (error) setPushError(error)
      }
    } else {
      setPermission(notificationPermission())
      if (isPushSupported()) {
        await unsubscribeFromPush()
      }
    }

    // 시스템 알림 권한이 없어도 인앱 토스트 알람은 동작하므로 켜는 것 허용
    setEnabled(next)
    saveEnabled(next)
    setNow(Date.now())
  }, [enabled])

  return {
    enabled,
    toggleEnabled,
    pushError, // 서버 푸시 구독 실패 사유 (없으면 null)
    pushSupported: isPushSupported(),
    permission, // 'granted' | 'denied' | 'default' | 'unsupported'
    intervalMinutes,
    isAuto, // true면 최근 기록 기반 자동 계산, false면 기본 3시간
    dueAt: dueAtMs ? new Date(dueAtMs) : null,
    minutesLeft: dueAtMs ? Math.round((dueAtMs - now) / 60000) : null,
    hasFeedingLog: Boolean(lastFeeding),
  }
}
