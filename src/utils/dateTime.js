export function toLocalInputValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function toLocalDateValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  const d = date instanceof Date ? date : new Date(date)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function toLocalTimeValue(date) {
  const pad = (n) => String(n).padStart(2, '0')
  const d = date instanceof Date ? date : new Date(date)
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function combineLocalDateAndTime(dateValue, timeValue) {
  return new Date(`${dateValue}T${timeValue}`)
}

export function formatDisplayDateTime(date) {
  const d = date instanceof Date ? date : new Date(date)
  return d.toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function shiftMinutes(date, delta, { max = null } = {}) {
  const next = new Date(date.getTime() + delta * 60 * 1000)
  if (max && next > max) return max
  return next
}

/** "7. 16. (목)" */
export function formatShortDate(date) {
  return date.toLocaleDateString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
  })
}

/** 오늘/어제면 그 라벨, 아니면 짧은 날짜 */
export function formatRelativeDay(date, now = new Date()) {
  const startOf = (d) => {
    const x = new Date(d)
    x.setHours(0, 0, 0, 0)
    return x
  }
  const diffDays = Math.round((startOf(now) - startOf(date)) / 86400000)
  if (diffDays === 0) return '오늘'
  if (diffDays === 1) return '어제'
  return formatShortDate(date)
}

/**
 * 지금과의 상대 시간: "방금" / "35분 전" / "3시간 15분 전" / "30분 후" 등.
 * 24시간 이상 차이 나면 null (날짜가 이미 표시되므로).
 */
export function formatRelativeAgo(date, now = new Date()) {
  const diffMs = now - date
  const totalMinutes = Math.floor(Math.abs(diffMs) / 60000)
  if (totalMinutes < 1) return '방금'
  if (totalMinutes >= 1440) return null

  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  const core =
    hours === 0
      ? `${totalMinutes}분`
      : minutes === 0
        ? `${hours}시간`
        : `${hours}시간 ${minutes}분`

  return diffMs >= 0 ? `${core} 전` : `${core} 후`
}
