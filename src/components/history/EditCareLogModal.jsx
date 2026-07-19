import { useState } from 'react'
import { X } from 'lucide-react'
import TimePicker from '@/components/quickLog/TimePicker'
import FeedingSection from '@/components/quickLog/FeedingSection'
import DiaperSection from '@/components/quickLog/DiaperSection'
import { POOP_DIAPER_STATUSES } from '@/constants/careLog'
import { logToForm } from '@/utils/careLogFormat'

function EditCareLogModal({ log, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(() => logToForm(log))
  const [error, setError] = useState('')

  const updateForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setError('')
  }

  const handleDiaperStatusChange = (diaperStatus) => {
    const keepPoopDetails = POOP_DIAPER_STATUSES.has(diaperStatus)
    updateForm({
      diaperStatus,
      diaperPoopColor: keepPoopDetails ? form.diaperPoopColor : null,
      diaperPoopTexture: keepPoopDetails ? form.diaperPoopTexture : null,
    })
  }

  const validate = () => {
    if (form.loggedAt > new Date()) {
      return '기록 시간은 현재보다 미래일 수 없습니다.'
    }
    const hasBreast = form.breastLeftMinutes > 0 || form.breastRightMinutes > 0
    const hasBottle =
      (form.formulaMl || 0) > 0 || (form.pumpedMl || 0) > 0 || (form.foodMl || 0) > 0
    if (!hasBreast && !hasBottle && form.diaperStatus === 'none') {
      return '수유 또는 기저귀 중 하나 이상 입력해주세요.'
    }
    if (
      POOP_DIAPER_STATUSES.has(form.diaperStatus) &&
      (!form.diaperPoopColor || !form.diaperPoopTexture)
    ) {
      return '대변 색상과 상태를 선택해주세요.'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    const result = await onSave(form)
    if (result?.error) setError(result.error)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-900/40 p-0 sm:items-center sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-care-log-title"
        className="flex max-h-[92dvh] w-full max-w-[390px] flex-col rounded-t-3xl bg-[#FDFBF7] shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-[#E8E2D9] px-5 py-4">
          <h2
            id="edit-care-log-title"
            className="text-lg font-semibold text-stone-800"
          >
            기록 수정
          </h2>
          <button
            type="button"
            aria-label="닫기"
            onClick={onClose}
            className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-xl text-stone-500 hover:bg-[#E6F4EA]"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4"
        >
          <TimePicker
            value={form.loggedAt}
            onChange={(loggedAt) => updateForm({ loggedAt })}
          />

          {(form.breastLeftMinutes > 0 || form.breastRightMinutes > 0) && (
            <p className="rounded-xl bg-[#F7F1E8] px-3 py-2.5 text-xs leading-relaxed text-stone-500">
              🤱 직접 수유 {form.breastLeftMinutes + form.breastRightMinutes}분 (과거
              기록 · 더 이상 입력 항목은 아니지만 이 값은 그대로 보존돼요)
            </p>
          )}

          <FeedingSection
            formulaMl={form.formulaMl}
            pumpedMl={form.pumpedMl}
            foodMl={form.foodMl}
            onFormulaMlChange={(formulaMl) => updateForm({ formulaMl })}
            onPumpedMlChange={(pumpedMl) => updateForm({ pumpedMl })}
            onFoodMlChange={(foodMl) => updateForm({ foodMl })}
          />

          <DiaperSection
            diaperStatus={form.diaperStatus}
            diaperPoopColor={form.diaperPoopColor}
            diaperPoopTexture={form.diaperPoopTexture}
            onStatusChange={handleDiaperStatusChange}
            onColorChange={(diaperPoopColor) => updateForm({ diaperPoopColor })}
            onTextureChange={(diaperPoopTexture) =>
              updateForm({ diaperPoopTexture })
            }
          />

          <label className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
            <span className="mb-2 block text-sm font-semibold text-stone-800">
              특이사항
            </span>
            <textarea
              value={form.generalNotes}
              onChange={(e) => updateForm({ generalNotes: e.target.value })}
              rows={2}
              className="min-h-16 w-full resize-none rounded-xl bg-[#FDFBF7] px-3 py-2.5 text-sm text-stone-700 outline-none ring-1 ring-[#E8E2D9] focus:ring-2 focus:ring-[#3D8B5A]/40"
            />
          </label>

          {error && (
            <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}

          <div className="sticky bottom-0 flex gap-2 bg-[#FDFBF7] pb-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="min-h-12 flex-1 rounded-2xl bg-white text-sm font-semibold text-stone-600 ring-1 ring-[#E8E2D9]"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="min-h-12 flex-1 rounded-2xl bg-[#3D8B5A] text-sm font-semibold text-white disabled:opacity-60"
            >
              {isSaving ? '저장 중…' : '수정 저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditCareLogModal
