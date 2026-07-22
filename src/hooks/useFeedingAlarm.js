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
const ALERT_STATE_KEY = 'sol-log:feeding-alarm-state'

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

function loadAlertState() {
  try {
    const raw = window.localStorage.getItem(ALERT_STATE_KEY)
    if (!raw) return { key: null, count: 0, lastAt: 0 }
    const parsed = JSON.parse(raw)
    return {
      key: parsed?.key ?? null,
      count: Number(parsed?.count) || 0,
      lastAt: Number(parsed?.lastAt) || 0,
    }
  } catch {
    return { key: null, count: 0, lastAt: 0 }
  }
}

function saveAlertState(state) {
  try {
    window.localStorage.setItem(
      ALERT_STATE_KEY,
      JSON.stringify({
        key: state.key,
        count: state.count,
        lastAt: state.lastAt,
      }),
    )
  } catch {
    // 무시
  }
}

function notificationPermission() {
  if (typeof Notification === 'undefined') return 'unsupported'
  return Notification.permission
}

async function hasActivePushSubscription() {
  if (!isPushSupported()) return false
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return Boolean(subscription)
  } catch {
    return false
  }
}

/**
 * 수유 텀 기반 웹 알람.
 * - 기록이 들어올 때마다(Realtime 포함) 최근 텀 평균으로 다음 수유 예상 시각을 재계산
 * - 서버 Web Push 구독 중이면 OS 알림은 서버(cron)만 담당 → 접속 시 중복 방지
 * - 앱이 열려 있을 때는 인앱 토스트만 (서버 푸시와 역할 분리)
 * - 푸시 미구독/미지원일 때만 클라이언트가 OS 알림 폴백
 */
export function useFeedingAlarm(logs, { onAlarm } = {}) {
  const [enabled, setEnabled] = useState(loadEnabled)
  const [permission, setPermission] = useState(notificationPermission)
  const [now, setNow] = useState(() => Date.now())
  const [serverPushActive, setServerPushActive] = useState(false)
  const [pushStatusKnown, setPushStatusKnown] = useState(() => !isPushSupported())
  const alertStateRef = useRef(loadAlertState())
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

  // 서버 푸시 구독 여부 동기화 (중복 OS 알림 방지용)
  useEffect(() => {
    let cancelled = false
    if (!enabled) {
      setServerPushActive(false)
      setPushStatusKnown(true)
      return undefined
    }
    if (!isPushSupported()) {
      setServerPushActive(false)
      setPushStatusKnown(true)
      return undefined
    }

    setPushStatusKnown(false)
    hasActivePushSubscription().then((active) => {
      if (cancelled) return
      setServerPushActive(active)
      setPushStatusKnown(true)
    })
    return () => {
      cancelled = true
    }
  }, [enabled])

  // 알람 발화
  useEffect(() => {
    if (!enabled || !dueAtMs || !lastFeeding) return
    // 푸시 구독 여부 확인 전에는 OS 알림을 쏘지 않음 (접속 직후 중복 방지)
    if (!pushStatusKnown) return

    // 새 수유가 기록되면 사이클 리셋
    if (alertStateRef.current.key !== lastFeeding.id) {
      alertStateRef.current = { key: lastFeeding.id, count: 0, lastAt: 0 }
      saveAlertState(alertStateRef.current)
    }

    const state = alertStateRef.current
    if (now < dueAtMs) return
    if (state.count >= MAX_ALERTS) return
    if (state.count > 0 && now - state.lastAt < REPEAT_MS) return

    state.count += 1
    state.lastAt = now
    saveAlertState(state)

    const overdueMinutes = Math.floor((now - dueAtMs) / 60000)
    const message =
      overdueMinutes < 1
        ? '수유 시간이 되었어요.'
        : `수유 예상 시간이 ${overdueMinutes}분 지났어요.`

    const appVisible =
      typeof document === 'undefined' || document.visibilityState === 'visible'

    // 서버 Web Push가 활성이면 OS 알림은 cron/SW가 담당.
    // 클라이언트가 다시 showNotification 하면 "접속할 때마다" 중복된다.
    if (!serverPushActive) {
      showSystemNotification({
        title: '솔로그 수유 알람',
        body: message,
        tag: `sol-log-feeding-${lastFeeding.id}`,
      })
    }

    // 앱이 보이는 동안에만 인앱 토스트 (백그라운드 OS 알림과 역할 분리)
    if (appVisible) {
      onAlarmRef.current?.(message)
    }
  }, [now, enabled, dueAtMs, lastFeeding, serverPushActive, pushStatusKnown])

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
        if (error) {
          setPushError(error)
          setServerPushActive(false)
        } else {
          setServerPushActive(await hasActivePushSubscription())
        }
      } else {
        setServerPushActive(false)
      }
    } else {
      setPermission(notificationPermission())
      if (isPushSupported()) {
        await unsubscribeFromPush()
      }
      setServerPushActive(false)
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
