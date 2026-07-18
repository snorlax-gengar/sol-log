import { useState } from 'react'
import TimePicker from '@/components/quickLog/TimePicker'
import FeedingSection from '@/components/quickLog/FeedingSection'
import DiaperSection from '@/components/quickLog/DiaperSection'
import {
  AMOUNT_FEEDING_TYPES,
  POOP_DIAPER_STATUSES,
} from '@/constants/careLog'
import { useCareLogs } from '@/hooks/useCareLogs'
import { useBreastTimer } from '@/hooks/useBreastTimer'
import { useToast } from '@/components/ui/ToastProvider'
import {
  loadLastFeedingPreset,
  saveLastFeedingPreset,
} from '@/utils/feedingPreset'

function createInitialForm({ keepPreset = true } = {}) {
  // 최근 입력값(수유 종류/용량)을 기본값으로 세팅해 타이핑을 줄인다.
  const preset = keepPreset ? loadLastFeedingPreset() : null

  return {
    loggedAt: new Date(),
    feedingType: preset?.feedingType ?? 'none',
    feedingAmountMl: preset?.feedingAmountMl ?? 0,
    breastLeftMinutes: 0,
    breastRightMinutes: 0,
    diaperStatus: 'none',
    diaperPoopColor: null,
    diaperPoopTexture: null,
    generalNotes: '',
  }
}

function QuickLog() {
  const [form, setForm] = useState(createInitialForm)
  const { insertCareLog, isSaving, error, setError } = useCareLogs()
  const breastTimer = useBreastTimer()
  const { showToast } = useToast()

  const updateForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setError(null)
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

  // 타이머 [완료] -> 측정된 분을 좌/우 입력값에 자동 반영
  const handleTimerFinish = () => {
    const { leftMinutes, rightMinutes } = breastTimer.finish()
    updateForm({
      breastLeftMinutes: leftMinutes,
      breastRightMinutes: rightMinutes,
    })
    showToast(
      `타이머 완료 · 왼쪽 ${leftMinutes}분 / 오른쪽 ${rightMinutes}분 입력됨`,
    )
  }

  const validate = () => {
    if (form.loggedAt > new Date()) {
      return '기록 시간은 현재보다 미래일 수 없습니다.'
    }

    if (form.feedingType === 'none' && form.diaperStatus === 'none') {
      return '수유 또는 기저귀 중 하나 이상 선택해주세요.'
    }

    if (form.feedingType === 'breast') {
      if (breastTimer.isRunning) {
        return '수유 타이머가 아직 실행 중입니다. [완료]를 먼저 눌러주세요.'
      }
      if (form.breastLeftMinutes === 0 && form.breastRightMinutes === 0) {
        return '모유 수유 시간을 입력해주세요.'
      }
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
      showToast(validationError, 'error')
      return
    }

    try {
      const { error: saveError } = await insertCareLog(form)
      if (saveError) {
        showToast(`저장 실패: ${saveError}`, 'error')
        return
      }

      saveLastFeedingPreset(form)
      breastTimer.reset()
      setForm(createInitialForm())
      showToast('기록이 저장되었습니다.')
    } catch (err) {
      const message = err?.message || '기록 저장 중 오류가 발생했습니다.'
      setError(message)
      showToast(`저장 실패: ${message}`, 'error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 pb-2">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">기록하기</h1>
        <p className="mt-1 text-sm text-stone-500">
          수유와 기저귀를 한 번에 남겨보세요.
        </p>
      </div>

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
        breastTimer={breastTimer}
        onTimerFinish={handleTimerFinish}
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
          placeholder="선택 사항 (예: 컨디션, 트름 등)"
          className="min-h-16 w-full resize-none rounded-xl bg-[#FDFBF7] px-3 py-2.5 text-sm text-stone-700 outline-none ring-1 ring-[#E8E2D9] placeholder:text-stone-400 focus:ring-2 focus:ring-[#3D8B5A]/40"
        />
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="min-h-12 w-full rounded-2xl bg-[#3D8B5A] text-base font-semibold text-white shadow-sm transition-opacity disabled:opacity-60"
      >
        {isSaving ? '저장 중…' : '저장하기'}
      </button>
    </form>
  )
}

export default QuickLog
