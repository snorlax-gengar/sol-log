import { BOTTLE_ML_INPUT_TYPES, BREAST_TYPES } from '@/constants/careLog'

const BOTTLE_META = new Map(BOTTLE_ML_INPUT_TYPES.map((item) => [item.value, item]))

function FeedingRow({ emoji, label, children }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-[#FDFBF7] p-3 ring-1 ring-[#E8E2D9]/80">
      <span className="w-24 shrink-0 text-sm font-medium text-stone-700">
        {emoji} {label}
      </span>
      <div className="flex flex-1 items-center gap-2">{children}</div>
    </div>
  )
}

function MlInputRow({ type, value, onChange }) {
  const meta = BOTTLE_META.get(type)
  return (
    <FeedingRow emoji={meta?.emoji} label={meta?.label ?? type}>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={value === 0 ? '' : String(value)}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
          onChange(digits === '' ? 0 : Number(digits))
        }}
        placeholder="0"
        className="min-h-11 w-full rounded-xl bg-white px-3 text-right text-base font-bold text-stone-800 ring-1 ring-[#E8E2D9] outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-[#3D8B5A]/40"
      />
      <span className="shrink-0 text-sm font-semibold text-stone-500">ml</span>
    </FeedingRow>
  )
}

// 모유는 용량이 아니라 방식(직수/유축)만 구분하므로, ml 입력 대신
// 같은 행 안에 두 개짜리 세그먼트 토글을 둔다. 같은 값을 다시 누르면 선택 해제.
function BreastTypeRow({ value, onChange }) {
  return (
    <FeedingRow emoji="🤱" label="모유">
      {BREAST_TYPES.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(value === item.value ? null : item.value)}
          className={`min-h-11 flex-1 rounded-xl text-sm font-semibold ring-1 transition-colors ${
            value === item.value
              ? 'bg-[#3D8B5A] text-white ring-[#3D8B5A]'
              : 'bg-white text-stone-600 ring-[#E8E2D9]'
          }`}
        >
          {item.label}
        </button>
      ))}
    </FeedingRow>
  )
}

/**
 * 수유 입력. 기존처럼 "라벨 + 값" 한 줄짜리 행을 위에서 아래로 쌓아 보여준다.
 * - 분유: ml 입력
 * - 모유: 용량 대신 방식(직수/유축)만 토글로 선택 (같은 값 다시 탭하면 해제)
 * - 이유식: ml 입력
 */
function FeedingSection({
  formulaMl,
  breastType,
  foodMl,
  onFormulaMlChange,
  onBreastTypeChange,
  onFoodMlChange,
}) {
  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <h2 className="mb-1 text-sm font-semibold text-stone-800">🍼 수유</h2>
      <p className="mb-3 text-xs text-stone-400">
        여러 종류를 동시에 기록할 수 있어요.
      </p>
      <div className="grid gap-2">
        <MlInputRow type="formula" value={formulaMl} onChange={onFormulaMlChange} />
        <BreastTypeRow value={breastType} onChange={onBreastTypeChange} />
        <MlInputRow type="food" value={foodMl} onChange={onFoodMlChange} />
      </div>
    </section>
  )
}

export default FeedingSection
