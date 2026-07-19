import { BOTTLE_ML_TYPES } from '@/constants/careLog'

function MlInputRow({ emoji, label, value, onChange }) {
  return (
    <label className="flex items-center gap-3 rounded-xl bg-[#FDFBF7] p-3 ring-1 ring-[#E8E2D9]/80">
      <span className="w-24 shrink-0 text-sm font-medium text-stone-700">
        {emoji} {label}
      </span>
      <div className="flex flex-1 items-center gap-2">
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
      </div>
    </label>
  )
}

/**
 * 수유 입력. 분유/유축 모유/이유식을 각각 ml로 독립 입력할 수 있어
 * "유축 모유 8ml + 분유 70ml"처럼 한 번에 함께 기록할 수 있다.
 */
function FeedingSection({
  formulaMl,
  pumpedMl,
  foodMl,
  onFormulaMlChange,
  onPumpedMlChange,
  onFoodMlChange,
}) {
  const bottleMlChangeHandlers = {
    formula: onFormulaMlChange,
    pumped: onPumpedMlChange,
    food: onFoodMlChange,
  }
  const bottleMlValues = { formula: formulaMl, pumped: pumpedMl, food: foodMl }

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <h2 className="mb-1 text-sm font-semibold text-stone-800">🍼 수유</h2>
      <p className="mb-3 text-xs text-stone-400">
        여러 종류를 동시에 기록할 수 있어요.
      </p>
      <div className="grid gap-2">
        {BOTTLE_ML_TYPES.map((item) => (
          <MlInputRow
            key={item.value}
            emoji={item.emoji}
            label={item.label}
            value={bottleMlValues[item.value]}
            onChange={bottleMlChangeHandlers[item.value]}
          />
        ))}
      </div>
    </section>
  )
}

export default FeedingSection
