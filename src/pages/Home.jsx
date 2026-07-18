import SummaryCards from '@/components/home/SummaryCards'
import FeedingTimer from '@/components/home/FeedingTimer'
import NextFeedingCard from '@/components/home/NextFeedingCard'
import PatternCharts from '@/components/home/PatternCharts'
import { useCareLogs } from '@/hooks/useCareLogs'
import { useMedicalLogs } from '@/hooks/useMedicalLogs'
import { useFeedingAlarmContext } from '@/context/FeedingAlarmContext'
import {
  formatMinutesDuration,
  getDailyFeedingTotals,
  getFeedingHeatmap,
  getFeedingHourlyPattern,
  getLastFeedingAt,
  getTodayAverageFeedingIntervalMinutes,
  getTodaySummary,
  getWeightTrend,
} from '@/utils/dashboardStats'

function Home() {
  const { logs, isLoading, error } = useCareLogs({ enableRealtime: true })
  const { logs: medicalLogs } = useMedicalLogs({ enableRealtime: true })
  const alarm = useFeedingAlarmContext()

  const summary = getTodaySummary(logs)
  const lastFeedingAt = getLastFeedingAt(logs)
  const averageIntervalLabel = formatMinutesDuration(
    getTodayAverageFeedingIntervalMinutes(logs),
  )
  const hourlyPattern = getFeedingHourlyPattern(logs)
  const dailyTotals = getDailyFeedingTotals(logs)
  const heatmap = getFeedingHeatmap(logs)
  const weightTrend = getWeightTrend(medicalLogs)

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
      ) : (
        <>
          <FeedingTimer lastFeedingAt={lastFeedingAt} />
          <NextFeedingCard alarm={alarm} />
          <SummaryCards
            summary={summary}
            averageIntervalLabel={averageIntervalLabel}
          />
          <PatternCharts
            hourlyPattern={hourlyPattern}
            weightTrend={weightTrend}
            dailyTotals={dailyTotals}
            heatmap={heatmap}
          />
        </>
      )}
    </section>
  )
}

export default Home
