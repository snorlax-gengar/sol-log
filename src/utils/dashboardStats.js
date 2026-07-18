import { breastMinutes, hasFeeding } from '@/utils/careLogFormat'

function startOfDay(date = new Date()) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function getTodaySummary(logs) {
  const today = startOfDay()
  const todayLogs = logs.filter((log) =>
    isSameDay(new Date(log.logged_at), today),
  )

  let totalMl = 0
  let totalBreastMinutes = 0
  let peeCount = 0
  let poopCount = 0

  todayLogs.forEach((log) => {
    if (log.feeding_type && log.feeding_type !== 'none') {
      if (log.feeding_type === 'breast') {
        totalBreastMinutes += breastMinutes(log)
      } else {
        totalMl += log.feeding_amount_ml || 0
      }
    }

    if (log.diaper_status === 'pee' || log.diaper_status === 'both') {
      peeCount += 1
    }
    if (log.diaper_status === 'poop' || log.diaper_status === 'both') {
      poopCount += 1
    }
  })

  return { totalMl, totalBreastMinutes, peeCount, poopCount }
}

export function getLastFeedingAt(logs) {
  const feedingLogs = logs
    .filter(hasFeeding)
    .sort((a, b) => new Date(b.logged_at) - new Date(a.logged_at))

  return feedingLogs[0] ? new Date(feedingLogs[0].logged_at) : null
}

export function formatElapsed(fromDate, now = new Date()) {
  if (!fromDate) return null

  const diffMs = Math.max(0, now - fromDate)
  const totalMinutes = Math.floor(diffMs / 60000)
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60

  if (hours <= 0) return `${minutes}분`
  return `${hours}시간 ${minutes}분`
}

export function formatMinutesDuration(totalMinutes) {
  if (totalMinutes == null) return null
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.round(totalMinutes % 60)
  if (hours <= 0) return `${minutes}분`
  return `${hours}시간 ${minutes}분`
}

/**
 * 오늘 수유 기록들 사이 간격의 평균(분). 수유가 2건 미만이면 null.
 */
export function getTodayAverageFeedingIntervalMinutes(logs) {
  const today = startOfDay()
  const feedings = logs
    .filter(hasFeeding)
    .map((log) => new Date(log.logged_at))
    .filter((date) => isSameDay(date, today))
    .sort((a, b) => a - b)

  if (feedings.length < 2) return null

  let totalMs = 0
  for (let i = 1; i < feedings.length; i += 1) {
    totalMs += feedings[i] - feedings[i - 1]
  }

  return totalMs / (feedings.length - 1) / 60000
}

/**
 * 최근 수유 텀 평균(분): 최근 7일 내 수유 중 마지막 maxSamples+1건의 간격 평균.
 * 수유가 2건 미만이면 null. (알람의 다음 수유 예상에 사용)
 */
export function getRecentAverageFeedingIntervalMinutes(
  logs,
  { maxSamples = 6, maxAgeDays = 7 } = {},
) {
  const since = Date.now() - maxAgeDays * 86400000
  const feedings = logs
    .filter(hasFeeding)
    .map((log) => new Date(log.logged_at))
    .filter((date) => date.getTime() >= since)
    .sort((a, b) => a - b)

  if (feedings.length < 2) return null

  const recent = feedings.slice(-(maxSamples + 1))
  let totalMs = 0
  for (let i = 1; i < recent.length; i += 1) {
    totalMs += recent[i] - recent[i - 1]
  }
  return totalMs / (recent.length - 1) / 60000
}

/**
 * History 타임라인용: 수유 기록 id -> 직전(더 오래된) 수유로부터의 간격(분).
 * 직전 수유가 없으면 맵에 포함되지 않는다.
 */
export function getFeedingIntervalMap(logs) {
  const feedings = logs
    .filter(hasFeeding)
    .sort((a, b) => new Date(a.logged_at) - new Date(b.logged_at))

  const map = new Map()
  for (let i = 1; i < feedings.length; i += 1) {
    const diffMinutes = Math.floor(
      (new Date(feedings[i].logged_at) - new Date(feedings[i - 1].logged_at)) /
        60000,
    )
    map.set(feedings[i].id, diffMinutes)
  }
  return map
}

export function getFeedingHourlyPattern(logs, days = 7) {
  const since = new Date()
  since.setDate(since.getDate() - (days - 1))
  since.setHours(0, 0, 0, 0)

  const counts = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${String(hour).padStart(2, '0')}시`,
    count: 0,
  }))

  logs.forEach((log) => {
    if (!hasFeeding(log)) return
    const loggedAt = new Date(log.logged_at)
    if (loggedAt < since) return
    counts[loggedAt.getHours()].count += 1
  })

  return counts
}

export function getWeightTrend(medicalLogs) {
  return medicalLogs
    .filter((log) => log.baby_weight_kg != null)
    .sort((a, b) => new Date(a.visit_date) - new Date(b.visit_date))
    .map((log) => ({
      date: new Date(log.visit_date).toLocaleDateString('ko-KR', {
        month: 'numeric',
        day: 'numeric',
      }),
      weight: Number(log.baby_weight_kg),
    }))
}

export function getDDayLabel(visitDate) {
  const target = startOfDay(new Date(visitDate))
  const today = startOfDay()
  const diffDays = Math.round((target - today) / 86400000)

  if (diffDays === 0) return 'D-Day'
  if (diffDays > 0) return `D-${diffDays}`
  return `D+${Math.abs(diffDays)}`
}
