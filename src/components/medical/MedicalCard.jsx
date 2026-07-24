import { ArrowRightLeft, Pencil, Trash2 } from 'lucide-react'
import ChipButton from '@/components/quickLog/ChipButton'
import { getDDayLabel } from '@/utils/dashboardStats'

function formatVisitDate(value) {
  return new Date(value).toLocaleString('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function MedicalCard({
  log,
  onToggleMedicine,
  onEdit,
  onDelete,
  onPromote,
  isBusy,
}) {
  const dDay = log.is_upcoming ? getDDayLabel(log.visit_date) : null
  const isDue =
    log.is_upcoming && new Date(log.visit_date).getTime() <= Date.now()

  return (
    <article className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          {log.is_upcoming && log.diagnosis && (
            <p className="mb-0.5 text-base font-bold text-stone-800">
              {log.diagnosis}
            </p>
          )}
          <p
            className={
              log.is_upcoming && log.diagnosis
                ? 'text-xs font-medium text-stone-500'
                : 'text-sm font-semibold text-stone-800'
            }
          >
            {formatVisitDate(log.visit_date)}
          </p>
          <p className="mt-0.5 text-xs break-keep text-stone-500">
            {[log.hospital_name, log.department, log.doctor_name]
              .filter(Boolean)
              .join(' · ') || '병원 정보 없음'}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {dDay && (
            <span
              className={`shrink-0 whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold ${
                isDue
                  ? 'bg-[#F7E8D8] text-[#B4552D]'
                  : 'bg-[#E6F4EA] text-[#2F6B45]'
              }`}
            >
              {isDue ? '방문 예정 지남' : dDay}
            </span>
          )}
          <button
            type="button"
            aria-label="수정"
            disabled={isBusy}
            onClick={() => onEdit(log)}
            className="inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-xl text-stone-500 hover:bg-[#E6F4EA] hover:text-[#2F6B45] disabled:opacity-50"
          >
            <Pencil size={18} />
          </button>
          <button
            type="button"
            aria-label="삭제"
            disabled={isBusy}
            onClick={() => onDelete(log)}
            className="inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-xl text-stone-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {(log.baby_weight_kg != null || log.baby_height_cm != null) && (
        <p className="mb-2 text-sm text-stone-700">
          {log.baby_weight_kg != null && `${log.baby_weight_kg}kg`}
          {log.baby_weight_kg != null && log.baby_height_cm != null && ' · '}
          {log.baby_height_cm != null && `${log.baby_height_cm}cm`}
        </p>
      )}

      {(log.symptoms || (!log.is_upcoming && log.diagnosis)) && (
        <div className="mt-2 space-y-2">
          {log.symptoms && (
            <div className="rounded-xl bg-[#F7F3EC] px-3 py-2.5">
              <p className="text-[11px] font-bold tracking-wide text-[#8A7A66]">
                증상
              </p>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">
                {log.symptoms}
              </p>
            </div>
          )}
          {!log.is_upcoming && log.diagnosis && (
            <div className="rounded-xl bg-[#E6F4EA] px-3 py-2.5">
              <p className="text-[11px] font-bold tracking-wide text-[#2F6B45]">
                진료
              </p>
              <p className="mt-1 text-sm leading-relaxed text-stone-700">
                {log.diagnosis}
              </p>
            </div>
          )}
        </div>
      )}

      {log.is_upcoming && onPromote && (
        <div className="mt-3">
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onPromote(log)}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#E6F4EA] text-sm font-semibold text-[#2F6B45] transition-colors hover:bg-[#d8ecdf] disabled:opacity-50"
          >
            <ArrowRightLeft size={16} />
            {isDue ? '진료 기록으로 옮기기' : '진료 완료 · 기록으로 옮기기'}
          </button>
        </div>
      )}

      {!log.is_upcoming &&
        (log.medicine_required ||
          (log.medicine_required == null && log.medicine_checked)) && (
        <div className="mt-3">
          <ChipButton
            selected={log.medicine_checked}
            disabled={isBusy}
            onClick={() => onToggleMedicine(log)}
            className="w-full"
          >
            {log.medicine_checked ? '투약 완료됨' : '투약 체크'}
          </ChipButton>
        </div>
      )}
    </article>
  )
}

export default MedicalCard
