import { useState } from 'react'
import ChipButton from '@/components/quickLog/ChipButton'
import TimePicker from '@/components/quickLog/TimePicker'
import { UPCOMING_PURPOSE_PRESETS } from '@/constants/medical'

function createInitialForm(isUpcoming) {
  return {
    visitDate: new Date(),
    purpose: '', // 예약/접종 일정 내용 (diagnosis 컬럼에 저장)
    hospitalName: '',
    doctorName: '',
    symptoms: '',
    diagnosis: '',
    babyWeightKg: '',
    babyHeightCm: '',
    isUpcoming,
    medicineChecked: false,
  }
}

function MedicalForm({ isUpcoming, onSubmit, isSaving }) {
  const [form, setForm] = useState(() => createInitialForm(isUpcoming))
  const [error, setError] = useState('')

  const updateForm = (patch) => {
    setForm((prev) => ({ ...prev, ...patch }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!form.visitDate) {
      setError('일시를 선택해주세요.')
      return
    }

    if (isUpcoming && !form.purpose.trim()) {
      setError('무슨 일정인지 선택하거나 입력해주세요. (예: BCG 접종)')
      return
    }

    const weight =
      form.babyWeightKg === '' ? null : Number(form.babyWeightKg)
    const height =
      form.babyHeightCm === '' ? null : Number(form.babyHeightCm)

    if (form.babyWeightKg !== '' && Number.isNaN(weight)) {
      setError('몸무게는 숫자로 입력해주세요.')
      return
    }
    if (form.babyHeightCm !== '' && Number.isNaN(height)) {
      setError('키는 숫자로 입력해주세요.')
      return
    }

    const result = await onSubmit({
      visitDate: form.visitDate,
      hospitalName: form.hospitalName.trim(),
      doctorName: form.doctorName.trim(),
      symptoms: form.symptoms.trim(),
      // 예약/접종은 일정 내용을 diagnosis 컬럼에 저장
      diagnosis: isUpcoming ? form.purpose.trim() : form.diagnosis.trim(),
      babyWeightKg: weight,
      babyHeightCm: height,
      isUpcoming,
      medicineChecked: form.medicineChecked,
    })

    if (!result?.error) {
      setForm(createInitialForm(isUpcoming))
    } else {
      setError(result.error)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]"
    >
      <h2 className="text-sm font-semibold text-stone-800">
        {isUpcoming ? '예약/접종 추가' : '진료 기록 추가'}
      </h2>

      <TimePicker
        title={isUpcoming ? '언제 예약인가요?' : '언제 다녀왔나요?'}
        value={form.visitDate}
        onChange={(visitDate) => updateForm({ visitDate })}
        allowFuture={isUpcoming}
        pastDays={isUpcoming ? 0 : 60}
        futureDays={180}
      />

      {isUpcoming && (
        <div>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">
              무슨 일정인가요?
            </span>
            <input
              type="text"
              value={form.purpose}
              onChange={(e) => updateForm({ purpose: e.target.value })}
              placeholder="예: BCG 접종, 영유아 검진"
              className="min-h-12 w-full rounded-xl bg-[#FDFBF7] px-3 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
            />
          </label>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {UPCOMING_PURPOSE_PRESETS.map((preset) => (
              <ChipButton
                key={preset}
                selected={form.purpose === preset}
                onClick={() => updateForm({ purpose: preset })}
                className="!min-h-10 px-3 text-xs"
              >
                {preset}
              </ChipButton>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-500">
            병원
          </span>
          <input
            type="text"
            value={form.hospitalName}
            onChange={(e) => updateForm({ hospitalName: e.target.value })}
            placeholder="소아과"
            className="min-h-12 w-full rounded-xl bg-[#FDFBF7] px-3 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-500">
            의사
          </span>
          <input
            type="text"
            value={form.doctorName}
            onChange={(e) => updateForm({ doctorName: e.target.value })}
            placeholder="담당의"
            className="min-h-12 w-full rounded-xl bg-[#FDFBF7] px-3 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
          />
        </label>
      </div>

      {!isUpcoming && (
        <>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">
              증상
            </span>
            <textarea
              value={form.symptoms}
              onChange={(e) => updateForm({ symptoms: e.target.value })}
              rows={2}
              className="min-h-16 w-full resize-none rounded-xl bg-[#FDFBF7] px-3 py-2.5 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-stone-500">
              진료/처방
            </span>
            <textarea
              value={form.diagnosis}
              onChange={(e) => updateForm({ diagnosis: e.target.value })}
              rows={2}
              className="min-h-16 w-full resize-none rounded-xl bg-[#FDFBF7] px-3 py-2.5 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
            />
          </label>
        </>
      )}

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-500">
            몸무게 (kg)
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            value={form.babyWeightKg}
            onChange={(e) => updateForm({ babyWeightKg: e.target.value })}
            placeholder="3.50"
            className="min-h-12 w-full rounded-xl bg-[#FDFBF7] px-3 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-500">
            키 (cm)
          </span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="0"
            value={form.babyHeightCm}
            onChange={(e) => updateForm({ babyHeightCm: e.target.value })}
            placeholder="52.0"
            className="min-h-12 w-full rounded-xl bg-[#FDFBF7] px-3 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
          />
        </label>
      </div>

      {!isUpcoming && (
        <ChipButton
          selected={form.medicineChecked}
          onClick={() =>
            updateForm({ medicineChecked: !form.medicineChecked })
          }
          className="w-full"
        >
          투약 완료
        </ChipButton>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSaving}
        className="min-h-12 w-full rounded-2xl bg-[#3D8B5A] text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSaving ? '저장 중…' : '저장하기'}
      </button>
    </form>
  )
}

export default MedicalForm
