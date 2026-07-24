import { X } from 'lucide-react'
import MedicalForm from '@/components/medical/MedicalForm'

function MedicalFormModal({
  isUpcoming,
  isSaving,
  editingLog = null,
  onSubmit,
  onSave,
  onClose,
}) {
  const title = editingLog
    ? editingLog.is_upcoming
      ? '예약/접종 수정'
      : '진료 기록 수정'
    : isUpcoming
      ? '예약/접종 추가'
      : '진료 기록 추가'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="flex max-h-[92dvh] w-full max-w-[390px] flex-col rounded-t-3xl bg-[#FDFBF7] shadow-xl sm:rounded-3xl"
      >
        <div className="flex shrink-0 items-center justify-between border-b border-[#E8E2D9] px-5 py-4">
          <h2 className="text-lg font-semibold text-stone-800">{title}</h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-stone-500 hover:bg-[#E6F4EA]"
          >
            <X size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <MedicalForm
            key={editingLog?.id ?? (isUpcoming ? 'upcoming' : 'records')}
            variant="plain"
            isUpcoming={isUpcoming}
            isSaving={isSaving}
            editingLog={editingLog}
            onSubmit={onSubmit}
            onSave={onSave}
            onCancelEdit={onClose}
            onSuccess={onClose}
          />
        </div>
      </div>
    </div>
  )
}

export default MedicalFormModal
