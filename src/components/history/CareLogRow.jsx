import { Trash2 } from 'lucide-react'
import { BOTTLE_ML_TYPES } from '@/constants/careLog'
import {
  diaperStatusEmoji,
  diaperStatusLabel,
  feedingParts,
  hasDiaper,
} from '@/utils/careLogFormat'
import { formatMinutesDuration } from '@/utils/dashboardStats'
import { toLocalTimeValue } from '@/utils/dateTime'

const BOTTLE_META = new Map(BOTTLE_ML_TYPES.map((item) => [item.value, item]))

// 모유·젖병(분유/유축 모유/이유식)을 함께 표시 ("🤱 15분 · 🥛 유축 모유 8ml · 🍼 분유 70ml")
function feedingSummary(log) {
  const { breast, bottles } = feedingParts(log)
  const parts = []
  if (breast) parts.push(`🤱 ${breast.minutes}분`)
  bottles?.forEach(({ type, ml }) => {
    const meta = BOTTLE_META.get(type)
    parts.push(`${meta?.emoji ?? '🍼'} ${meta?.label ?? type} ${ml}ml`)
  })
  return parts.length > 0 ? parts.join(' · ') : null
}

/** 타임라인 한 줄 레코드. 행 탭 = 수정, 휴지통 = 삭제. */
function CareLogRow({ log, intervalMinutes, isBusy, onEdit, onDelete }) {
  const feeding = feedingSummary(log)
  const diaper = hasDiaper(log)

  return (
    <li className="border-b border-[#F1ECE3] last:border-b-0">
      <div className="flex min-h-12 items-center gap-2">
        <button
          type="button"
          onClick={() => onEdit(log)}
          disabled={isBusy}
          className="flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-lg text-left transition-colors hover:bg-[#E6F4EA]/40 disabled:opacity-60"
        >
          {/* 시간 */}
          <span className="w-11 shrink-0 text-sm font-bold tabular-nums text-stone-800">
            {toLocalTimeValue(new Date(log.logged_at))}
          </span>

          {/* 수유 */}
          <span className="min-w-0 flex-1 truncate text-sm text-stone-700">
            {feeding ?? <span className="text-stone-300">수유 없음</span>}
          </span>

          {/* 기저귀 */}
          <span className="shrink-0 text-sm text-stone-600">
            {diaper ? (
              <>
                <span aria-hidden>{diaperStatusEmoji(log.diaper_status)}</span>{' '}
                {diaperStatusLabel(log.diaper_status)}
              </>
            ) : (
              <span className="text-stone-300">–</span>
            )}
          </span>

          {/* 수유 텀 */}
          {intervalMinutes != null && (
            <span className="shrink-0 text-[10px] font-medium text-[#2F6B45]">
              +{formatMinutesDuration(intervalMinutes)}
            </span>
          )}
        </button>

        <button
          type="button"
          aria-label="삭제"
          disabled={isBusy}
          onClick={() => onDelete(log)}
          className="inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-stone-300 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {log.general_notes && (
        <p className="mb-1.5 truncate pl-13 text-xs text-stone-400">
          {log.general_notes}
        </p>
      )}
    </li>
  )
}

export default CareLogRow
