function SummaryCard({ label, value, unit }) {
  return (
    <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#E8E2D9]">
      <p className="text-xs font-medium text-stone-500">{label}</p>
      <p className="mt-1.5 text-xl font-semibold text-stone-800">
        {value}
        {unit && (
          <span className="ml-0.5 text-sm font-medium text-stone-500">
            {unit}
          </span>
        )}
      </p>
    </div>
  )
}

function SummaryCards({ summary, averageIntervalLabel, averageDailyFeedingMl }) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#E8E2D9]">
        <p className="text-xs font-medium text-stone-500">오늘 수유량</p>
        <p className="mt-1.5 text-xl font-semibold text-stone-800">
          {summary.totalMl}
          <span className="ml-0.5 text-sm font-medium text-stone-500">ml</span>
        </p>
        <p className="mt-0.5 text-[10px] text-stone-400">오늘 {summary.feedingCount}회</p>
      </div>

      <div className="rounded-2xl bg-white p-3.5 ring-1 ring-[#E8E2D9]">
        <p className="text-xs font-medium text-stone-500">평균 수유량</p>
        {averageDailyFeedingMl != null ? (
          <>
            <p className="mt-1.5 text-xl font-semibold text-stone-800">
              {averageDailyFeedingMl}
              <span className="ml-0.5 text-sm font-medium text-stone-500">ml</span>
            </p>
            <p className="mt-0.5 text-[10px] text-stone-400">
              최근 7일 · 9회+ 먹은 날 기준
            </p>
          </>
        ) : (
          <p className="mt-1.5 text-xs leading-relaxed text-stone-500">
            하루 9회 이상 먹은 날이 쌓이면 계산돼요.
          </p>
        )}
      </div>

      <SummaryCard label="소변" value={summary.peeCount} unit="회" />
      <SummaryCard label="대변" value={summary.poopCount} unit="회" />

      <div className="col-span-2 rounded-2xl bg-white p-3.5 ring-1 ring-[#E8E2D9]">
        <p className="text-xs font-medium text-stone-500">오늘의 평균 수유 텀</p>
        {averageIntervalLabel ? (
          <p className="mt-1.5 text-xl font-semibold text-[#2F6B45]">
            {averageIntervalLabel}
          </p>
        ) : (
          <p className="mt-1.5 text-sm text-stone-500">
            수유가 2회 이상 기록되면 계산돼요.
          </p>
        )}
      </div>
    </div>
  )
}

export default SummaryCards
