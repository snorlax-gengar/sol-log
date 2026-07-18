import { useEffect, useMemo, useState } from 'react'
import { History, RotateCcw } from 'lucide-react'
import WheelColumn from '@/components/ui/WheelColumn'
import {
  combineLocalDateAndTime,
  formatRelativeAgo,
  formatShortDate,
  toLocalDateValue,
  toLocalTimeValue,
} from '@/utils/dateTime'

const pad = (n) => String(n).padStart(2, '0')

function daysBetween(from, to) {
  const a = new Date(from)
  const b = new Date(to)
  a.setHours(0, 0, 0, 0)
  b.setHours(0, 0, 0, 0)
  return Math.round((b - a) / 86400000)
}

function buildDayOptions(now, selected, pastDays, futureDays) {
  // 선택값이 기본 범위 밖이면 그 날짜까지 자동 확장
  const pastSpan = Math.max(pastDays, daysBetween(selected, now))
  const futureSpan = Math.max(futureDays, daysBetween(now, selected))

  const options = []
  for (let i = pastSpan; i >= -futureSpan; i -= 1) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    options.push({ value: toLocalDateValue(d), label: formatShortDate(d) })
  }
  return options // 과거 -> 미래 순
}

// 24시간제: 시 0-23, 분 00-59
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, h) => ({
  value: h,
  label: String(h),
}))

const MINUTE_OPTIONS = Array.from({ length: 60 }, (_, m) => ({
  value: m,
  label: pad(m),
}))

/**
 * 한 손 조작 최적화 시간 선택기.
 * - 상단: 선택 시각 요약(24시간제) + [방금 전] 리셋
 * - 하단: 텀블러식 휠 피커 (날짜 / 시 0-23 / 분 00-59)
 * - allowFuture=false면 미래 시간 선택 시 이전 값을 유지하고 휠이 원위치로 복귀
 * - allowFuture=true면 미래 날짜/시간 선택 가능 (예약/접종 등)
 */
function TimePicker({
  value,
  onChange,
  title = '언제 했나요?',
  allowFuture = false,
  pastDays = 14,
  futureDays = 90,
}) {
  const [now, setNow] = useState(() => new Date())

  // 상대 시간 표시("35분 전")가 어긋나지 않도록 30초마다 갱신
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const selectedDay = toLocalDateValue(value)
  const dayOptions = useMemo(
    () => buildDayOptions(now, value, pastDays, allowFuture ? futureDays : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [now, selectedDay, pastDays, futureDays, allowFuture],
  )

  const agoLabel = formatRelativeAgo(value, now)

  const emitChange = (next) => {
    if (!allowFuture) {
      // 분 단위로 비교 (초 단위 오차로 인한 애매한 거부 방지)
      const current = new Date()
      current.setSeconds(0, 0)
      if (next > current) return // 미래 거부 -> 휠이 이전 값으로 복귀
    }
    if (next.getTime() !== value.getTime()) onChange(next)
  }

  const handleResetToNow = () => {
    onChange(new Date())
    setNow(new Date())
  }

  const handleWheelChange = (patch) => {
    const parts = {
      day: toLocalDateValue(value),
      hour: value.getHours(),
      minute: value.getMinutes(),
      ...patch,
    }
    const next = combineLocalDateAndTime(
      parts.day,
      `${pad(parts.hour)}:${pad(parts.minute)}`,
    )
    if (Number.isNaN(next.getTime())) return
    emitChange(next)
  }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-stone-800">{title}</h2>
        {agoLabel && (
          <p className="rounded-lg bg-[#E6F4EA] px-2 py-1 text-xs font-semibold text-[#2F6B45]">
            {agoLabel}
          </p>
        )}
      </div>

      {/* 선택 시각 요약 + 방금 전 리셋 */}
      <div className="flex items-stretch gap-2">
        <div className="flex min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-gradient-to-br from-[#E6F4EA] to-[#F2F8F0] px-3.5 py-3 ring-1 ring-[#BBDCC7]/50">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/80 text-[#3D8B5A]">
            <History size={18} />
          </span>
          <p className="truncate text-base font-bold text-stone-800">
            {formatShortDate(value)}
            <span className="mx-1.5 text-stone-300">·</span>
            {toLocalTimeValue(value)}
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetToNow}
          className="flex min-h-12 min-w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-2xl bg-[#3D8B5A] px-3 text-white shadow-sm transition-opacity active:opacity-80"
        >
          <RotateCcw size={16} />
          <span className="text-xs font-semibold">방금 전</span>
        </button>
      </div>

      {/* 휠 피커: 날짜 / 시 : 분 */}
      <div className="mt-3 rounded-2xl bg-[#FDFBF7] p-2 ring-1 ring-[#E8E2D9]/80">
        <div className="flex items-center gap-1">
          <WheelColumn
            ariaLabel="날짜"
            options={dayOptions}
            value={selectedDay}
            onChange={(day) => handleWheelChange({ day })}
          />
          <WheelColumn
            ariaLabel="시 (0-23)"
            options={HOUR_OPTIONS}
            value={value.getHours()}
            onChange={(hour) => handleWheelChange({ hour })}
          />
          <span aria-hidden className="z-10 text-lg font-bold text-stone-300">
            :
          </span>
          <WheelColumn
            ariaLabel="분 (00-59)"
            options={MINUTE_OPTIONS}
            value={value.getMinutes()}
            onChange={(minute) => handleWheelChange({ minute })}
          />
        </div>
      </div>
    </section>
  )
}

export default TimePicker
