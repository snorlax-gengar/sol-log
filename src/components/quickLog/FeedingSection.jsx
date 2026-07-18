import ChipButton from '@/components/quickLog/ChipButton'
import BreastTimerPanel from '@/components/quickLog/BreastTimerPanel'
import {
  AMOUNT_FEEDING_TYPES,
  FEEDING_TYPES,
  MINUTE_QUICK_ADD,
} from '@/constants/careLog'

function QuickAddRow({ label, value, unit, onAdd, onReset, amounts }) {
  return (
    <div className="rounded-xl bg-[#FDFBF7] p-3 ring-1 ring-[#E8E2D9]/80">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-medium text-stone-700">{label}</p>
        <p className="text-sm font-semibold text-[#2F6B45]">
          {value}
          {unit}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {amounts.map((amount) => (
          <ChipButton key={amount} onClick={() => onAdd(amount)}>
            +{amount}
            {unit}
          </ChipButton>
        ))}
        <ChipButton onClick={onReset} className="text-stone-500">
          초기화
        </ChipButton>
      </div>
    </div>
  )
}

function FeedingSection({
  feedingType,
  feedingAmountMl,
  breastLeftMinutes,
  breastRightMinutes,
  onFeedingTypeChange,
  onAmountChange,
  onLeftMinutesChange,
  onRightMinutesChange,
  breastTimer,
  onTimerFinish,
}) {
  const showAmount = AMOUNT_FEEDING_TYPES.has(feedingType)
  const showBreast = feedingType === 'breast'

  return (
    <section className="rounded-2xl bg-white p-4 ring-1 ring-[#E8E2D9]">
      <h2 className="mb-3 text-sm font-semibold text-stone-800">수유</h2>

      <div className="flex flex-wrap gap-2">
        {FEEDING_TYPES.map((item) => (
          <ChipButton
            key={item.value}
            selected={feedingType === item.value}
            onClick={() => onFeedingTypeChange(item.value)}
          >
            {item.label}
          </ChipButton>
        ))}
      </div>

      {showBreast && (
        <div className="mt-3 grid gap-3">
          {breastTimer && (
            <BreastTimerPanel timer={breastTimer} onFinish={onTimerFinish} />
          )}
          <QuickAddRow
            label="왼쪽"
            value={breastLeftMinutes}
            unit="분"
            amounts={MINUTE_QUICK_ADD}
            onAdd={(n) => onLeftMinutesChange(breastLeftMinutes + n)}
            onReset={() => onLeftMinutesChange(0)}
          />
          <QuickAddRow
            label="오른쪽"
            value={breastRightMinutes}
            unit="분"
            amounts={MINUTE_QUICK_ADD}
            onAdd={(n) => onRightMinutesChange(breastRightMinutes + n)}
            onReset={() => onRightMinutesChange(0)}
          />
        </div>
      )}

      {showAmount && (
        <div className="mt-3">
          <label className="block rounded-xl bg-[#FDFBF7] p-3 ring-1 ring-[#E8E2D9]/80">
            <span className="mb-2 block text-xs font-medium text-stone-500">
              용량 (ml)
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={feedingAmountMl === 0 ? '' : String(feedingAmountMl)}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 4)
                  onAmountChange(digits === '' ? 0 : Number(digits))
                }}
                placeholder="0"
                className="min-h-12 w-full rounded-xl bg-white px-3 text-right text-lg font-bold text-stone-800 ring-1 ring-[#E8E2D9] outline-none placeholder:text-stone-300 focus:ring-2 focus:ring-[#3D8B5A]/40"
              />
              <span className="shrink-0 text-sm font-semibold text-stone-500">
                ml
              </span>
            </div>
          </label>
        </div>
      )}
    </section>
  )
}

export default FeedingSection
