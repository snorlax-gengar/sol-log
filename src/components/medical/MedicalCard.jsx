import { Pencil, Trash2 } from 'lucide-react'
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

function MedicalCard({ log, onToggleMedicine, onEdit, onDelete, isBusy }) {
  const dDay = log.is_upcoming ? getDDayLabel(log.visit_date) : null

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
            <span className="shrink-0 whitespace-nowrap rounded-lg bg-[#E6F4EA] px-2 py-1 text-xs font-semibold text-[#2F6B45]">
              {dDay}
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

      {log.symptoms && (
        <p className="text-sm text-stone-600">
          <span className="font-medium text-stone-700">증상 </span>
          {log.symptoms}
        </p>
      )}
      {!log.is_upcoming && log.diagnosis && (
        <p className="mt-1 text-sm text-stone-600">
          <span className="font-medium text-stone-700">진료 </span>
          {log.diagnosis}
        </p>
      )}

      {!log.is_upcoming && (
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
