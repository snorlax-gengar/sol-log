import SummaryCards from '@/components/home/SummaryCards'
import FeedingTimer from '@/components/home/FeedingTimer'
import NextFeedingCard from '@/components/home/NextFeedingCard'
// 오늘 수유 시간표(파이 차트)는 반응이 별로라 우선 비활성화.
// 컴포넌트(FeedingClock.jsx)와 데이터 함수(getTodayFeedingTimes)는
// 나중에 다른 형태로 변형해 쓸 수 있도록 지우지 않고 남겨둠.
// import FeedingClock from '@/components/home/FeedingClock'
import PatternCharts from '@/components/home/PatternCharts'
import { useCareLogsContext } from '@/context/CareLogsContext'
import { useMedicalLogsContext } from '@/context/MedicalLogsContext'
import { useFeedingAlarmContext } from '@/context/FeedingAlarmContext'
import { useHomeVisibility } from '@/context/HomeVisibilityContext'
import {
  formatMinutesDuration,
  getAverageDailyFeedingMl,
  getDailyFeedingTotals,
  getFeedingHeatmap,
  getLastFeedingAt,
  getTodayAverageFeedingIntervalMinutes,
  // getTodayFeedingTimes, // FeedingClock 전용 — 아래 참고
  getTodaySummary,
  getWeightTrend,
} from '@/utils/dashboardStats'
import { hasAnyHomeSectionVisible } from '@/utils/homeVisibility'

function Home() {
  const { logs, isLoading, error } = useCareLogsContext()
  const { logs: medicalLogs } = useMedicalLogsContext()
  const alarm = useFeedingAlarmContext()
  const { visibility } = useHomeVisibility()

  const summary = getTodaySummary(logs)
  const lastFeedingAt = getLastFeedingAt(logs)
  const averageIntervalLabel = formatMinutesDuration(
    getTodayAverageFeedingIntervalMinutes(logs),
  )
  const averageDailyFeedingMl = getAverageDailyFeedingMl(logs)
  // const todayFeedingTimes = getTodayFeedingTimes(logs) // FeedingClock 전용 — 아래 참고
  const dailyTotals = getDailyFeedingTotals(logs)
  const heatmap = getFeedingHeatmap(logs)
  const weightTrend = getWeightTrend(medicalLogs)
  const anyVisible = hasAnyHomeSectionVisible(visibility)

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-800">홈</h1>
        <p className="mt-1 text-sm text-stone-500">
          오늘 요약과 최근 패턴을 한눈에 확인해요.
        </p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}

      {isLoading ? (
        <div className="rounded-2xl bg-[#E6F4EA] px-4 py-5 text-sm text-stone-600">
          대시보드를 불러오는 중…
        </div>
      ) : !anyVisible ? (
        <div className="rounded-2xl bg-[#E6F4EA] px-4 py-5 text-sm text-stone-600">
          표시할 홈 항목이 없어요. 상단 계정 설정에서 다시 켤 수 있어요.
        </div>
      ) : (
        <>
          {visibility.feedingTimer && (
            <FeedingTimer lastFeedingAt={lastFeedingAt} />
          )}
          {visibility.nextFeeding && <NextFeedingCard alarm={alarm} />}
          {visibility.summaryCards && (
            <SummaryCards
              summary={summary}
              averageIntervalLabel={averageIntervalLabel}
              averageDailyFeedingMl={averageDailyFeedingMl}
            />
          )}
          {/*
            오늘 수유 시간표(파이 차트) — 반응이 별로라 우선 비활성화.
            나중에 다른 형태로 변형해 쓰고 싶으면 아래 주석을 풀고
            위쪽 import/todayFeedingTimes 주석도 함께 풀면 됨.
            <FeedingClock times={todayFeedingTimes} />
          */}
          <PatternCharts
            weightTrend={weightTrend}
            dailyTotals={dailyTotals}
            heatmap={heatmap}
            showDailyTotals={visibility.dailyTotals}
            showHeatmap={visibility.heatmap}
            showWeightTrend={visibility.weightTrend}
          />
        </>
      )}
    </section>
  )
}

export default Home
