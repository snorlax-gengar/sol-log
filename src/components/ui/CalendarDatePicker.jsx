import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { toLocalDateValue } from '@/utils/dateTime'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function parseLocalDate(value) {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, delta) {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1)
}

function sameDay(a, b) {
  return (
    a &&
    b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

function isBeforeDay(a, b) {
  const x = new Date(a)
  const y = new Date(b)
  x.setHours(0, 0, 0, 0)
  y.setHours(0, 0, 0, 0)
  return x < y
}

function isAfterDay(a, b) {
  const x = new Date(a)
  const y = new Date(b)
  x.setHours(0, 0, 0, 0)
  y.setHours(0, 0, 0, 0)
  return x > y
}

function buildCalendarDays(viewMonth) {
  const first = startOfMonth(viewMonth)
  const startOffset = first.getDay()
  const gridStart = new Date(first)
  gridStart.setDate(first.getDate() - startOffset)

  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + i)
    return day
  })
}

function formatTriggerLabel(value) {
  const date = parseLocalDate(value)
  if (!date) return '날짜 선택'
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

/**
 * Sol-Log 톤 커스텀 날짜 피커.
 * 네이티브 <input type="date"> 팝업(파란 선택) 대신 사용.
 */
function CalendarDatePicker({
  value,
  onChange,
  min,
  max,
  allowClear = false,
  ariaLabel = '날짜 선택',
  className = '',
}) {
  const rootRef = useRef(null)
  const panelRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [panelStyle, setPanelStyle] = useState(null)
  const selected = parseLocalDate(value)
  const minDate = parseLocalDate(min)
  const maxDate = parseLocalDate(max)
  const [viewMonth, setViewMonth] = useState(() =>
    startOfMonth(selected || maxDate || new Date()),
  )

  // 열릴 때만 선택일로 맞춤. value 문자열을 의존해 Date 참조 변경으로 달이 리셋되지 않게 한다.
  useEffect(() => {
    if (!open) return
    setViewMonth(
      startOfMonth(parseLocalDate(value) || parseLocalDate(max) || new Date()),
    )
  }, [open, value, max])

  useEffect(() => {
    if (!open) return undefined

    const place = () => {
      const trigger = rootRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const width = 300
      const gap = 8
      const left = Math.min(
        Math.max(12, rect.right - width),
        window.innerWidth - width - 12,
      )
      const spaceBelow = window.innerHeight - rect.bottom
      const openUp = spaceBelow < 360 && rect.top > spaceBelow
      setPanelStyle({
        position: 'fixed',
        left,
        width,
        zIndex: 80,
        ...(openUp
          ? { bottom: window.innerHeight - rect.top + gap }
          : { top: rect.bottom + gap }),
      })
    }

    place()
    const onPointerDown = (event) => {
      if (
        !rootRef.current?.contains(event.target) &&
        !panelRef.current?.contains(event.target)
      ) {
        setOpen(false)
      }
    }
    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('resize', place)
    window.addEventListener('scroll', place, true)
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('resize', place)
      window.removeEventListener('scroll', place, true)
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth])
  const monthLabel = `${viewMonth.getFullYear()}년 ${viewMonth.getMonth() + 1}월`

  const canGoPrev = !minDate || !isBeforeDay(addMonths(viewMonth, -1), startOfMonth(minDate))
  const canGoNext = !maxDate || !isAfterDay(addMonths(viewMonth, 1), startOfMonth(maxDate))

  const isDisabled = (day) => {
    if (minDate && isBeforeDay(day, minDate)) return true
    if (maxDate && isAfterDay(day, maxDate)) return true
    return false
  }

  const pick = (day) => {
    if (isDisabled(day)) return
    onChange(toLocalDateValue(day))
    setOpen(false)
  }

  const pickToday = () => {
    const today = new Date()
    if (isDisabled(today)) return
    onChange(toLocalDateValue(today))
    setViewMonth(startOfMonth(today))
    setOpen(false)
  }

  const clear = () => {
    onChange('')
    setOpen(false)
  }

  return (
    <div ref={rootRef} className={`relative inline-block ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[#FDFBF7] px-3 py-2 text-xs font-semibold text-[#2F6B45] ring-1 ring-[#E8E2D9] transition-colors hover:bg-[#E6F4EA] focus:outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
      >
        <CalendarDays size={14} className="shrink-0 text-[#3D8B5A]" />
        <span>{formatTriggerLabel(value)}</span>
        <ChevronDown
          size={14}
          className={`shrink-0 text-stone-400 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && panelStyle && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="달력"
          style={panelStyle}
          className="calendar-dp rounded-2xl bg-white p-3 shadow-[0_12px_40px_rgba(80,60,40,0.16)] ring-1 ring-[#E8E2D9]"
        >
          <div className="mb-2 flex items-center justify-between gap-2 px-1">
            <p className="text-sm font-bold text-stone-800">{monthLabel}</p>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                aria-label="이전 달"
                disabled={!canGoPrev}
                onClick={() => setViewMonth((m) => addMonths(m, -1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 transition-colors hover:bg-[#E6F4EA] disabled:opacity-30"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                aria-label="다음 달"
                disabled={!canGoNext}
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-stone-600 transition-colors hover:bg-[#E6F4EA] disabled:opacity-30"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>

          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((label, index) => (
              <div
                key={label}
                className={`py-1 text-center text-[11px] font-semibold ${
                  index === 0
                    ? 'text-rose-400'
                    : index === 6
                      ? 'text-sky-500'
                      : 'text-stone-500'
                }`}
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {days.map((day) => {
              const inMonth = day.getMonth() === viewMonth.getMonth()
              const selectedDay = sameDay(day, selected)
              const today = sameDay(day, new Date())
              const disabled = isDisabled(day)
              const weekend = day.getDay() === 0 || day.getDay() === 6

              return (
                <button
                  key={toLocalDateValue(day)}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(day)}
                  className={`relative flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition-colors ${
                    selectedDay
                      ? 'bg-[#3D8B5A] text-white shadow-sm'
                      : disabled
                        ? 'cursor-not-allowed text-stone-300'
                        : inMonth
                          ? weekend
                            ? 'text-stone-600 hover:bg-[#E6F4EA]'
                            : 'text-stone-800 hover:bg-[#E6F4EA]'
                          : 'text-stone-300 hover:bg-[#F7F3EC]'
                  } ${today && !selectedDay ? 'ring-1 ring-[#3D8B5A]/45' : ''}`}
                >
                  {day.getDate()}
                </button>
              )
            })}
          </div>

          <div className="mt-2 flex items-center justify-between border-t border-[#E8E2D9] px-1 pt-2">
            {allowClear ? (
              <button
                type="button"
                onClick={clear}
                className="min-h-10 px-2 text-sm font-semibold text-[#3D8B5A] hover:text-[#2F6B45]"
              >
                삭제
              </button>
            ) : (
              <span />
            )}
            <button
              type="button"
              onClick={pickToday}
              disabled={isDisabled(new Date())}
              className="min-h-10 px-2 text-sm font-semibold text-[#3D8B5A] hover:text-[#2F6B45] disabled:opacity-40"
            >
              오늘
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CalendarDatePicker
