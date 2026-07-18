import { Pencil, Trash2 } from 'lucide-react'
import {
  breastMinutes,
  diaperStatusEmoji,
  diaperStatusLabel,
  feedingTypeLabel,
  formatLoggedAt,
  hasDiaper,
  hasFeeding,
  poopColorLabel,
  poopTextureLabel,
} from '@/utils/careLogFormat'

function CareLogCard({ log, onEdit, onDelete, isBusy }) {
  const feeding = hasFeeding(log)
  const diaper = hasDiaper(log)
  const diaperEmoji = diaper ? diaperStatusEmoji(log.diaper_status) : null

  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-stone-800">
            {formatLoggedAt(log.logged_at)}
          </p>
          {log.general_notes && (
            <p className="mt-1 text-xs text-stone-500">{log.general_notes}</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {diaperEmoji && (
            <span
              aria-label={`기저귀: ${diaperStatusLabel(log.diaper_status)}`}
              title={diaperStatusLabel(log.diaper_status)}
              className="rounded-lg bg-[#F7F1E8] px-2 py-1 text-sm leading-none"
            >
              {diaperEmoji}
            </span>
          )}
          <button
            type="button"
            aria-label="수정"
            disabled={isBusy}
            onClick={() => onEdit(log)}
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-[#E6F4EA] hover:text-[#2F6B45] disabled:opacity-50"
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            aria-label="삭제"
            disabled={isBusy}
            onClick={() => onDelete(log)}
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        {feeding && (
          <div className="rounded-xl bg-[#E6F4EA]/70 px-3 py-2.5">
            <p className="text-xs font-semibold tracking-wide text-[#2F6B45]">
              수유
            </p>
            <p className="mt-1 text-sm text-stone-700">
              {feedingTypeLabel(log.feeding_type)}
              {log.feeding_type === 'breast'
                ? ` · 왼 ${log.breast_left_minutes || 0}분 / 오른 ${log.breast_right_minutes || 0}분 (총 ${breastMinutes(log)}분)`
                : ` · ${log.feeding_amount_ml || 0}ml`}
            </p>
          </div>
        )}

        {diaper && (
          <div className="rounded-xl bg-[#F7F1E8] px-3 py-2.5">
            <p className="text-xs font-semibold tracking-wide text-stone-600">
              기저귀
            </p>
            <p className="mt-1 text-sm text-stone-700">
              {diaperStatusLabel(log.diaper_status)}
              {(log.diaper_status === 'poop' || log.diaper_status === 'both') &&
                log.diaper_poop_color &&
                ` · ${poopColorLabel(log.diaper_poop_color)}`}
              {(log.diaper_status === 'poop' || log.diaper_status === 'both') &&
                log.diaper_poop_texture &&
                ` / ${poopTextureLabel(log.diaper_poop_texture)}`}
            </p>
          </div>
        )}

        {!feeding && !diaper && (
          <p className="text-sm text-stone-500">내용 없는 기록</p>
        )}
      </div>
    </article>
  )
}

export default CareLogCard
