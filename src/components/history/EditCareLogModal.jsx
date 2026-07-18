import { useState } from 'react'
import { X } from 'lucide-react'
import TimePicker from '@/components/quickLog/TimePicker'
import FeedingSection from '@/components/quickLog/FeedingSection'
import DiaperSection from '@/components/quickLog/DiaperSection'
import {
  AMOUNT_FEEDING_TYPES,
  POOP_DIAPER_STATUSES,
} from '@/constants/careLog'
import { logToForm } from '@/utils/careLogFormat'

function EditCareLogModal({ log, onClose, onSave, isSaving }) {
  const [form, setForm] = useState(() => logToForm(log))
  const [error, setError] = useState('')

  const updateForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setError('')
  }

  const handleFeedingTypeChange = (feedingType) => {
    updateForm({
      feedingType,
      feedingAmountMl: AMOUNT_FEEDING_TYPES.has(feedingType)
        ? form.feedingAmountMl
        : 0,
      breastLeftMinutes: feedingType === 'breast' ? form.breastLeftMinutes : 0,
      breastRightMinutes: feedingType === 'breast' ? form.breastRightMinutes : 0,
    })
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
    if (form.feedingType === 'none' && form.diaperStatus === 'none') {
      return '수유 또는 기저귀 중 하나 이상 선택해주세요.'
    }
    if (
      form.feedingType === 'breast' &&
      form.breastLeftMinutes === 0 &&
      form.breastRightMinutes === 0
    ) {
      return '모유 수유 시간을 입력해주세요.'
    }
    if (
      AMOUNT_FEEDING_TYPES.has(form.feedingType) &&
      form.feedingAmountMl <= 0
    ) {
      return '수유 용량(ml)을 입력해주세요.'
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

          <FeedingSection
            feedingType={form.feedingType}
            feedingAmountMl={form.feedingAmountMl}
            breastLeftMinutes={form.breastLeftMinutes}
            breastRightMinutes={form.breastRightMinutes}
            onFeedingTypeChange={handleFeedingTypeChange}
            onAmountChange={(feedingAmountMl) => updateForm({ feedingAmountMl })}
            onLeftMinutesChange={(breastLeftMinutes) =>
              updateForm({ breastLeftMinutes })
            }
            onRightMinutesChange={(breastRightMinutes) =>
              updateForm({ breastRightMinutes })
            }
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
