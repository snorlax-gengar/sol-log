import { useState } from 'react'
import ChipButton from '@/components/quickLog/ChipButton'
import TimePicker from '@/components/quickLog/TimePicker'
import { UPCOMING_PURPOSE_PRESETS } from '@/constants/medical'

// 새로 추가할 때는 탭(isUpcoming)을 기준으로, 기존 기록을 수정할 때는
// 그 기록 고유의 종류(editingLog.is_upcoming)를 기준으로 초기값을 만든다.
// (수정 중에는 페이지 상단 탭을 눌러도 폼 종류가 바뀌면 안 되므로 분리)
function createInitialForm(isUpcoming, editingLog) {
  if (editingLog) {
    return {
      visitDate: new Date(editingLog.visit_date),
      purpose: editingLog.is_upcoming ? editingLog.diagnosis || '' : '',
      hospitalName: editingLog.hospital_name || '',
      department: editingLog.department || '',
      doctorName: editingLog.doctor_name || '',
      symptoms: editingLog.symptoms || '',
      diagnosis: editingLog.is_upcoming ? '' : editingLog.diagnosis || '',
      babyWeightKg:
        editingLog.baby_weight_kg != null
          ? String(editingLog.baby_weight_kg)
          : '',
      babyHeightCm:
        editingLog.baby_height_cm != null
          ? String(editingLog.baby_height_cm)
          : '',
      isUpcoming: Boolean(editingLog.is_upcoming),
      medicineChecked: Boolean(editingLog.medicine_checked),
    }
  }

  return {
    visitDate: new Date(),
    purpose: '', // 예약/접종 일정 내용 (diagnosis 컬럼에 저장)
    hospitalName: '',
    department: '',
    doctorName: '',
    symptoms: '',
    diagnosis: '',
    babyWeightKg: '',
    babyHeightCm: '',
    isUpcoming,
    medicineChecked: false,
  }
}

function MedicalForm({
  isUpcoming,
  onSubmit,
  isSaving,
  editingLog = null,
  onSave,
  onCancelEdit,
}) {
  const [form, setForm] = useState(() =>
    createInitialForm(isUpcoming, editingLog),
  )
  const [error, setError] = useState('')

  // 수정 중인 기록 자체의 종류를 기준으로 필드를 보여준다 (상단 탭과 무관)
  const formIsUpcoming = form.isUpcoming

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

    if (formIsUpcoming && !form.purpose.trim()) {
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

    if (editingLog) {
      const patch = {
        visit_date: form.visitDate.toISOString(),
        hospital_name: form.hospitalName.trim() || null,
        department: form.department.trim() || null,
        doctor_name: form.doctorName.trim() || null,
        symptoms: formIsUpcoming
          ? editingLog.symptoms
          : form.symptoms.trim() || null,
        // 예약/접종은 일정 내용을 diagnosis 컬럼에 저장
        diagnosis: formIsUpcoming
          ? form.purpose.trim()
          : form.diagnosis.trim() || null,
        baby_weight_kg: weight,
        baby_height_cm: height,
        medicine_checked: formIsUpcoming
          ? editingLog.medicine_checked
          : form.medicineChecked,
      }

      const result = await onSave(patch)
      if (!result?.error) {
        onCancelEdit?.()
      } else {
        setError(result.error)
      }
      return
    }

    const result = await onSubmit({
      visitDate: form.visitDate,
      hospitalName: form.hospitalName.trim(),
      department: form.department.trim(),
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
        {editingLog
          ? formIsUpcoming
            ? '예약/접종 수정'
            : '진료 기록 수정'
          : isUpcoming
            ? '예약/접종 추가'
            : '진료 기록 추가'}
      </h2>

      <TimePicker
        title={formIsUpcoming ? '언제 예약인가요?' : '언제 다녀왔나요?'}
        value={form.visitDate}
        onChange={(visitDate) => updateForm({ visitDate })}
        allowFuture={formIsUpcoming}
        pastDays={formIsUpcoming ? 0 : 60}
        futureDays={180}
      />

      {formIsUpcoming && (
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

      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-stone-500">
          병원명
        </span>
        <input
          type="text"
          value={form.hospitalName}
          onChange={(e) => updateForm({ hospitalName: e.target.value })}
          placeholder="OO소아청소년과의원"
          className="min-h-12 w-full rounded-xl bg-[#FDFBF7] px-3 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
        />
      </label>

      <div className="grid grid-cols-2 gap-2">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-500">
            진료과
          </span>
          <input
            type="text"
            value={form.department}
            onChange={(e) => updateForm({ department: e.target.value })}
            placeholder="소아청소년과"
            className="min-h-12 w-full rounded-xl bg-[#FDFBF7] px-3 text-sm ring-1 ring-[#E8E2D9] outline-none focus:ring-2 focus:ring-[#3D8B5A]/40"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-stone-500">
            담당의
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

      {!formIsUpcoming && (
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

      {!formIsUpcoming && (
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

      <div className="flex gap-2">
        {editingLog && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="min-h-12 flex-1 rounded-2xl bg-white text-sm font-semibold text-stone-600 ring-1 ring-[#E8E2D9]"
          >
            취소
          </button>
        )}
        <button
          type="submit"
          disabled={isSaving}
          className="min-h-12 flex-1 rounded-2xl bg-[#3D8B5A] text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? '저장 중…' : editingLog ? '수정 저장' : '저장하기'}
        </button>
      </div>
    </form>
  )
}

export default MedicalForm
