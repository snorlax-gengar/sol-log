import ChipButton from '@/components/quickLog/ChipButton'
import BreastTimerPanel from '@/components/quickLog/BreastTimerPanel'
import {
  AMOUNT_FEEDING_TYPES,
  FEEDING_TYPES,
  MINUTE_QUICK_ADD,
  ML_PRESETS,
  ML_QUICK_ADD,
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
        <div className="mt-3 grid gap-3">
          <QuickAddRow
            label="용량"
            value={feedingAmountMl}
            unit="ml"
            amounts={ML_QUICK_ADD}
            onAdd={(n) => onAmountChange(feedingAmountMl + n)}
            onReset={() => onAmountChange(0)}
          />
          <div>
            <p className="mb-2 text-xs font-medium text-stone-500">추천 용량</p>
            <div className="flex flex-wrap gap-2">
              {ML_PRESETS.map((ml) => (
                <ChipButton
                  key={ml}
                  selected={feedingAmountMl === ml}
                  onClick={() => onAmountChange(ml)}
                >
                  {ml}ml
                </ChipButton>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default FeedingSection
